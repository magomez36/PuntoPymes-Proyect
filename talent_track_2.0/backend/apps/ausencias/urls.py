# apps/ausencias/urls.py
from django.urls import path
from .views import TipoAusenciaListCreateAPIView, TipoAusenciaDetailUpdateDeleteAPIView

urlpatterns = [
    path("tipos-ausencias/", TipoAusenciaListCreateAPIView.as_view(), name="tipos_ausencias_list_create"),
    path("tipos-ausencias/<int:pk>/", TipoAusenciaDetailUpdateDeleteAPIView.as_view(), name="tipos_ausencias_detail"),
]
