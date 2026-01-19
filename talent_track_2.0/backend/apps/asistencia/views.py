from django.shortcuts import render

# Create your views here.
# apps/asistencia/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin
from .models import Turno
from .serializers import TurnoSerializer, TurnoCreateSerializer, TurnoUpdateSerializer


class TurnoListAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = Turno.objects.select_related("empresa").order_by("id")

        empresa_id = request.query_params.get("empresa_id")
        if empresa_id:
            qs = qs.filter(empresa_id=empresa_id)

        serializer = TurnoSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CrearTurnoAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = TurnoCreateSerializer(data=request.data)
        if serializer.is_valid():
            turno = serializer.save()
            return Response(TurnoSerializer(turno).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TurnoDetalleEliminarAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        turno = get_object_or_404(Turno.objects.select_related("empresa"), pk=pk)
        return Response(TurnoSerializer(turno).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        turno = get_object_or_404(Turno, pk=pk)
        turno.delete()
        return Response({"message": "Turno eliminado", "turno_id": pk}, status=status.HTTP_200_OK)


class ActualizarTurnoAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def put(self, request, pk):
        turno = get_object_or_404(Turno, pk=pk)
        serializer = TurnoUpdateSerializer(turno, data=request.data)
        if serializer.is_valid():
            turno = serializer.save()
            return Response(TurnoSerializer(turno).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# apps/asistencia/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin
from .models import ReglaAsistencia
from .serializers import (
    ReglaAsistenciaListSerializer,
    ReglaAsistenciaCreateSerializer,
    ReglaAsistenciaUpdateSerializer,
)

class ReglaAsistenciaListAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = ReglaAsistencia.objects.select_related("empresa").order_by("id")
        ser = ReglaAsistenciaListSerializer(qs, many=True)
        return Response(ser.data, status=status.HTTP_200_OK)


class CrearReglaAsistenciaAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        ser = ReglaAsistenciaCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        obj = ser.save()
        out = ReglaAsistenciaListSerializer(obj).data
        return Response(out, status=status.HTTP_201_CREATED)


class ActualizarReglaAsistenciaAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def put(self, request, pk):
        obj = get_object_or_404(ReglaAsistencia, pk=pk)
        ser = ReglaAsistenciaUpdateSerializer(obj, data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        obj = ser.save()
        out = ReglaAsistenciaListSerializer(obj).data
        return Response(out, status=status.HTTP_200_OK)


class ReglaAsistenciaDetalleEliminarAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        obj = get_object_or_404(ReglaAsistencia.objects.select_related("empresa"), pk=pk)
        return Response(ReglaAsistenciaListSerializer(obj).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        obj = get_object_or_404(ReglaAsistencia, pk=pk)
        obj.delete()
        return Response({"message": "Regla de asistencia eliminada", "id": pk}, status=status.HTTP_200_OK)


# apps/asistencia/views.py
from django.utils import timezone
from django.db.models.functions import TruncDate

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.asistencia.models import EventoAsistencia
from apps.usuarios.models import UsuarioRol
from .serializers import EventoAsistenciaHoySerializer, RegistrarEventoAsistenciaSerializer


def _get_ctx_from_authuser(request):
    """
    request.user = AuthUser (apps.accounts.models.AuthUser)
    request.user.usuario = usuarios.Usuario (tabla negocio)
    """
    auth_user = request.user
    if not getattr(auth_user, "usuario", None):
        return None
    u = auth_user.usuario
    return {
        "usuario_id": u.id,
        "empresa_id": u.empresa_id,
        "empleado_id": u.empleado_id,
    }


def _require_role(request, allowed_roles):
    """
    allowed_roles: ["empleado"] etc.
    Tu tabla Rol guarda nombre: superadmin/rrhh/manager/empleado/auditor
    """
    ctx = _get_ctx_from_authuser(request)
    if not ctx:
        return False

    roles = (
        UsuarioRol.objects
        .select_related("rol")
        .filter(usuario_id=ctx["usuario_id"])
        .values_list("rol__nombre", flat=True)
    )
    return any(r in allowed_roles for r in roles)


class EmpleadoAsistenciaHoyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_role(request, ["empleado"]):
            return Response({"detail": "No autorizado."}, status=401)

        ctx = _get_ctx_from_authuser(request)
        if not ctx or not ctx["empresa_id"] or not ctx["empleado_id"]:
            return Response({"detail": "Usuario sin empresa/empleado asociado."}, status=400)

        hoy = timezone.localdate()

        qs = (
            EventoAsistencia.objects
            .filter(
                empresa_id=ctx["empresa_id"],
                empleado_id=ctx["empleado_id"],
                registrado_el__date=hoy,
            )
            .order_by("registrado_el")
        )

        return Response(EventoAsistenciaHoySerializer(qs, many=True).data, status=200)


class EmpleadoRegistrarAsistenciaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _require_role(request, ["empleado"]):
            return Response({"detail": "No autorizado."}, status=401)

        ctx = _get_ctx_from_authuser(request)
        if not ctx or not ctx["empresa_id"] or not ctx["empleado_id"]:
            return Response({"detail": "Usuario sin empresa/empleado asociado."}, status=400)

        ser = RegistrarEventoAsistenciaSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        tipo = ser.validated_data["tipo"]
        observaciones = ser.validated_data.get("observaciones") or None
        ahora = timezone.now()
        hoy = timezone.localdate()

        # Regla: no duplicar mismo tipo en el mismo día
        ya_existe = EventoAsistencia.objects.filter(
            empresa_id=ctx["empresa_id"],
            empleado_id=ctx["empleado_id"],
            tipo=tipo,
            registrado_el__date=hoy,
        ).exists()

        if ya_existe:
            return Response(
                {"detail": "Ya existe un registro de este tipo para hoy."},
                status=status.HTTP_400_BAD_REQUEST
            )

        obj = EventoAsistencia.objects.create(
            empresa_id=ctx["empresa_id"],
            empleado_id=ctx["empleado_id"],
            tipo=tipo,
            registrado_el=ahora,
            fuente=2,  # web
            gps_lat=None,
            gps_lng=None,
            dentro_geocerca=False,
            foto_url=None,
            ip=None,
            observaciones=observaciones,
        )

        return Response(EventoAsistenciaHoySerializer(obj).data, status=status.HTTP_201_CREATED)


from datetime import date
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.asistencia.models import JornadaCalculada
from apps.usuarios.models import UsuarioRol
from .serializers import JornadaCalculadaEmpleadoSerializer


def _get_ctx_from_authuser(request):
    auth_user = request.user
    if not getattr(auth_user, "usuario", None):
        return None
    u = auth_user.usuario
    return {"usuario_id": u.id, "empresa_id": u.empresa_id, "empleado_id": u.empleado_id}


def _require_role(request, allowed_roles):
    ctx = _get_ctx_from_authuser(request)
    if not ctx:
        return False
    roles = (
        UsuarioRol.objects
        .select_related("rol")
        .filter(usuario_id=ctx["usuario_id"])
        .values_list("rol__nombre", flat=True)
    )
    return any(r in allowed_roles for r in roles)


def _month_range(month_str):
    """
    month_str: 'YYYY-MM'
    retorna (inicio, fin_exclusivo) como dates
    """
    y, m = month_str.split("-")
    y = int(y)
    m = int(m)

    start = date(y, m, 1)
    if m == 12:
        end = date(y + 1, 1, 1)
    else:
        end = date(y, m + 1, 1)
    return start, end


class EmpleadoJornadasMensualAPIView(APIView):
    """
    GET /api/empleado/jornadas/?month=YYYY-MM
    - Si no mandas month, usa el mes actual
    HU01-HU04 en un solo GET
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_role(request, ["empleado"]):
            return Response({"detail": "No autorizado."}, status=401)

        ctx = _get_ctx_from_authuser(request)
        if not ctx or not ctx["empresa_id"] or not ctx["empleado_id"]:
            return Response({"detail": "Usuario sin empresa/empleado asociado."}, status=400)

        month = request.query_params.get("month")
        if not month:
            today = timezone.localdate()
            month = f"{today.year:04d}-{today.month:02d}"

        try:
            start, end = _month_range(month)
        except Exception:
            return Response({"detail": "Parámetro month inválido. Usa YYYY-MM."}, status=400)

        qs = (
            JornadaCalculada.objects
            .filter(
                empresa_id=ctx["empresa_id"],
                empleado_id=ctx["empleado_id"],
                fecha__gte=start,
                fecha__lt=end,
            )
            .order_by("fecha")
        )

        data = JornadaCalculadaEmpleadoSerializer(qs, many=True).data

        # Resumen útil (HU02, HU03, HU04)
        resumen = {
            "month": month,
            "dias": len(data),
            "total_minutos_trabajados": sum((d.get("minutos_trabajados") or 0) for d in data),
            "total_minutos_tardanza": sum((d.get("minutos_tardanza") or 0) for d in data),
            "total_minutos_extra": sum((d.get("minutos_extra") or 0) for d in data),
        }

        return Response({"resumen": resumen, "jornadas": data}, status=200)
