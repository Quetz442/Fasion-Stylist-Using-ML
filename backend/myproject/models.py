from django.db import models

class ClothingRecommendation(models.Model):
    body_shape = models.CharField(max_length=100)
    occasion = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100)
    clothing_type = models.CharField(max_length=100)
