from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os

# Import your model-based recommender
from .bodyshape import ClothingRecommender
from .seasonalcolour import SeasonalColorRecommender  # Import the seasonal color logic

# Initialize the recommender once
recommender = ClothingRecommender(os.path.join(os.path.dirname(__file__), "MOCK_DATA.csv"))

class RecommendationView(APIView):
    def post(self, request):
        body_shape = request.data.get("body_shape")
        occasion = request.data.get("occasion")  # occasion can be None

        if not body_shape:
            return Response({"error": "Body shape is required"}, status=status.HTTP_400_BAD_REQUEST)

        # No need to capitalize manually, let recommender handle exact match
        result = recommender.recommend(body_shape, occasion)

        if result['success']:
            return Response({
                "body_shape": body_shape,
                "occasion": occasion,
                "recommendations": result['recommendations']
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)

class MetadataView(APIView):
    """Optional: To fetch available body shapes and occasions for the frontend."""
    def get(self, request):
        return Response({
            "body_shapes": recommender.get_body_shapes(),
            "occasions": recommender.get_occasions()
        }, status=status.HTTP_200_OK)

class SeasonalColourView(APIView):
    def post(self, request):
        # Extract data from the request
        eye_color = request.data.get("eye_color")
        hair_color = request.data.get("hair_color")
        skin_tone = request.data.get("skin_tone")

        # Validate input
        if not eye_color or not hair_color or not skin_tone:
            return Response({"error": "Eye color, hair color, and skin tone are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Provide the correct data path for SeasonalColorRecommender
        data_path = os.path.join(os.path.dirname(__file__), "seasonalcolour.csv")
        analyzer = SeasonalColorRecommender(data_path)  # Pass the data_path argument

        # Perform seasonal color analysis
        result = analyzer.analyze(eye_color, hair_color, skin_tone)

        # Return the result
        if result['success']:
            return Response({
                "season": result['season'],
                "complementary_colors": result['complementary_colors'],
                "color_combinations": result['color_combinations']
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)

class BodyShapesView(APIView):
    def get(self, request):
        try:
            body_shapes = recommender.get_body_shapes()
            return Response(body_shapes, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SeasonRecommendationsView(APIView):
    def post(self, request):
        user_season = request.data.get("season")
        if not user_season:
            return Response({"error": "Season is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            data_path = os.path.join(os.path.dirname(__file__), "seasonalcolour.csv")
            analyzer = SeasonalColorRecommender(data_path)
            result = analyzer.get_season_recommendations(user_season)

            if "error" in result:
                return Response({"error": result["error"]}, status=status.HTTP_400_BAD_REQUEST)

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
