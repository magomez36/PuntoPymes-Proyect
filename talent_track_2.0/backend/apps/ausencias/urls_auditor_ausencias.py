# apps/ausencias/urls_auditor_ausencias.py
from django.urls import path
from apps.ausencias.views_auditor_ausencias import (
    AuditorSolicitudesAusenciasAPIView,
    AuditorAprobacionesAusenciasAPIView,
    AuditorSaldosVacacionesAPIView,
)

urlpatterns = [
    path("auditor/ausencias/solicitudes/", AuditorSolicitudesAusenciasAPIView.as_view()),
    path("auditor/ausencias/aprobaciones/", AuditorAprobacionesAusenciasAPIView.as_view()),
    path("auditor/ausencias/saldos-vacaciones/", AuditorSaldosVacacionesAPIView.as_view()),
]
