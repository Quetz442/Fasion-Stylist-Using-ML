from django.urls import path
from .views import RecommendationView, MetadataView, SeasonalColourView, BodyShapesView, SeasonRecommendationsView

urlpatterns = [
    path("recommend/", RecommendationView.as_view(), name="recommend"),
    path("metadata/", MetadataView.as_view(), name="metadata"),
    path("seasonal-colour/", SeasonalColourView.as_view(), name="seasonal-colour"),
    path('body-shapes/', BodyShapesView.as_view(), name='body-shapes'),
    path('season-recommendations/', SeasonRecommendationsView.as_view(), name='season-recommendations'),
]
