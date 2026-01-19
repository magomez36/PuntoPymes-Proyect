from django.shortcuts import render

# Create your views here.
# apps/ausencias/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin
from .models import TipoAusencia
from .serializers import (
    TipoAusenciaSerializer,
    TipoAusenciaCreateSerializer,
    TipoAusenciaUpdateSerializer
)

class TipoAusenciaListCreateAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = TipoAusencia.objects.select_related("empresa").order_by("id")
        return Response(TipoAusenciaSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TipoAusenciaCreateSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            # devolvemos el objeto completo con empresa_nombre + txt
            return Response(TipoAusenciaSerializer(obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TipoAusenciaDetailUpdateDeleteAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        obj = get_object_or_404(TipoAusencia.objects.select_related("empresa"), pk=pk)
        return Response(TipoAusenciaSerializer(obj).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        obj = get_object_or_404(TipoAusencia, pk=pk)
        serializer = TipoAusenciaUpdateSerializer(obj, data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(TipoAusenciaSerializer(obj).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = get_object_or_404(TipoAusencia, pk=pk)
        obj.delete()
        return Response({"message": "Tipo de ausencia eliminado", "id": pk}, status=status.HTTP_200_OK)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from apps.ausencias.models import SolicitudAusencia, TipoAusencia
from apps.usuarios.models import UsuarioRol
from .serializers import (
    SolicitudAusenciaEmpleadoSerializer,
    CrearSolicitudAusenciaSerializer,
)


def ctx(request):
    u = request.user.usuario
    return u.empresa_id, u.empleado_id, u.id


def require_empleado(request):
    return UsuarioRol.objects.filter(
        usuario_id=request.user.usuario.id,
        rol__nombre="empleado"
    ).exists()


class SolicitudesEmpleadoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not require_empleado(request):
            return Response(status=401)

        empresa_id, empleado_id, _ = ctx(request)

        qs = SolicitudAusencia.objects.filter(
            empresa_id=empresa_id,
            empleado_id=empleado_id
        ).order_by("-creada_el")

        return Response(SolicitudAusenciaEmpleadoSerializer(qs, many=True).data)

    def post(self, request):
        if not require_empleado(request):
            return Response(status=401)

        ser = CrearSolicitudAusenciaSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        empresa_id, empleado_id, _ = ctx(request)

        obj = SolicitudAusencia.objects.create(
            empresa_id=empresa_id,
            empleado_id=empleado_id,
            tipo_ausencia_id=ser.validated_data["id_tipo_ausencia"],
            fecha_inicio=ser.validated_data["fecha_inicio"],
            fecha_fin=ser.validated_data.get("fecha_fin"),
            dias_habiles=ser.validated_data["dias_habiles"],
            motivo=ser.validated_data["motivo"],
            estado=1,
            flujo_actual=1,
            creada_el=timezone.now(),
        )


        return Response(
            SolicitudAusenciaEmpleadoSerializer(obj).data,
            status=status.HTTP_201_CREATED
        )


class SolicitudEmpleadoDetalleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        empresa_id, empleado_id, _ = ctx(request)

        obj = SolicitudAusencia.objects.filter(
            id=pk,
            empresa_id=empresa_id,
            empleado_id=empleado_id,
            estado=1
        ).first()

        if not obj:
            return Response({"detail": "No editable"}, status=400)

        ser = CrearSolicitudAusenciaSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        for k, v in ser.validated_data.items():
            setattr(obj, k, v)

        obj.save()
        return Response(SolicitudAusenciaEmpleadoSerializer(obj).data)

    def patch(self, request, pk):
        empresa_id, empleado_id, _ = ctx(request)

        obj = SolicitudAusencia.objects.filter(
            id=pk,
            empresa_id=empresa_id,
            empleado_id=empleado_id,
            estado=1
        ).first()

        if not obj:
            return Response({"detail": "No cancelable"}, status=400)

        obj.estado = 4
        obj.save()
        return Response(status=204)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.ausencias.models import TipoAusencia
from apps.usuarios.models import UsuarioRol


def _ctx(request):
    u = request.user.usuario
    return u.empresa_id, u.empleado_id, u.id


def _require_empleado(request):
    return UsuarioRol.objects.filter(usuario_id=request.user.usuario.id, rol__nombre="empleado").exists()


class TiposAusenciaEmpleadoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_empleado(request):
            return Response({"detail": "No autorizado."}, status=401)

        empresa_id, _, _ = _ctx(request)

        qs = TipoAusencia.objects.filter(
            empresa_id=empresa_id
        ).order_by("id").values("id", "nombre", "afecta_sueldo", "requiere_soporte")

        return Response(list(qs), status=200)
