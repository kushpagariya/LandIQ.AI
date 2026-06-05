import os
import joblib

for root, dirs, files in os.walk('/content'):
    for file in files:
        if 'Nashik' in file:
            print(os.path.join(root, file))

import pandas as pd
df = pd.read_csv('/content/Lands_of _Nashik.csv')
df

villages = df['Water_Source'].unique()

for village in sorted(villages):
    print(village)

print(df.info())

from sklearn.preprocessing import LabelEncoder

encoders = {}

text_cols = [
    'Village',
    'Taluka',
    'Soil_Type',
    'Land_Type',
    'Water_Source'
]

for col in text_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

print(df.info())

y=df['Price_Per_Acre']
y

x = df.drop('Price_Per_Acre',axis=1)
x

from sklearn.model_selection import train_test_split
x_train,x_test,y_train,y_test= train_test_split(x,y,test_size=0.2,random_state=None)

x_train

x_test

from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(
    n_estimators=100,
    random_state=None
)

model.fit(x_train, y_train)

y_pred = model.predict(x_test)

from sklearn.metrics import r2_score

score = r2_score(y_test, y_pred)

print("R² Score:", score)

print(df.info())



joblib.dump(model, 'land_price_model.pkl')



loaded_model = joblib.load('land_price_model.pkl')

for i in range(5):

  sample = x.iloc[[i]]

  prediction = loaded_model.predict(sample)

  print("Predicted Price:", prediction[0])
  print("Actual Price:", y.iloc[i])

from sklearn.metrics import mean_absolute_percentage_error

y_pred = model.predict(x_test)

mape = mean_absolute_percentage_error(y_test, y_pred)

print("MAPE:", mape * 100, "%")

importance = pd.DataFrame({
    'Feature': x.columns,
    'Importance': model.feature_importances_
})

print(
    importance.sort_values(
        by='Importance',
        ascending=False
    )
)

villages = df['Village'].unique()

for village in sorted(villages):
    print(village)