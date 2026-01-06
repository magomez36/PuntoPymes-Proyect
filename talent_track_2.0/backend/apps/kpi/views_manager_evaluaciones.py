# apps/kpi/views_manager_evaluaciones.py
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.usuarios.models import Usuario
from apps.empleados.models import Empleado
from apps.kpi.models import EvaluacionDesempeno
from apps.kpi.serializers_manager_evaluaciones import (
    EvaluacionListSerializer,
    EvaluacionCreateSerializer,
    EvaluacionUpdateSerializer,
)


def _get_usuario_tt(request):
    """
    Asume que request.user es AuthUser (accounts.AuthUser) y está enlazado a usuarios.Usuario.
    """
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None

    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None

    return Usuario.objects.select_related("empleado", "empresa").filter(id=usuario_id).first()


class ManagerMiEquipoEmpleadosHelperAPIView(APIView):
    """
    GET /api/manager/helpers/mi-equipo/empleados/
    Retorna empleados cuyo manager es el empleado del manager logueado (mis subordinados).
    """
    def get(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response([], status=200)

        qs = (
            Empleado.objects
            .filter(empresa_id=u.empresa_id, manager_id=u.empleado_id)
            .order_by("id")
            .values("id", "nombres", "apellidos", "email")
        )
        return Response(list(qs), status=200)


class ManagerEvaluacionesListCreateAPIView(APIView):
    """
    GET  /api/manager/evaluaciones/
    POST /api/manager/evaluaciones/crear/
    """
    def get(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response([], status=200)

        qs = (
            EvaluacionDesempeno.objects
            .select_related("empleado", "evaluador")
            .filter(
                empresa_id=u.empresa_id,
                empleado__manager_id=u.empleado_id,
            )
            .order_by("-fecha", "-id")
        )
        return Response(EvaluacionListSerializer(qs, many=True).data, status=200)

    def post(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        ser = EvaluacionCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        empleado_id = data["empleado_id"]

        # Validar empleado pertenece a mi equipo y a mi empresa
        emp = Empleado.objects.filter(
            id=empleado_id,
            empresa_id=u.empresa_id,
            manager_id=u.empleado_id
        ).first()
        if not emp:
            return Response({"empleado_id": "Empleado no pertenece a tu equipo."}, status=400)

        obj = EvaluacionDesempeno.objects.create(
            empresa_id=u.empresa_id,
            empleado_id=emp.id,
            evaluador_id=u.empleado_id,  # evaluador es Empleado (manager)
            periodo=data["periodo"],
            tipo=data["tipo"],
            instrumento=data["instrumento"],
            puntaje_total=data["puntaje_total"],
            comentarios=data.get("comentarios") or "",
            fecha=timezone.now(),
        )

        obj = EvaluacionDesempeno.objects.select_related("empleado", "evaluador").get(id=obj.id)
        return Response(EvaluacionListSerializer(obj).data, status=status.HTTP_201_CREATED)


class ManagerEvaluacionDetalleAPIView(APIView):
    """
    GET    /api/manager/evaluaciones/<id>/
    PUT    /api/manager/evaluaciones/<id>/
    DELETE /api/manager/evaluaciones/<id>/
    """
    def get(self, request, pk):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        obj = (
            EvaluacionDesempeno.objects
            .select_related("empleado", "evaluador")
            .filter(id=pk, empresa_id=u.empresa_id, empleado__manager_id=u.empleado_id)
            .first()
        )
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        return Response(EvaluacionListSerializer(obj).data, status=200)

    def put(self, request, pk):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        obj = EvaluacionDesempeno.objects.filter(
            id=pk,
            empresa_id=u.empresa_id,
            empleado__manager_id=u.empleado_id
        ).first()
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        # Opcional (más seguro): sólo el mismo manager que creó puede editar
        if obj.evaluador_id and obj.evaluador_id != u.empleado_id:
            return Response({"detail": "No puedes editar evaluaciones creadas por otro evaluador."}, status=403)

        ser = EvaluacionUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        obj.periodo = data["periodo"]
        obj.tipo = data["tipo"]
        obj.instrumento = data["instrumento"]
        obj.puntaje_total = data["puntaje_total"]
        obj.comentarios = data.get("comentarios") or ""
        obj.save()

        obj = EvaluacionDesempeno.objects.select_related("empleado", "evaluador").get(id=obj.id)
        return Response(EvaluacionListSerializer(obj).data, status=200)

    def delete(self, request, pk):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        obj = EvaluacionDesempeno.objects.filter(
            id=pk,
            empresa_id=u.empresa_id,
            empleado__manager_id=u.empleado_id
        ).first()
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        if obj.evaluador_id and obj.evaluador_id != u.empleado_id:
            return Response({"detail": "No puedes eliminar evaluaciones creadas por otro evaluador."}, status=403)

        obj.delete()
        return Response(status=204)
