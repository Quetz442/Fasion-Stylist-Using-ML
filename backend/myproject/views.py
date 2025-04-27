from django.shortcuts import render

# Create your views here.
import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import os

class ClothingRecommender:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        self.label_encoders = {}
        self.models = {}
        self._encode_categories()
        self._train_models()

    def _encode_categories(self):
        for column in ['Body Shape', 'Clothing Category', 'Clothing Type', 'Occasion']:
            le = LabelEncoder()
            self.df[column] = le.fit_transform(self.df[column])
            self.label_encoders[column] = le

    def _train_models(self):
        X = self.df[['Body Shape', 'Occasion']]
        for category in self.df['Clothing Category'].unique():
            category_data = self.df[self.df['Clothing Category'] == category]
            if len(category_data) > 0:
                y = category_data['Clothing Type']
                X_cat = X.loc[category_data.index]
                X_train, X_test, y_train, y_test = train_test_split(X_cat, y, test_size=0.2, random_state=42)
                model = RandomForestClassifier(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                self.models[category] = model

    def recommend(self, body_shape, occasion=None):
        if body_shape not in self.df['Body Shape'].unique():
            return {"error": "Invalid body shape"}
        body_shape_encoded = self.label_encoders['Body Shape'].transform([body_shape])[0]
        occasion_encoded = self.label_encoders['Occasion'].transform([occasion])[0] if occasion else 0
        X_pred = pd.DataFrame([[body_shape_encoded, occasion_encoded]], columns=['Body Shape', 'Occasion'])
        recommendations = {}
        for category, model in self.models.items():
            try:
                type_encoded = model.predict(X_pred)[0]
                type_name = self.label_encoders['Clothing Type'].inverse_transform([type_encoded])[0]
                recommendations[category] = {'type': type_name}
            except:
                continue
        return recommendations

# Load Model
data_path = os.path.join(os.path.dirname(__file__), 'MOCK_DATA.csv')
recommender = ClothingRecommender(data_path)


