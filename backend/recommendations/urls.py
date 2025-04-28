from django.urls import path
from .views import (
    RecommendationView,
    MetadataView,
    SeasonalColourView,
    BodyShapesView,
    SeasonRecommendationsView,
    detect_body_shape_image,
    analyze_seasonal_color,
    fetch_recommendation_images  # Import the new function
)

urlpatterns = [
    path("recommend/", RecommendationView.as_view(), name="recommend"),
    path("metadata/", MetadataView.as_view(), name="metadata"),
    path("seasonal-colour/", SeasonalColourView.as_view(), name="seasonal-colour"),
    path("body-shapes/", BodyShapesView.as_view(), name="body-shapes"),
    path("season-recommendations/", SeasonRecommendationsView.as_view(), name="season-recommendations"),
    path("detect-body-shape/", detect_body_shape_image, name="detect-body-shape"),
    path("analyze-seasonal-color/", analyze_seasonal_color, name="analyze-seasonal-color"),
    path("fetch-recommendation-images/", fetch_recommendation_images, name="fetch-recommendation-images"),  # Add the new route
]
