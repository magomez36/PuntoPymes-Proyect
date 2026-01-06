# apps/core/views_rrhh_puestos.py
from decimal import Decimal, InvalidOperation

from django.db import IntegrityError, transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.core.models import Puesto, UnidadOrganizacional


# ====== Helpers (mismo patrón que EPICA 21) ======
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


def parse_decimal_2(value, field="salario_referencial"):
    """
    numeric(12,2):
    - Requerimos valor >= 0
    - Permitimos "1234", "1234.5", "1234.50"
    """
    if value is None or value == "":
        raise ValueError(f"{field} es obligatorio.")
    try:
        d = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError(f"{field} inválido.")
    if d < 0:
        raise ValueError(f"{field} no puede ser negativo.")
    # Redondeo a 2 decimales
    return d.quantize(Decimal("0.01"))


def puesto_to_dict(p: Puesto):
    return {
        "id": p.id,
        "unidad_id": p.unidad_id,
        "unidad_nombre": (p.unidad.nombre if p.unidad else "N/A"),
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "nivel": p.nivel,
        "salario_referencial": str(p.salario_referencial) if p.salario_referencial is not None else "0.00",
    }


def validate_unidad_same_company(empresa_id: int, unidad_id: int):
    u = UnidadOrganizacional.objects.filter(id=unidad_id, empresa_id=empresa_id).first()
    if not u:
        raise PermissionDenied("La unidad organizacional no pertenece a tu empresa o no existe.")
    return u


class RRHHPuestosListCreateAPIView(APIView):
    """
    HU01 - Ver Puestos (GET)
    HU02 - Crear Puesto (POST)
    Endpoints:
      GET  /api/rrhh/puestos/
      POST /api/rrhh/puestos/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            Puesto.objects
            .select_related("unidad")
            .filter(empresa_id=empresa_id)
            .order_by("id")
        )
        return Response([puesto_to_dict(p) for p in qs], status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        nombre = (request.data.get("nombre") or "").strip()
        descripcion = (request.data.get("descripcion") or "").strip()
        nivel = (request.data.get("nivel") or "").strip()
        unidad_id = request.data.get("unidad_id")
        salario_raw = request.data.get("salario_referencial")

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)
        if not descripcion:
            return Response({"descripcion": "Descripción es obligatoria."}, status=400)
        if not nivel:
            return Response({"nivel": "Nivel es obligatorio."}, status=400)

        try:
            unidad_id = int(unidad_id)
        except Exception:
            return Response({"unidad_id": "unidad_id inválido."}, status=400)

        try:
            salario = parse_decimal_2(salario_raw, "salario_referencial")
        except ValueError as e:
            return Response({"salario_referencial": str(e)}, status=400)

        # unidad debe ser de la empresa del token
        unidad = validate_unidad_same_company(empresa_id, unidad_id)

        with transaction.atomic():
            obj = Puesto.objects.create(
                empresa_id=empresa_id,    # SIEMPRE desde token
                unidad=unidad,
                nombre=nombre,
                descripcion=descripcion,
                nivel=nivel,
                salario_referencial=salario,
            )

        obj = Puesto.objects.select_related("unidad").get(id=obj.id)
        return Response(puesto_to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHPuestosDetailAPIView(APIView):
    """
    HU03 - Actualizar Puesto (PUT)
    HU04 - Eliminar Puesto (DELETE)
    + GET detalle para cargar form
    Endpoints:
      GET    /api/rrhh/puestos/<id>/
      PUT    /api/rrhh/puestos/<id>/
      DELETE /api/rrhh/puestos/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return (
            Puesto.objects
            .select_related("unidad")
            .filter(empresa_id=empresa_id, id=pk)
            .first()
        )

    def get(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(puesto_to_dict(obj), status=200)

    def put(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        nombre = (request.data.get("nombre") or "").strip()
        descripcion = (request.data.get("descripcion") or "").strip()
        nivel = (request.data.get("nivel") or "").strip()
        unidad_id = request.data.get("unidad_id")
        salario_raw = request.data.get("salario_referencial")

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)
        if not descripcion:
            return Response({"descripcion": "Descripción es obligatoria."}, status=400)
        if not nivel:
            return Response({"nivel": "Nivel es obligatorio."}, status=400)

        try:
            unidad_id = int(unidad_id)
        except Exception:
            return Response({"unidad_id": "unidad_id inválido."}, status=400)

        try:
            salario = parse_decimal_2(salario_raw, "salario_referencial")
        except ValueError as e:
            return Response({"salario_referencial": str(e)}, status=400)

        unidad = validate_unidad_same_company(empresa_id, unidad_id)

        obj.unidad = unidad
        obj.nombre = nombre
        obj.descripcion = descripcion
        obj.nivel = nivel
        obj.salario_referencial = salario
        obj.save()

        obj = self.get_obj(empresa_id, pk)
        return Response(puesto_to_dict(obj), status=200)

    def delete(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        try:
            obj.delete()
        except IntegrityError:
            return Response(
                {"detail": "No se puede eliminar: está siendo usado en otros registros."},
                status=409
            )

        return Response(status=204)
