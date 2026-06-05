import os
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_percentage_error

def train_and_save():
    # Paths
    csv_path = "ml/datasets/Lands_of _Nashik.csv"
    models_dir = "ml/valuation/models"
    encoders_dir = "ml/valuation/encoders"
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(encoders_dir, exist_ok=True)
    
    print(f"Reading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Fit and save individual label encoders
    categorical_cols = ['Village', 'Taluka', 'Soil_Type', 'Land_Type', 'Water_Source']
    encoders = {}
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoder_path = os.path.join(encoders_dir, f"{col}_encoder.joblib")
        joblib.dump(le, encoder_path)
        print(f"Saved encoder for {col} to {encoder_path}")
    
    # Split features and target
    X = df.drop("Price_Per_Acre", axis=1)
    y = df["Price_Per_Acre"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    
    print(f"Model trained. R2: {r2:.4f}, MAPE: {mape*100:.2f}%")
    
    # Save model
    model_path = os.path.join(models_dir, "land_price_model.pkl")
    joblib.dump(model, model_path)
    print(f"Saved model to {model_path}")

if __name__ == "__main__":
    train_and_save()
