from django.shortcuts import render

# Create your views here.
# apps/kpi/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin
from .models import KPI
from .serializers import KPISerializer, KPICreateSerializer, KPIUpdateSerializer

class KPIListCreateAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = KPI.objects.select_related("empresa").order_by("id")
        return Response(KPISerializer(qs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = KPICreateSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(KPISerializer(obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class KPIDetailUpdateDeleteAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        obj = get_object_or_404(KPI.objects.select_related("empresa"), pk=pk)
        return Response(KPISerializer(obj).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        obj = get_object_or_404(KPI, pk=pk)
        serializer = KPIUpdateSerializer(obj, data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(KPISerializer(obj).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        obj = get_object_or_404(KPI, pk=pk)
        obj.delete()
        return Response({"message": "KPI eliminado", "id": pk}, status=status.HTTP_200_OK)


# apps/kpi/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.kpi.models import PlantillaKPI, KPI
from .serializers import (
    PlantillaKPIListSerializer,
    PlantillaKPICreateSerializer,
    PlantillaKPIUpdateSerializer,
)


class PlantillasKPIPorEmpresaAPIView(APIView):
    """
    GET /api/plantillas-kpi/?empresa_id=1
    """
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = (
            PlantillaKPI.objects
            .select_related("empresa")
            .filter(empresa_id=empresa_id)
            .order_by("id")
        )
        return Response(PlantillaKPIListSerializer(qs, many=True).data, status=200)


class PlantillaKPICreateAPIView(APIView):
    """
    POST /api/plantillas-kpi/
    """
    def post(self, request):
        ser = PlantillaKPICreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj = ser.save()
        obj = PlantillaKPI.objects.select_related("empresa").get(id=obj.id)
        return Response(PlantillaKPIListSerializer(obj).data, status=status.HTTP_201_CREATED)


class PlantillaKPIDetalleAPIView(APIView):
    """
    GET /api/plantillas-kpi/<id>/
    PUT /api/plantillas-kpi/<id>/
    DELETE /api/plantillas-kpi/<id>/
    """
    def get(self, request, pk):
        obj = (
            PlantillaKPI.objects
            .select_related("empresa")
            .filter(id=pk)
            .first()
        )
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(PlantillaKPIListSerializer(obj).data, status=200)

    def put(self, request, pk):
        obj = PlantillaKPI.objects.filter(id=pk).first()
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        ser = PlantillaKPIUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # validar kpi_ids pertenecen a la empresa del obj
        objetivos = data["objetivos"]
        kpi_ids = [o["kpi_id"] for o in objetivos]
        existentes = set(KPI.objects.filter(empresa_id=obj.empresa_id, id__in=kpi_ids).values_list("id", flat=True))
        faltantes = [kid for kid in kpi_ids if kid not in existentes]
        if faltantes:
            return Response({"objetivos": f"Estos kpi_id no pertenecen a la empresa: {faltantes}"}, status=400)

        if len(set(kpi_ids)) != len(kpi_ids):
            return Response({"objetivos": "No se permite repetir el mismo KPI en objetivos."}, status=400)

        obj.nombre = data["nombre"]
        obj.aplica_a = data["aplica_a"]
        obj.objetivos = objetivos
        obj.save()

        obj = PlantillaKPI.objects.select_related("empresa").get(id=obj.id)
        return Response(PlantillaKPIListSerializer(obj).data, status=200)

    def delete(self, request, pk):
        obj = PlantillaKPI.objects.filter(id=pk).first()
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        obj.delete()
        return Response(status=204)


from rest_framework.views import APIView
from rest_framework.response import Response
from apps.kpi.models import KPI

class KPIsPorEmpresaHelperAPIView(APIView):
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = KPI.objects.filter(empresa_id=empresa_id).order_by("id").values("id", "codigo", "nombre")
        return Response(list(qs), status=200)
