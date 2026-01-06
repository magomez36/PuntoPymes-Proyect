# apps/asistencia/urls_auditor_asistencia.py
from django.urls import path
from apps.asistencia.views_auditor_asistencia import (
    AuditorEventosAsistenciaAPIView,
    AuditorJornadasCalculadasAPIView,
    AuditorTurnosEmpleadosAPIView,
)

urlpatterns = [
    path("auditor/asistencia/eventos/", AuditorEventosAsistenciaAPIView.as_view()),
    path("auditor/asistencia/jornadas/", AuditorJornadasCalculadasAPIView.as_view()),
    path("auditor/asistencia/turnos-empleados/", AuditorTurnosEmpleadosAPIView.as_view()),
]
