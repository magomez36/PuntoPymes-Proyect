from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import ReporteProgramado, IntegracionERP, Webhook, ExportacionNomina

admin.site.register(ReporteProgramado)
admin.site.register(IntegracionERP)
admin.site.register(Webhook)
admin.site.register(ExportacionNomina)
