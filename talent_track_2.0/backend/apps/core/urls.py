from django.urls import path

from .views import EmpresaListAPIView 
from .views import CrearEmpresaAPIView
from .views import ActualizarEmpresaAPIView
from .views import ToggleEstadoEmpresaAPIView
from .views import EmpresaDetalleEliminarAPIView

urlpatterns = [
    path('listado-empresas/', EmpresaListAPIView.as_view(), name='listar_empresas'),
    path('crear-empresa/', CrearEmpresaAPIView.as_view(), name='crear_empresa'),
    path('actualizar-empresa/<int:pk>/', ActualizarEmpresaAPIView.as_view(),  name='actualizar_empresa'),
    path('empresas/<int:pk>/toggle-estado/', ToggleEstadoEmpresaAPIView.as_view(), name='toggle_estado_empresa'),
    path('empresas/<int:pk>/', EmpresaDetalleEliminarAPIView.as_view(), name='empresa_detalle_eliminar'),
]

