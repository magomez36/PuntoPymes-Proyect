# apps/auditoria/urls_auditor_trazabilidad.py
from django.urls import path
from apps.auditoria.views_auditor_trazabilidad import AuditorLogsAuditoriaAPIView

urlpatterns = [
    path("auditor/trazabilidad/logs/", AuditorLogsAuditoriaAPIView.as_view()),
]
