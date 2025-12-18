from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import KPI, PlantillaKPI, AsignacionKPI, ResultadoKPI, EvaluacionDesempeno

admin.site.register(KPI)
admin.site.register(PlantillaKPI)
admin.site.register(AsignacionKPI)
admin.site.register(ResultadoKPI)
admin.site.register(EvaluacionDesempeno)
