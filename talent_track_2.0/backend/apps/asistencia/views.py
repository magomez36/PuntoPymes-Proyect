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
