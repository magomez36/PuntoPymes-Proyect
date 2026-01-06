# apps/kpi/views_rrhh_kpis.py
from django.db import IntegrityError, transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.kpi.models import KPI


# ===== Helpers (empresa desde token) =====
def get_scope(request):
    token = getattr(request, "auth", None)
    if not token:
        raise PermissionDenied("Token inválido o ausente.")
    return {
        "rol": token.get("rol"),
        "empresa_id": token.get("empresa_id"),
        "usuario_id": token.get("usuario_id"),
        "empleado_id": token.get("empleado_id"),
    }


def require_rrhh(request):
    scope = get_scope(request)
    if scope.get("rol") != "rrhh":
        raise PermissionDenied("No autorizado (solo rrhh).")
    if not scope.get("empresa_id"):
        raise PermissionDenied("Token sin empresa_id.")
    return scope


UNIDAD_LABEL = {
    1: "%",
    2: "puntos",
    3: "minutos",
    4: "horas",
}

ORIGEN_LABEL = {
    1: "asistencia",
    2: "evaluacion",
    3: "mixto",
}


def to_dict(obj: KPI):
    return {
        "id": obj.id,
        "codigo": obj.codigo,
        "nombre": obj.nombre,
        "descripcion": obj.descripcion,
        "unidad": obj.unidad,
        "unidad_label": UNIDAD_LABEL.get(obj.unidad, f"desconocido({obj.unidad})"),
        "origen_datos": obj.origen_datos,
        "origen_datos_label": ORIGEN_LABEL.get(obj.origen_datos, f"desconocido({obj.origen_datos})"),
    }


class RRHHKPIListCreateAPIView(APIView):
    """
    HU01 - Ver KPIs (GET)
    HU02 - Crear KPI (POST)
    GET  /api/rrhh/kpis/
    POST /api/rrhh/kpis/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = KPI.objects.filter(empresa_id=empresa_id).order_by("id")
        return Response([to_dict(x) for x in qs], status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        codigo = (request.data.get("codigo") or "").strip()
        nombre = (request.data.get("nombre") or "").strip()
        descripcion = (request.data.get("descripcion") or "").strip()
        unidad = request.data.get("unidad")
        origen_datos = request.data.get("origen_datos")

        if not codigo:
            return Response({"codigo": "Código es obligatorio."}, status=400)
        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)
        if not descripcion:
            return Response({"descripcion": "Descripción es obligatoria."}, status=400)

        try:
            unidad = int(unidad)
        except Exception:
            return Response({"unidad": "Unidad inválida."}, status=400)
        if unidad not in (1, 2, 3, 4):
            return Response({"unidad": "Unidad inválida (1 % | 2 puntos | 3 minutos | 4 horas)."}, status=400)

        try:
            origen_datos = int(origen_datos)
        except Exception:
            return Response({"origen_datos": "Origen inválido."}, status=400)
        if origen_datos not in (1, 2, 3):
            return Response({"origen_datos": "Origen inválido (1 asistencia | 2 evaluacion | 3 mixto)."}, status=400)

        # Reglas típicas: código único por empresa
        if KPI.objects.filter(empresa_id=empresa_id, codigo__iexact=codigo).exists():
            return Response({"codigo": "Ya existe un KPI con ese código en tu empresa."}, status=400)

        with transaction.atomic():
            obj = KPI.objects.create(
                empresa_id=empresa_id,
                codigo=codigo,
                nombre=nombre,
                descripcion=descripcion,
                unidad=unidad,
                origen_datos=origen_datos,
                formula=None,  # NULL SIEMPRE desde backend
            )

        return Response(to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHKPIDetailAPIView(APIView):
    """
    HU03 - Editar KPI (PUT)
    HU04 - Eliminar KPI (DELETE)
    + GET detalle
    GET    /api/rrhh/kpis/<id>/
    PUT    /api/rrhh/kpis/<id>/
    DELETE /api/rrhh/kpis/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return KPI.objects.filter(empresa_id=empresa_id, id=pk).first()

    def get(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(to_dict(obj), status=200)

    def put(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        codigo = (request.data.get("codigo") or "").strip()
        nombre = (request.data.get("nombre") or "").strip()
        descripcion = (request.data.get("descripcion") or "").strip()
        unidad = request.data.get("unidad")
        origen_datos = request.data.get("origen_datos")

        if not codigo:
            return Response({"codigo": "Código es obligatorio."}, status=400)
        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)
        if not descripcion:
            return Response({"descripcion": "Descripción es obligatoria."}, status=400)

        try:
            unidad = int(unidad)
        except Exception:
            return Response({"unidad": "Unidad inválida."}, status=400)
        if unidad not in (1, 2, 3, 4):
            return Response({"unidad": "Unidad inválida (1 % | 2 puntos | 3 minutos | 4 horas)."}, status=400)

        try:
            origen_datos = int(origen_datos)
        except Exception:
            return Response({"origen_datos": "Origen inválido."}, status=400)
        if origen_datos not in (1, 2, 3):
            return Response({"origen_datos": "Origen inválido (1 asistencia | 2 evaluacion | 3 mixto)."}, status=400)

        if KPI.objects.filter(empresa_id=empresa_id, codigo__iexact=codigo).exclude(id=obj.id).exists():
            return Response({"codigo": "Ya existe otro KPI con ese código en tu empresa."}, status=400)

        obj.codigo = codigo
        obj.nombre = nombre
        obj.descripcion = descripcion
        obj.unidad = unidad
        obj.origen_datos = origen_datos

        # formula NO se toca (se mantiene NULL o el valor que ya tenga; tú pediste NULL en inserts)
        obj.save()

        return Response(to_dict(obj), status=200)

    def delete(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        try:
            obj.delete()
        except IntegrityError:
            return Response(
                {"detail": "No se puede eliminar: está siendo usado por plantillas/asignaciones u otros registros."},
                status=409,
            )
        return Response(status=204)
