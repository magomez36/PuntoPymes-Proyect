from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Empresa
from .serializers import EmpresaSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import EmpresaCreateSerializer
from apps.core.models import Empresa
from apps.core.serializers import EmpresaUpdateSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny


# Vista para listar todas las empresas
class EmpresaListAPIView(generics.ListAPIView):
    queryset = Empresa.objects.all().order_by('id')
    serializer_class = EmpresaSerializer


class CrearEmpresaAPIView(APIView):

    def post(self, request):
        serializer = EmpresaCreateSerializer(data=request.data)

        if serializer.is_valid():
            empresa = serializer.save()
            return Response(
                {
                    "id": empresa.id,
                    "razon_social": empresa.razon_social,
                    "nombre_comercial": empresa.nombre_comercial,
                    "ruc_nit": empresa.ruc_nit,
                    "pais": empresa.pais,
                    "moneda": empresa.moneda,
                    "estado": empresa.estado,
                    "creada_el": empresa.creada_el
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ActualizarEmpresaAPIView(APIView):

    def put(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)

        serializer = EmpresaUpdateSerializer(
            empresa,
            data=request.data
        )

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
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ToggleEstadoEmpresaAPIView(APIView):

    def patch(self, request, pk):
        empresa = get_object_or_404(Empresa, pk=pk)

        # TOGGLE: 1 ↔ 2
        empresa.estado = 2 if empresa.estado == 1 else 1
        empresa.save()

        return Response(
            {
                "id": empresa.id,
                "estado": empresa.estado
            },
            status=status.HTTP_200_OK
        )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Empresa
from .serializers import EmpresaSerializer

class EmpresaDetalleEliminarAPIView(APIView):

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
            status=status.HTTP_200_OK
        )
