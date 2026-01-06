from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.permissions import IsRRHH
from apps.usuarios.scopes import get_scope

from apps.ausencias.models import SaldoVacaciones
from apps.empleados.models import Empleado

from .serializers_rrhh_saldo_vacaciones import (
    SaldoVacacionesListSerializer,
    SaldoVacacionesCreateSerializer,
    SaldoVacacionesPatchPeriodoSerializer,
)


class RRHHSaldosVacacionesListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        qs = (
            SaldoVacaciones.objects
            .select_related("empleado")
            .filter(empresa_id=empresa_id)
            .order_by("-id")
        )
        return Response(SaldoVacacionesListSerializer(qs, many=True).data, status=200)

    def post(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        ser = SaldoVacacionesCreateSerializer(data=request.data, context={"empresa_id": empresa_id})
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        dias_asignados = data["dias_asignados"]
        # por defecto (obligatorio)
        dias_tomados = Decimal("0.00")
        dias_disponibles = dias_asignados  # igual al asignado

        obj = SaldoVacaciones.objects.create(
            empresa_id=empresa_id,
            empleado=data["empleado_obj"],
            periodo=data["periodo"],
            dias_asignados=dias_asignados,
            dias_tomados=dias_tomados,
            dias_disponibles=dias_disponibles,
        )

        obj = SaldoVacaciones.objects.select_related("empleado").get(id=obj.id)
        return Response(SaldoVacacionesListSerializer(obj).data, status=status.HTTP_201_CREATED)


class RRHHSaldosVacacionesPatchDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def patch(self, request, pk):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        obj = get_object_or_404(SaldoVacaciones, id=pk, empresa_id=empresa_id)

        ser = SaldoVacacionesPatchPeriodoSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        nuevo_periodo = ser.validated_data["periodo"]

        # RESTRICCIÓN OBLIGATORIA: no duplicar periodo por empleado
        existe = SaldoVacaciones.objects.filter(
            empresa_id=empresa_id,
            empleado_id=obj.empleado_id,
            periodo=nuevo_periodo
        ).exclude(id=obj.id).exists()

        if existe:
            return Response({"periodo": "Ese periodo ya existe para este empleado."}, status=400)

        obj.periodo = nuevo_periodo
        obj.save()

        obj = SaldoVacaciones.objects.select_related("empleado").get(id=obj.id)
        return Response(SaldoVacacionesListSerializer(obj).data, status=200)

    def delete(self, request, pk):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        obj = SaldoVacaciones.objects.filter(id=pk, empresa_id=empresa_id).first()
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        obj.delete()
        return Response(status=204)


# Helper: empleados de la empresa (para el select del formulario)
class RRHHEmpleadosEmpresaVacacionesHelperAPIView(APIView):
    permission_classes = [IsAuthenticated, IsRRHH]

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        qs = Empleado.objects.filter(empresa_id=empresa_id).order_by("id")
        out = [{"id": e.id, "email": e.email, "nombres": e.nombres, "apellidos": e.apellidos} for e in qs]
        return Response(out, status=200)
