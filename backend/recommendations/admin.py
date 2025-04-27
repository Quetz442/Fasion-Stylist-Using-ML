from django.contrib import admin
from .models import Recommendation
from .models import SeasonalColourAnalysis

admin.site.register(Recommendation)
admin.site.register(SeasonalColourAnalysis)

# Register your models here.
