# apps/auditoria/views_auditor_trazabilidad.py
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.auditoria.models import LogAuditoria
from apps.auditoria.serializers_auditor_trazabilidad import AuditorLogAuditoriaSerializer


def _get_usuario_tt(request):
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None

    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None

    return (
        Usuario.objects
        .select_related("empresa")
        .filter(id=usuario_id)
        .first()
    )


class AuditorLogsAuditoriaAPIView(APIView):
    """
    GET /api/auditor/trazabilidad/logs/?usuario_id=12&fecha=2026-01-06
    - Filtra siempre por empresa del auditor
    - Filtros opcionales:
        usuario_id (id de usuarios.Usuario)
        fecha (YYYY-MM-DD)
    Retorna:
        - results: logs
        - filtros: usuarios de la empresa (para toggle en front)
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        empresa_id = auditor.empresa_id
        usuario_id = request.query_params.get("usuario_id")
        fecha = request.query_params.get("fecha")  # YYYY-MM-DD

        qs = (
            LogAuditoria.objects
            .select_related("usuario")
            .filter(empresa_id=empresa_id)
        )

        # filtro por usuario (solo si pertenece a la empresa)
        if usuario_id:
            try:
                uid = int(usuario_id)
                qs = qs.filter(usuario_id=uid)
            except ValueError:
                return Response({"detail": "usuario_id inválido."}, status=400)

        # filtro por fecha exacta
        if fecha:
            try:
                d = datetime.strptime(fecha, "%Y-%m-%d").date()
                qs = qs.filter(fecha__date=d)
            except ValueError:
                return Response({"detail": "fecha inválida. Use YYYY-MM-DD."}, status=400)

        qs = qs.order_by("-fecha", "-id")[:1000]  # tope para evitar tablas gigantes

        # catálogo de usuarios de la empresa (para el toggle del front)
        usuarios_empresa = (
            Usuario.objects
            .filter(empresa_id=empresa_id)
            .order_by("email")
            .values("id", "email")
        )

        return Response(
            {
                "count": qs.count(),
                "results": AuditorLogAuditoriaSerializer(qs, many=True).data,
                "filtros": {
                    "usuarios": list(usuarios_empresa),
                }
            },
            status=200
        )
