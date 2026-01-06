# apps/empleados/views_auditor_expedientes.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.usuarios.models import Usuario
from apps.empleados.models import Empleado, Contrato
from apps.asistencia.models import JornadaCalculada

from apps.empleados.serializers_auditor_expedientes import (
    AuditorEmpleadoListSerializer,
    AuditorEmpleadoDetalleSerializer,
    AuditorContratoEmpleadoSerializer,
    AuditorJornadaEmpleadoSerializer,
)


def _get_usuario_tt(request):
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None

    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None

    return (
        Usuario.objects
        .select_related("empresa", "empleado")
        .filter(id=usuario_id)
        .first()
    )


class AuditorEmpleadosListAPIView(APIView):
    # GET /api/auditor/expedientes/empleados/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            Empleado.objects
            .select_related("unidad", "puesto", "manager")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("apellidos", "nombres", "id")
        )

        return Response(AuditorEmpleadoListSerializer(qs, many=True).data, status=200)


class AuditorEmpleadoDetalleAPIView(APIView):
    # GET /api/auditor/expedientes/empleados/<id>/
    def get(self, request, pk):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        emp = get_object_or_404(
            Empleado.objects.select_related("unidad", "puesto", "manager"),
            pk=pk,
            empresa_id=auditor.empresa_id
        )

        return Response(AuditorEmpleadoDetalleSerializer(emp).data, status=200)


class AuditorContratoEmpleadoAPIView(APIView):
    # GET /api/auditor/expedientes/empleados/<id>/contrato/
    def get(self, request, pk):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        # valida empleado en empresa
        emp = get_object_or_404(Empleado, pk=pk, empresa_id=auditor.empresa_id)

        contrato = (
            Contrato.objects
            .filter(empresa_id=auditor.empresa_id, empleado_id=emp.id)
            .order_by("-id")
            .first()
        )

        if not contrato:
            return Response({"detail": "El empleado no tiene contrato registrado."}, status=404)

        return Response(AuditorContratoEmpleadoSerializer(contrato).data, status=200)


class AuditorJornadasEmpleadoAPIView(APIView):
    # GET /api/auditor/expedientes/empleados/<id>/jornadas/
    def get(self, request, pk):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        # valida empleado en empresa
        emp = get_object_or_404(Empleado, pk=pk, empresa_id=auditor.empresa_id)

        qs = (
            JornadaCalculada.objects
            .filter(empresa_id=auditor.empresa_id, empleado_id=emp.id)
            .order_by("-fecha", "-id")[:365]
        )

        return Response(
            {
                "empleado": {
                    "id": emp.id,
                    "nombres": emp.nombres,
                    "apellidos": emp.apellidos,
                    "email": emp.email,
                },
                "results": AuditorJornadaEmpleadoSerializer(qs, many=True).data
            },
            status=200
        )
