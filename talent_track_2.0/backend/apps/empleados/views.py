from django.shortcuts import render

# Create your views here.
# apps/empleados/views.py
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.empleados.models import Empleado
from apps.core.models import UnidadOrganizacional, Puesto

from .serializers import EmpleadoListSerializer, EmpleadoCreateSerializer, EmpleadoUpdateSerializer


# ---------------------------
# Helpers para selects
# ---------------------------

class UnidadesPorEmpresaAPIView(APIView):
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = UnidadOrganizacional.objects.filter(empresa_id=empresa_id).order_by("id")
        data = [{"id": u.id, "nombre": u.nombre} for u in qs]
        return Response(data, status=200)


class PuestosPorEmpresaAPIView(APIView):
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = Puesto.objects.filter(empresa_id=empresa_id).select_related("unidad").order_by("id")
        data = [{"id": p.id, "nombre": p.nombre, "unidad_id": p.unidad_id, "unidad_nombre": p.unidad.nombre if p.unidad else None} for p in qs]
        return Response(data, status=200)


# ---------------------------
# CRUD Empleados Empresa
# ---------------------------

class EmpleadosEmpresaListCreateAPIView(APIView):
    def get(self, request):
        qs = (
            Empleado.objects
            .select_related("empresa", "unidad", "puesto", "manager")
            .order_by("id")
        )
        return Response(EmpleadoListSerializer(qs, many=True).data, status=200)

    def post(self, request):
        ser = EmpleadoCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        e = ser.save()

        e = (
            Empleado.objects
            .select_related("empresa", "unidad", "puesto", "manager")
            .filter(id=e.id)
            .first()
        )
        return Response(EmpleadoListSerializer(e).data, status=status.HTTP_201_CREATED)


class EmpleadoEmpresaDetalleAPIView(APIView):
    def get(self, request, pk):
        e = (
            Empleado.objects
            .select_related("empresa", "unidad", "puesto", "manager")
            .filter(id=pk)
            .first()
        )
        if not e:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(EmpleadoListSerializer(e).data, status=200)

    def put(self, request, pk):
        e = Empleado.objects.filter(id=pk).first()
        if not e:
            return Response({"detail": "No encontrado."}, status=404)

        ser = EmpleadoUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        e = ser.update(e, ser.validated_data)

        e = (
            Empleado.objects
            .select_related("empresa", "unidad", "puesto", "manager")
            .filter(id=e.id)
            .first()
        )
        return Response(EmpleadoListSerializer(e).data, status=200)

    def delete(self, request, pk):
        e = Empleado.objects.filter(id=pk).first()
        if not e:
            return Response({"detail": "No encontrado."}, status=404)

        # Coherencia: Usuario.empleado es SET_NULL, así que al borrar empleado no rompe usuarios.
        e.delete()
        return Response(status=204)


class EmpleadoToggleEstadoAPIView(APIView):
    def patch(self, request, pk):
        e = Empleado.objects.filter(id=pk).first()
        if not e:
            return Response({"detail": "No encontrado."}, status=404)

        # ciclo 1->2->3->1 (activo, suspendido, baja)
        if e.estado == 1:
            e.estado = 2
        elif e.estado == 2:
            e.estado = 3
        else:
            e.estado = 1

        e.save()
        return Response({"estado": e.estado}, status=200)
