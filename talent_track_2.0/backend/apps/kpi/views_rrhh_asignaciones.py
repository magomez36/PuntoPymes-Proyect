from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.permissions import IsRRHH
from apps.usuarios.scopes import get_scope
from apps.kpi.models import AsignacionKPI, PlantillaKPI
from apps.empleados.models import Empleado

from .serializers_rrhh_asignaciones import (
    AsignacionKPIListSerializer,
    AsignacionKPICreateSerializer,
    AsignacionKPIUpdateSerializer,
)


class RRHHAsignacionKPIListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        qs = (
            AsignacionKPI.objects
            .select_related("empleado", "plantilla")
            .filter(empresa_id=empresa_id)
            .order_by("-id")
        )
        return Response(AsignacionKPIListSerializer(qs, many=True).data, status=200)

    def post(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        ser = AsignacionKPICreateSerializer(data=request.data, context={"empresa_id": empresa_id})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        obj = AsignacionKPI.objects.create(
            empresa_id=empresa_id,
            empleado=data["empleado_obj"],
            plantilla=data["plantilla_obj"],
            desde=data["desde"],
            hasta=data.get("hasta"),
            ajustes_personalizados=None,  # por defecto null
        )

        obj = AsignacionKPI.objects.select_related("empleado", "plantilla").get(id=obj.id)
        return Response(AsignacionKPIListSerializer(obj).data, status=status.HTTP_201_CREATED)


class RRHHAsignacionKPIDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def get(self, request, pk):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        obj = (
            AsignacionKPI.objects
            .select_related("empleado", "plantilla")
            .filter(id=pk, empresa_id=empresa_id)
            .first()
        )
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        return Response(AsignacionKPIListSerializer(obj).data, status=200)

    def put(self, request, pk):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        obj = get_object_or_404(AsignacionKPI, id=pk, empresa_id=empresa_id)

        ser = AsignacionKPIUpdateSerializer(data=request.data, context={"empresa_id": empresa_id})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # OJO: solo editas plantilla/desde/hasta (según tu HU03)
        obj.plantilla = data["plantilla_obj"]
        obj.desde = data["desde"]
        obj.hasta = data.get("hasta")
        obj.save()

        obj = AsignacionKPI.objects.select_related("empleado", "plantilla").get(id=obj.id)
        return Response(AsignacionKPIListSerializer(obj).data, status=200)

    def delete(self, request, pk):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        obj = AsignacionKPI.objects.filter(id=pk, empresa_id=empresa_id).first()
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        obj.delete()
        return Response(status=204)


# -------------------------
# Helpers RRHH (sin empresa_id en query)
# -------------------------

class RRHHEmpleadosEmpresaAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        qs = Empleado.objects.filter(empresa_id=empresa_id).order_by("id")
        out = [
            {"id": e.id, "email": e.email, "nombres": e.nombres, "apellidos": e.apellidos}
            for e in qs
        ]
        return Response(out, status=200)


class RRHHPlantillasKPIEmpresaAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        qs = PlantillaKPI.objects.filter(empresa_id=empresa_id).order_by("id")
        out = [{"id": p.id, "nombre": p.nombre} for p in qs]
        return Response(out, status=200)
