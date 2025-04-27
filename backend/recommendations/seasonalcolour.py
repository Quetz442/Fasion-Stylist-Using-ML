import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from collections import Counter
import json

class SeasonalColorRecommender:
    def __init__(self, data_path):
        """Initialize the seasonal color recommender with a CSV file path."""
        try:
            self.df = pd.read_csv(data_path)
            self.original_df = self.df.copy()
            self.label_encoders = {}
            self.models = {}

            # Initialize encoders
            self._encode_categories()

            # Train models
            self._train_models()

            print(f"Color recommender initialized with {len(self.df)} items.")
        except Exception as e:
            print(f"Error initializing color recommender: {e}")
            # Create a fallback dataset with sample data
            self._create_fallback_data()
            self._encode_categories()
            self._train_models()

    def _create_fallback_data(self):
        """Create sample data if the CSV file cannot be loaded."""
        data = {
            'Seasonal Colour': ['Summer', 'Winter', 'Autumn', 'Spring'] * 10,
            'Complimentary Colours': [
                'Lavender', 'Crimson', 'Mustard', 'Coral',
                'Sky Blue', 'Royal Blue', 'Burnt Orange', 'Peach',
                'Powder Pink', 'Emerald', 'Olive Green', 'Mint',
                'Rose', 'Fuchsia', 'Teal', 'Turquoise',
                'Soft Blue', 'Charcoal', 'Rust', 'Light Green'
            ] * 2,
            'Recommended Colour Combinations': [
                'Lavender & Sky Blue', 'Emerald & Charcoal', 'Mustard & Olive Green', 'Coral & Turquoise',
                'Soft Blue & Powder Pink', 'Royal Blue & Silver', 'Rust & Teal', 'Peach & Mint',
                'Rose & Mint', 'Fuchsia & Black', 'Burnt Orange & Brown', 'Light Green & Yellow',
                'Lavender & Sky Blue', 'Fuchsia & Black', 'Mustard & Olive Green', 'Coral & Turquoise',
                'Soft Blue & Powder Pink', 'Royal Blue & Silver', 'Burnt Orange & Brown', 'Peach & Mint'
            ] * 2
        }
        self.df = pd.DataFrame(data)
        self.original_df = self.df.copy()

    def _encode_categories(self):
        """Encode categorical features."""
        for column in ['Seasonal Colour', 'Complimentary Colours', 'Recommended Colour Combinations']:
            if column in self.df.columns:
                le = LabelEncoder()
                self.df[column] = le.fit_transform(self.df[column])
                self.label_encoders[column] = le

    def _train_models(self):
        """Train models for color recommendations."""
        try:
            # Train model to predict complementary colors
            X_season = self.df[['Seasonal Colour']]
            y_complimentary = self.df['Complimentary Colours']
            y_combinations = self.df['Recommended Colour Combinations']

            # Split data for complementary colors model
            X_train_comp, X_test_comp, y_train_comp, y_test_comp = train_test_split(
                X_season, y_complimentary, test_size=0.2, random_state=42
            )

            # Train complementary colors model
            comp_model = RandomForestClassifier(n_estimators=100, random_state=42)
            comp_model.fit(X_train_comp, y_train_comp)
            self.models['complementary_colors'] = comp_model

            # Split data for color combinations model
            X_train_comb, X_test_comb, y_train_comb, y_test_comb = train_test_split(
                X_season, y_combinations, test_size=0.2, random_state=42
            )

            # Train color combinations model
            comb_model = RandomForestClassifier(n_estimators=100, random_state=42)
            comb_model.fit(X_train_comb, y_train_comb)
            self.models['color_combinations'] = comb_model

        except Exception as e:
            print(f"Error training models: {e}")

    def get_season_recommendations(self, user_season):
        """Get recommendations for a specific season provided by the user."""
        # Validate season input (case-insensitive check)
        valid_seasons = sorted(self.original_df['Seasonal Colour'].unique().tolist())
        season_match = next((s for s in valid_seasons if s.lower() == user_season.lower()), None)
        
        if not season_match:
            return {
                "error": f"Invalid season '{user_season}'. Valid options are: {', '.join(valid_seasons)}"
            }
        
        # Use the correct case from our data
        season = season_match
        
        # Get complementary colors
        season_data = self.original_df[self.original_df['Seasonal Colour'] == season]
        if season_data.empty:
            return {"error": f"No data found for season '{season}'"}
        
        colors_count = Counter(season_data['Complimentary Colours'])
        complementary_colors = [color for color, _ in colors_count.most_common(5)]
        
        # Get color combinations
        combinations_count = Counter(season_data['Recommended Colour Combinations'])
        color_combinations = [combo for combo, _ in combinations_count.most_common(5)]
        
        # Create response dictionary
        response = {
            "season": season,
            "complementary_colors": complementary_colors,
            "color_combinations": color_combinations
        }
        
        return response

    def analyze(self, eye_color, hair_color, skin_tone):
        # Example logic for seasonal color analysis
        if not eye_color or not hair_color or not skin_tone:
            return {"success": False, "error": "Invalid input"}

        # Mock result
        return {
            "success": True,
            "season": "Spring",
            "complementary_colors": ["Peach", "Coral", "Light Green"],
            "color_combinations": [["Peach", "Light Green"], ["Coral", "Yellow"]],
        }

def get_user_season_input():
    """Gets the season input from the user and validates it."""
    valid_seasons = ['summer', 'winter', 'autumn', 'spring']
    
    while True:
        user_input = input("Enter your seasonal color type (Summer, Winter, Autumn, or Spring): ").strip().lower()
        
        if user_input in valid_seasons:
            return user_input
        else:
            print(f"Invalid season. Please enter one of: {', '.join(valid_seasons)}")

# Example usage
if __name__ == "__main__":
    # Create recommender with the dataset
    recommender = SeasonalColorRecommender('seasonalcolour.csv')
    
    # Get user input for their season
    user_season = get_user_season_input()
    
    # Get recommendations for the user's season
    results = recommender.get_season_recommendations(user_season)
    
    # Display the results
    if "error" in results:
        print(f"Error: {results['error']}")
    else:
        print(f"\n{results['season']} Color Recommendations:")
        print("\nComplementary Colors:")
        for i, color in enumerate(results['complementary_colors'], 1):
            print(f"  {i}. {color}")
        
        print("\nRecommended Color Combinations:")
        for i, combo in enumerate(results['color_combinations'], 1):
            print(f"  {i}. {combo}")