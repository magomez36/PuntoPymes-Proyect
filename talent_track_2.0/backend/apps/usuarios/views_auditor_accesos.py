# apps/usuarios/views_auditor_accesos.py
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario, Rol, Permiso
from apps.usuarios.serializers_auditor_accesos import (
    AuditorUsuarioSerializer,
    AuditorRolSerializer,
    AuditorPermisoSerializer,
)


def _get_usuario_tt(request):
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None

    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None

    return (
        Usuario.objects
        .select_related("empresa", "empleado")
        .filter(id=usuario_id)
        .first()
    )


class AuditorUsuariosEmpresaAPIView(APIView):
    """
    GET /api/auditor/accesos/usuarios/
    Lista usuarios de la empresa del auditor (solo lectura).
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            Usuario.objects
            .select_related("empresa", "empleado")
            .prefetch_related("usuariorol_set__rol")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("id")
        )

        return Response(
            {"count": qs.count(), "results": AuditorUsuarioSerializer(qs, many=True).data},
            status=200
        )


class AuditorRolesEmpresaAPIView(APIView):
    """
    GET /api/auditor/accesos/roles/
    Roles definidos de la empresa del auditor.
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        # Solo roles propios de la empresa (no globales empresa=NULL)
        qs = Rol.objects.filter(empresa_id=auditor.empresa_id).order_by("id")

        return Response(
            {"count": qs.count(), "results": AuditorRolSerializer(qs, many=True).data},
            status=200
        )


class AuditorPermisosEmpresaAPIView(APIView):
    """
    GET /api/auditor/accesos/permisos/
    Permisos de los roles de la empresa del auditor.
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            Permiso.objects
            .select_related("rol")
            .filter(rol__empresa_id=auditor.empresa_id)
            .order_by("rol_id", "id")
        )

        return Response(
            {"count": qs.count(), "results": AuditorPermisoSerializer(qs, many=True).data},
            status=200
        )
