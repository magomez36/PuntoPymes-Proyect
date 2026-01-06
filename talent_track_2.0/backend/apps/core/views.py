from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin

from .models import Empresa
from .serializers import (
    EmpresaSerializer,
    EmpresaCreateSerializer,
    EmpresaUpdateSerializer,
)


# =========================================================
# HU01 - Ver Empresas (GET Empresa)
# =========================================================
class EmpresaListAPIView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Empresa.objects.all().order_by("id")
    serializer_class = EmpresaSerializer



class CrearEmpresaAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = EmpresaCreateSerializer(data=request.data)

        if serializer.is_valid():
            empresa = serializer.save()

            # Puedes devolver serializer.data si quieres, pero mantengo tu respuesta
            return Response(
                {
                    "id": empresa.id,
                    "razon_social": empresa.razon_social,
                    "nombre_comercial": empresa.nombre_comercial,
                    "ruc_nit": empresa.ruc_nit,
                    "pais": empresa.pais,
                    "moneda": empresa.moneda,
                    "estado": empresa.estado,
                    "creada_el": empresa.creada_el,
                    "logo_url": empresa.logo_url,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActualizarEmpresaAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def put(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)

        serializer = EmpresaUpdateSerializer(empresa, data=request.data)

        if serializer.is_valid():
            empresa_actualizada = serializer.save()
            return Response(
                {
                    "id": empresa_actualizada.id,
                    "razon_social": empresa_actualizada.razon_social,
                    "nombre_comercial": empresa_actualizada.nombre_comercial,
                    "ruc_nit": empresa_actualizada.ruc_nit,
                    "pais": empresa_actualizada.pais,
                    "moneda": empresa_actualizada.moneda,
                    "estado": empresa_actualizada.estado,
                    "creada_el": empresa_actualizada.creada_el,
                    "logo_url": empresa_actualizada.logo_url,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ToggleEstadoEmpresaAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)

        empresa.estado = 2 if empresa.estado == 1 else 1
        empresa.save(update_fields=["estado"])

        return Response(
            {"id": empresa.id, "estado": empresa.estado},
            status=status.HTTP_200_OK,
        )


class EmpresaDetalleEliminarAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)
        serializer = EmpresaSerializer(empresa)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)
        deleted_count, deleted_detail = empresa.delete()

        return Response(
            {
                "message": "Empresa eliminada correctamente",
                "empresa_id": pk,
                "deleted_count": deleted_count,
                "deleted_detail": deleted_detail,
            },
            status=status.HTTP_200_OK,
        )

# apps/core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin
from .models import UnidadOrganizacional
from .serializers import (
    UnidadOrganizacionalListSerializer,
    UnidadOrganizacionalCreateSerializer,
    UnidadOrganizacionalUpdateSerializer,
)


class UnidadOrganizacionalListCreateAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        """
        Listado.
        Soporta filtro opcional: ?empresa_id=#
        """
        qs = UnidadOrganizacional.objects.select_related("empresa", "unidad_padre").order_by("id")

        empresa_id = request.query_params.get("empresa_id")
        if empresa_id:
            qs = qs.filter(empresa_id=empresa_id)

        serializer = UnidadOrganizacionalListSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UnidadOrganizacionalCreateSerializer(data=request.data)
        if serializer.is_valid():
            unidad = serializer.save()
            # devolver ya con nombres para el front
            out = UnidadOrganizacionalListSerializer(unidad).data
            return Response(out, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UnidadOrganizacionalDetailAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        unidad = get_object_or_404(
            UnidadOrganizacional.objects.select_related("empresa", "unidad_padre"),
            pk=pk,
        )
        serializer = UnidadOrganizacionalListSerializer(unidad)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        unidad = get_object_or_404(UnidadOrganizacional, pk=pk)
        serializer = UnidadOrganizacionalUpdateSerializer(unidad, data=request.data)
        if serializer.is_valid():
            unidad = serializer.save()
            out = UnidadOrganizacionalListSerializer(
                UnidadOrganizacional.objects.select_related("empresa", "unidad_padre").get(pk=unidad.pk)
            ).data
            return Response(out, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        unidad = get_object_or_404(UnidadOrganizacional, pk=pk)
        unidad.delete()
        return Response({"message": "Unidad organizacional eliminada", "id": pk}, status=status.HTTP_200_OK)


class ToggleEstadoUnidadOrganizacionalAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        unidad = get_object_or_404(UnidadOrganizacional, pk=pk)
        unidad.estado = 2 if unidad.estado == 1 else 1
        unidad.save()
        return Response(
            {"id": unidad.id, "estado": unidad.estado},
            status=status.HTTP_200_OK
        )

# apps/core/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.usuarios.permissions import IsSuperAdmin

from .models import Empresa, Puesto
from .serializers import (
    EmpresaSerializer, EmpresaCreateSerializer, EmpresaUpdateSerializer,  # si ya están
    PuestoSerializer, PuestoCreateSerializer, PuestoUpdateSerializer
)

# ==========================
# PUESTOS (SuperAdmin)
# ==========================

class PuestoListAPIView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = PuestoSerializer

    def get_queryset(self):
        qs = Puesto.objects.select_related("empresa", "unidad").order_by("id")
        empresa_id = self.request.query_params.get("empresa_id")
        if empresa_id:
            qs = qs.filter(empresa_id=empresa_id)
        return qs


class CrearPuestoAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = PuestoCreateSerializer(data=request.data)
        if serializer.is_valid():
            puesto = serializer.save()
            return Response(PuestoSerializer(puesto).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActualizarPuestoAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def put(self, request, pk):
        puesto = get_object_or_404(Puesto, pk=pk)
        serializer = PuestoUpdateSerializer(puesto, data=request.data)
        if serializer.is_valid():
            puesto = serializer.save()
            return Response(PuestoSerializer(puesto).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PuestoDetalleEliminarAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        puesto = get_object_or_404(Puesto, pk=pk)
        return Response(PuestoSerializer(puesto).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        puesto = get_object_or_404(Puesto, pk=pk)
        puesto.delete()
        return Response({"message": "Puesto eliminado correctamente", "puesto_id": pk}, status=status.HTTP_200_OK)

