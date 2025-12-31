from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin
from apps.integraciones.models import ReporteProgramado
from apps.integraciones.serializers import (
    ReporteProgramadoListSerializer,
    ReporteProgramadoCreateSerializer,
    ReporteProgramadoUpdateSerializer,
)


class ReporteProgramadoListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = ReporteProgramado.objects.select_related("empresa").all().order_by("id")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReporteProgramadoCreateSerializer
        return ReporteProgramadoListSerializer


class ReporteProgramadoRetrieveUpdateDeleteAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        obj = get_object_or_404(ReporteProgramado.objects.select_related("empresa"), pk=pk)
        ser = ReporteProgramadoListSerializer(obj)
        return Response(ser.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        obj = get_object_or_404(ReporteProgramado, pk=pk)
        ser = ReporteProgramadoUpdateSerializer(obj, data=request.data)
        if ser.is_valid():
            ser.save()
            # devolvemos el detalle completo para front
            out = ReporteProgramadoListSerializer(obj)
            return Response(out.data, status=status.HTTP_200_OK)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = get_object_or_404(ReporteProgramado, pk=pk)
        obj.delete()
        return Response({"message": "Reporte programado eliminado", "id": pk}, status=status.HTTP_200_OK)


class ToggleActivoReporteProgramadoAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        obj = get_object_or_404(ReporteProgramado, pk=pk)
        obj.activo = not bool(obj.activo)
        obj.save(update_fields=["activo"])
        return Response({"id": obj.id, "activo": obj.activo}, status=status.HTTP_200_OK)
