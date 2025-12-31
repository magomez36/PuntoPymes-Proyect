from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import LoginView
from .auth_profile_views import MeView
from apps.usuarios.views import RolListCreateAPIView, RolRetrieveUpdateDeleteAPIView

from apps.usuarios.views import (
    UsuariosEmpresaListCreateAPIView,
    UsuarioEmpresaDetalleAPIView,
    UsuarioEmpresaToggleEstadoAPIView,
    EmpleadosPorEmpresaAPIView,
    RolesPorEmpresaAPIView,
)

from apps.usuarios.views import (
    PermisosPorEmpresaAPIView,
    PermisoCreateAPIView,
    PermisoDetalleAPIView,
)

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),

    path("roles-empresa/", RolListCreateAPIView.as_view(), name="roles-empresa-list-create"),
    path("roles-empresa/<int:pk>/", RolRetrieveUpdateDeleteAPIView.as_view(), name="roles-empresa-rud"),

    path("usuarios-empresa/", UsuariosEmpresaListCreateAPIView.as_view(), name="usuarios_empresa_list_create"),
    path("usuarios-empresa/<int:pk>/", UsuarioEmpresaDetalleAPIView.as_view(), name="usuarios_empresa_detail"),
    path("usuarios-empresa/<int:pk>/toggle-estado/", UsuarioEmpresaToggleEstadoAPIView.as_view(), name="usuarios_empresa_toggle"),

    # Helpers
    path("helpers/empleados-por-empresa/", EmpleadosPorEmpresaAPIView.as_view(), name="empleados_por_empresa"),
    path("helpers/roles-por-empresa/", RolesPorEmpresaAPIView.as_view(), name="roles_por_empresa"),

    path("permisos-por-empresa/", PermisosPorEmpresaAPIView.as_view(), name="permisos_por_empresa"),
    path("permisos/", PermisoCreateAPIView.as_view(), name="permiso_create"),
    path("permisos/<int:pk>/", PermisoDetalleAPIView.as_view(), name="permiso_detail"),
]
