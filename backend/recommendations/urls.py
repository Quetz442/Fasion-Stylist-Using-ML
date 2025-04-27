from django.urls import path
from .views import RecommendationView, MetadataView

urlpatterns = [
    path("recommend/", RecommendationView.as_view(), name="recommend"),
    path("metadata/", MetadataView.as_view(), name="metadata"),
]
