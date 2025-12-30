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
