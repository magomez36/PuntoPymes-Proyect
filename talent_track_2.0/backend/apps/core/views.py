from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Empresa
from .serializers import EmpresaSerializer

# Vista para listar todas las empresas
class EmpresaListAPIView(generics.ListAPIView):
    queryset = Empresa.objects.all().order_by('id')
    serializer_class = EmpresaSerializer
