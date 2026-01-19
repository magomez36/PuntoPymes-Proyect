from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notificaciones.models import Notificacion
from apps.usuarios.models import UsuarioRol
from .serializers import NotificacionEmpleadoSerializer


def _ctx(request):
    u = request.user.usuario
    return u.empresa_id, u.empleado_id, u.id


def _require_empleado(request):
    return UsuarioRol.objects.filter(
        usuario_id=request.user.usuario.id,
        rol__nombre="empleado"
    ).exists()


class NotificacionesEmpleadoAPIView(APIView):
    """
    GET /api/empleado/notificaciones/?solo_no_leidas=1
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_empleado(request):
            return Response({"detail": "No autorizado."}, status=401)

        empresa_id, empleado_id, _ = _ctx(request)

        solo_no_leidas = request.query_params.get("solo_no_leidas") == "1"

        qs = Notificacion.objects.filter(
            empresa_id=empresa_id,
            empleado_id=empleado_id
        )

        if solo_no_leidas:
            qs = qs.filter(leida_el__isnull=True)

        qs = qs.order_by("-enviada_el", "-id")

        return Response(NotificacionEmpleadoSerializer(qs, many=True).data, status=200)


class MarcarNotificacionLeidaAPIView(APIView):
    """
    PATCH /api/empleado/notificaciones/<id>/leida/
    Marca leida_el=now si estaba null
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not _require_empleado(request):
            return Response({"detail": "No autorizado."}, status=401)

        empresa_id, empleado_id, _ = _ctx(request)

        obj = Notificacion.objects.filter(
            id=pk,
            empresa_id=empresa_id,
            empleado_id=empleado_id
        ).first()

        if not obj:
            return Response({"detail": "No encontrada."}, status=404)

        if obj.leida_el is None:
            obj.leida_el = timezone.now()
            obj.save(update_fields=["leida_el"])

        return Response(NotificacionEmpleadoSerializer(obj).data, status=200)
