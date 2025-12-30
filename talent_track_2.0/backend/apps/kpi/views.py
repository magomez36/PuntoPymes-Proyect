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
