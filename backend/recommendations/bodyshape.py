import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

class ClothingRecommender:
    def __init__(self, data_path):
        """Initialize the recommender with a CSV file path."""
        try:
            self.df = pd.read_csv(data_path)
            self.original_df = self.df.copy()
            self.label_encoders = {}
            self.models = {}

            # Initialize encoders
            self._encode_categories()

            # Train models
            self._train_models()

            print(f"Recommender initialized with {len(self.df)} items.")
        except Exception as e:
            print(f"Error initializing recommender: {e}")
            # Create a fallback dataset with sample data
            self._create_fallback_data()
            self._encode_categories()
            self._train_models()

    def _create_fallback_data(self):
        """Create sample data if the CSV file cannot be loaded."""
        data = {
            'Body Shape': ['Hourglass', 'Pear', 'Apple', 'Inverted Triangle', 'Rectangle'] * 10,
            'Clothing Category': ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Indian Ethnic Wear'] * 10,
            'Clothing Type': [
                'Structured blazer', 'Bootcut jeans', 'Ruched dress', 'Embellished blazer', 'Floor-length gown with dupatta',
                'V-neck top', 'A-line skirt', 'Wrap dress', 'Tailored jacket', 'Anarkali suit',
                'Peplum top', 'Wide-leg pants', 'Fit-and-flare dress', 'Cropped jacket', 'Saree with structured blouse',
                'Scoop neck top', 'Straight leg jeans', 'Shift dress', 'Bomber jacket', 'Sharara suit',
                'Boat neck top', 'Cigarette pants', 'Maxi dress', 'Denim jacket', 'Lehenga with short choli'
            ] * 2,
            'Occasion': ['Formal', 'Casual', 'Party', 'Workwear', 'Streetwear'] * 10
        }
        self.df = pd.DataFrame(data)
        self.original_df = self.df.copy()

    def _encode_categories(self):
        """Encode categorical features."""
        for column in ['Body Shape', 'Clothing Category', 'Clothing Type', 'Occasion']:
            if column in self.df.columns:
                le = LabelEncoder()
                self.df[column] = le.fit_transform(self.df[column])
                self.label_encoders[column] = le

    def _train_models(self):
        """Train a model for each clothing category."""
        try:
            X = self.df[['Body Shape', 'Occasion']]

            for category in self.get_clothing_categories():
                category_encoded = self.label_encoders['Clothing Category'].transform([category])[0]
                category_data = self.df[self.df['Clothing Category'] == category_encoded]

                if len(category_data) > 0:
                    y = category_data['Clothing Type']
                    X_cat = X.loc[category_data.index]

                    if len(X_cat) > 1:  # Ensure we have enough data to split
                        X_train, X_test, y_train, y_test = train_test_split(
                            X_cat, y, test_size=0.2, random_state=42
                        )

                        model = RandomForestClassifier(n_estimators=100, random_state=42)
                        model.fit(X_train, y_train)

                        self.models[category] = model
        except Exception as e:
            print(f"Error training models: {e}")

    def get_body_shapes(self):
        """Return list of available body shapes."""
        return self.original_df['Body Shape'].unique().tolist()

    def get_occasions(self):
        """Return list of available occasions."""
        return self.original_df['Occasion'].unique().tolist()

    def get_clothing_categories(self):
        """Return list of available clothing categories."""
        return self.original_df['Clothing Category'].unique().tolist()

    def recommend(self, body_shape, occasion=None):
        """Generate clothing recommendations for a body shape and occasion."""
        response = {
            'success': False,
            'recommendations': {},
            'error': None
        }

        try:
            # Debug logging
            print(f"Received recommendation request: body_shape={body_shape}, occasion={occasion}")
            
            # Validate body shape
            if body_shape not in self.get_body_shapes():
                response['error'] = f"'{body_shape}' is not a valid body shape."
                return response

            # Validate or set default occasion
            if occasion and occasion not in self.get_occasions():
                print(f"Warning: '{occasion}' is not a valid occasion. Using default.")
                occasion = None  # fallback to most common
            
            if not occasion:
                most_common_occasion = self.original_df['Occasion'].value_counts().idxmax()
                occasion = most_common_occasion
                print(f"Using default occasion: {occasion}")

            # Encode input features
            body_shape_encoded = self.label_encoders['Body Shape'].transform([body_shape])[0]
            occasion_encoded = self.label_encoders['Occasion'].transform([occasion])[0]

            X_pred = pd.DataFrame([[body_shape_encoded, occasion_encoded]], columns=['Body Shape', 'Occasion'])

            # Predict recommendations
            for category, model in self.models.items():
                try:
                    type_encoded = model.predict(X_pred)[0]
                    type_name = self.label_encoders['Clothing Type'].inverse_transform([type_encoded])[0]
                    response['recommendations'][category] = type_name
                except Exception as e:
                    print(f"Error predicting for category {category}: {e}")
                    # Provide a fallback recommendation
                    category_df = self.original_df[self.original_df['Clothing Category'] == category]
                    if not category_df.empty:
                        matching_items = category_df[category_df['Body Shape'] == body_shape]
                        if not matching_items.empty:
                            response['recommendations'][category] = matching_items['Clothing Type'].iloc[0]
                        else:
                            response['recommendations'][category] = category_df['Clothing Type'].iloc[0]

            response['success'] = True
            return response

        except Exception as e:
            print(f"Error in recommend function: {e}")
            response['error'] = str(e)
            return response