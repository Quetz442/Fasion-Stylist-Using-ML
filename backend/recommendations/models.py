from django.db import models
from django.contrib.auth.models import User

class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True)
    body_shape = models.CharField(max_length=100)
    occasion = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100)
    clothing_type = models.CharField(max_length=100)
    recommendations = models.JSONField()
    recommendation_images = models.JSONField(null=True, blank=True)  # New field to store image URLs

    def __str__(self):
        return f"Recommendation for {self.user.username if self.user else 'Unknown'} - {self.body_shape} ({self.occasion})"

class SeasonalColourAnalysis(models.Model):
    eye_color = models.CharField(max_length=50)
    hair_color = models.CharField(max_length=50)
    skin_tone = models.CharField(max_length=50)
    season = models.CharField(max_length=50)
    complementary_colors = models.JSONField()
    color_combinations = models.JSONField()

    def __str__(self):
        return f"Seasonal Analysis: {self.season}"
