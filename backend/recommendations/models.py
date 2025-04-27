from django.db import models

class Recommendation(models.Model):
    body_shape = models.CharField(max_length=100)
    occasion = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100)
    clothing_type = models.CharField(max_length=100)
    recommendations = models.JSONField()

    def __str__(self):
        return f"Recommendation for {self.body_shape} ({self.occasion})"