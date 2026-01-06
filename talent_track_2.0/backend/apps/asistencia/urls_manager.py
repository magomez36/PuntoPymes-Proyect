# apps/asistencia/urls_manager.py
from django.urls import path
from apps.asistencia.views_manager_supervision import (
    ManagerEventosAsistenciaDiaAPIView,
    ManagerJornadasDiaAPIView,
)

urlpatterns = [
    path("manager/supervision-asistencia/eventos/", ManagerEventosAsistenciaDiaAPIView.as_view()),
    path("manager/supervision-asistencia/jornadas/", ManagerJornadasDiaAPIView.as_view()),
]
