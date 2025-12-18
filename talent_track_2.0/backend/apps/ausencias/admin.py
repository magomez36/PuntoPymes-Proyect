from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import TipoAusencia, SolicitudAusencia, AprobacionAusencia, SaldoVacaciones

admin.site.register(TipoAusencia)
admin.site.register(SolicitudAusencia)
admin.site.register(AprobacionAusencia)
admin.site.register(SaldoVacaciones)
