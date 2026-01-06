# apps/empleados/urls_auditor_expedientes.py
from django.urls import path
from apps.empleados.views_auditor_expedientes import (
    AuditorEmpleadosListAPIView,
    AuditorEmpleadoDetalleAPIView,
    AuditorContratoEmpleadoAPIView,
    AuditorJornadasEmpleadoAPIView,
)

urlpatterns = [
    path("auditor/expedientes/empleados/", AuditorEmpleadosListAPIView.as_view()),
    path("auditor/expedientes/empleados/<int:pk>/", AuditorEmpleadoDetalleAPIView.as_view()),
    path("auditor/expedientes/empleados/<int:pk>/contrato/", AuditorContratoEmpleadoAPIView.as_view()),
    path("auditor/expedientes/empleados/<int:pk>/jornadas/", AuditorJornadasEmpleadoAPIView.as_view()),
]
