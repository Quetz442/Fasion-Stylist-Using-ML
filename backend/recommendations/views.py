from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os

# Import your model-based recommender
from .bodyshape import ClothingRecommender

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
