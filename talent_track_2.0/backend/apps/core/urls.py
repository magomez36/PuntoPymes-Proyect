from django.urls import path
from .views import EmpresaListAPIView

urlpatterns = [
    path('listado-empresas/', EmpresaListAPIView.as_view(), name='listar_empresas')
]
