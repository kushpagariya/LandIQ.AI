import os
import joblib
import logging
import pandas as pd
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("landiq_backend")

class MLValuationService:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.modes = {
            "Village": "Chinchpada",
            "Taluka": "Sinnar",
            "Soil_Type": "Black",
            "Land_Type": "Agricultural",
            "Water_Source": "Borewell"
        }

    def load_model(self):
        # Load encoders
        for col in self.modes.keys():
            path = os.path.join(settings.VALUATION_ENCODERS_DIR, f"{col}_encoder.joblib")
            if os.path.exists(path):
                self.encoders[col] = joblib.load(path)
                logger.info(f"Loaded encoder for {col}.")
            else:
                raise FileNotFoundError(f"Encoder not found at {path}")

        # Load model
        model_path = settings.VALUATION_MODEL_PATH
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            logger.info("Loaded RandomForestRegressor model.")
        else:
            raise FileNotFoundError(f"Model not found at {model_path}")

    def predict(self, property_data: dict) -> dict:
        if self.model is None or not self.encoders:
            raise RuntimeError("Valuation model or encoders not loaded. Call load_model() first.")

        penalties = 0.0
        
        # 1. Village
        village = property_data.get("village", self.modes["Village"])
        enc_village, p_vil = self.encode_value(self.encoders["Village"], "Village", village)
        penalties += p_vil

        # 2. Taluka
        taluka = property_data.get("taluka", self.modes["Taluka"])
        enc_taluka, p_tal = self.encode_value(self.encoders["Taluka"], "Taluka", taluka)
        penalties += p_tal

        # 3. Area_Acre
        area = float(property_data.get("area_acre", 1.0))

        # 4. Soil_Type
        soil_type = property_data.get("soil_type", self.modes["Soil_Type"])
        enc_soil, _ = self.encode_value(self.encoders["Soil_Type"], "Soil_Type", soil_type)

        # 5. Soil_Quality_Score
        sq_score = property_data.get("soil_quality_score")
        if sq_score is None:
            sq_score = 5
            penalties += 0.05
        sq_score = int(sq_score)

        # 6. Land_Type
        land_type = property_data.get("land_type", self.modes["Land_Type"])
        enc_land, _ = self.encode_value(self.encoders["Land_Type"], "Land_Type", land_type)

        # 7. Irrigated
        irrigated = int(property_data.get("irrigated", 0))

        # 8. Road_Touch
        road_touch = int(property_data.get("road_touch", 0))

        # 9. Road_Width_Ft
        road_width = property_data.get("road_width_ft")
        if road_width is None:
            road_width = 15
            penalties += 0.05
        road_width = int(road_width)

        # 10. Distance_To_Highway_KM
        dist_highway = property_data.get("distance_to_highway_km")
        if dist_highway is None:
            dist_highway = 10.0
            penalties += 0.05
        dist_highway = float(dist_highway)

        # 11. Water_Source
        water_src = property_data.get("water_source", self.modes["Water_Source"])
        enc_water, _ = self.encode_value(self.encoders["Water_Source"], "Water_Source", water_src)

        # 12. Number_Of_Owners
        num_owners = int(property_data.get("number_of_owners", 1))

        # 13. Unknown_Registrations
        unk_reg = int(property_data.get("unknown_registrations", 0))

        # 14. Takeover_Risk
        takeover = int(property_data.get("takeover_risk", 0))

        # 15. Avg_Price_Per_Acre_Nearby
        avg_price_nearby = float(property_data.get("avg_price_per_acre_nearby", 0.0))

        # Build feature DataFrame matching features order
        features = pd.DataFrame([{
            "Village": enc_village,
            "Taluka": enc_taluka,
            "Area_Acre": area,
            "Soil_Type": enc_soil,
            "Soil_Quality_Score": sq_score,
            "Land_Type": enc_land,
            "Irrigated": irrigated,
            "Road_Touch": road_touch,
            "Road_Width_Ft": road_width,
            "Distance_To_Highway_KM": dist_highway,
            "Water_Source": enc_water,
            "Number_Of_Owners": num_owners,
            "Unknown_Registrations": unk_reg,
            "Takeover_Risk": takeover,
            "Avg_Price_Per_Acre_Nearby": avg_price_nearby
        }])

        pred_price_per_acre = float(self.model.predict(features)[0])
        estimated_value = pred_price_per_acre * area

        # Calculate confidence
        confidence = max(0.10, 0.80 - penalties)

        # Classification
        asking_price = property_data.get("asking_price")
        if asking_price is not None:
            asking_price = float(asking_price)
            if estimated_value is None or estimated_value <= 0:
                logger.warning(f"Invalid estimated_value: {estimated_value}. Cannot compute classification ratio.")
                classification = "unknown"
            else:
                ratio = asking_price / estimated_value
                if ratio < 0.85:
                    classification = "undervalued"
                elif ratio > 1.15:
                    classification = "overvalued"
                else:
                    classification = "fair"
        else:
            classification = "fair"

        return {
            "estimated_market_value_inr": estimated_value,
            "price_per_acre_inr": pred_price_per_acre,
            "valuation_classification": classification,
            "confidence_score": confidence,
            "model_version": "val_random_forest_v1.0.0"
        }

    def encode_value(self, encoder, col_name, val):
        if val in encoder.classes_:
            return int(encoder.transform([val])[0]), 0.0
        else:
            mode_val = self.modes[col_name]
            mode_encoded = int(encoder.transform([mode_val])[0])
            penalty = 0.15 if col_name == "Village" else (0.10 if col_name == "Taluka" else 0.0)
            return mode_encoded, penalty

ml_valuation_service = MLValuationService()
