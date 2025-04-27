from django.db import models

class Recommendation(models.Model):
    body_shape = models.CharField(max_length=100)
    occasion = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100)
    clothing_type = models.CharField(max_length=100)
    recommendations = models.JSONField()

    def __str__(self):
        return f"Recommendation for {self.body_shape} ({self.occasion})"

class SeasonalColourAnalysis(models.Model):
    eye_color = models.CharField(max_length=50)
    hair_color = models.CharField(max_length=50)
    skin_tone = models.CharField(max_length=50)
    season = models.CharField(max_length=50)
    complementary_colors = models.JSONField()
    color_combinations = models.JSONField()

    def __str__(self):
        return f"Seasonal Analysis: {self.season}"