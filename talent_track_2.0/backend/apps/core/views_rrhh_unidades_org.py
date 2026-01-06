# apps/core/views_rrhh_unidades_org.py
from django.db import IntegrityError, transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.core.models import UnidadOrganizacional


# ====== Helpers de seguridad (empresa desde TOKEN) ======
def get_scope(request):
    """
    Contexto desde el token (SimpleJWT):
    - rol
    - empresa_id
    - usuario_id
    - empleado_id
    """
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


TIPO_LABEL = {1: "sede", 2: "area", 3: "depto"}
ESTADO_LABEL = {1: "activa", 2: "inactiva"}


def unidad_to_dict(u: UnidadOrganizacional):
    return {
        "id": u.id,
        "unidad_padre_id": u.unidad_padre_id,
        "unidad_padre_nombre": (u.unidad_padre.nombre if u.unidad_padre else "N/A"),
        "nombre": (u.nombre if u.nombre else "N/A"),
        "tipo": u.tipo,
        "tipo_label": TIPO_LABEL.get(u.tipo, f"desconocido({u.tipo})"),
        "ubicacion": u.ubicacion,
        "estado": u.estado,
        "estado_label": ESTADO_LABEL.get(u.estado, f"desconocido({u.estado})"),
        "creada_el": u.creada_el,
    }


def validate_parent_same_company(empresa_id: int, unidad_padre_id):
    if not unidad_padre_id:
        return None

    parent = UnidadOrganizacional.objects.filter(
        id=unidad_padre_id,
        empresa_id=empresa_id
    ).first()
    if not parent:
        raise PermissionDenied("La unidad_padre no pertenece a tu empresa o no existe.")
    return parent


def validate_no_cycle(current_id: int, new_parent: UnidadOrganizacional):
    """
    Evita:
    - parent == self
    - ciclos en la jerarquía (subir por padres y no encontrarme)
    """
    if not new_parent:
        return

    if new_parent.id == current_id:
        raise PermissionDenied("Una unidad no puede ser padre de sí misma.")

    # subir por la cadena de padres
    cursor = new_parent
    guard = 0
    while cursor and guard < 200:
        if cursor.id == current_id:
            raise PermissionDenied("Jerarquía inválida: causaría un ciclo.")
        cursor = cursor.unidad_padre
        guard += 1


class RRHHUnidadesOrgListCreateAPIView(APIView):
    """
    HU01 - Ver Unidades Organizacionales (GET)
    HU02 - Crear Unidad Organizacional (POST)
    Endpoint:
      GET  /api/rrhh/unidades-organizacionales/
      POST /api/rrhh/unidades-organizacionales/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            UnidadOrganizacional.objects
            .select_related("unidad_padre")
            .filter(empresa_id=empresa_id)
            .order_by("id")
        )
        data = [unidad_to_dict(u) for u in qs]
        return Response(data, status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        nombre = (request.data.get("nombre") or "").strip()
        ubicacion = (request.data.get("ubicacion") or "").strip()
        tipo = request.data.get("tipo")
        unidad_padre_id = request.data.get("unidad_padre_id")

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)
        if not ubicacion:
            return Response({"ubicacion": "Ubicación es obligatoria."}, status=400)

        try:
            tipo = int(tipo)
        except Exception:
            return Response({"tipo": "Tipo inválido."}, status=400)

        if tipo not in (1, 2, 3):
            return Response({"tipo": "Tipo inválido (1 sede, 2 area, 3 depto)."}, status=400)

        # unidad_padre (opcional) pero debe ser de la misma empresa
        parent = None
        if unidad_padre_id not in (None, "", 0, "0"):
            try:
                unidad_padre_id = int(unidad_padre_id)
            except Exception:
                return Response({"unidad_padre_id": "unidad_padre_id inválido."}, status=400)
            parent = validate_parent_same_company(empresa_id, unidad_padre_id)

        with transaction.atomic():
            obj = UnidadOrganizacional.objects.create(
                empresa_id=empresa_id,               # SIEMPRE desde token
                unidad_padre=parent,                 # puede ser None
                nombre=nombre,
                tipo=tipo,
                ubicacion=ubicacion,
                estado=1,                            # por defecto activa
                creada_el=timezone.now(),            # backend genera
            )

        obj = UnidadOrganizacional.objects.select_related("unidad_padre").get(id=obj.id)
        return Response(unidad_to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHUnidadesOrgDetailAPIView(APIView):
    """
    HU03 - Actualizar Unidad Organizacional (PUT)
    HU04 - Eliminar Unidad Organizacional (DELETE)
    + GET detalle para cargar form (editar)
    Endpoint:
      GET    /api/rrhh/unidades-organizacionales/<id>/
      PUT    /api/rrhh/unidades-organizacionales/<id>/
      DELETE /api/rrhh/unidades-organizacionales/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return (
            UnidadOrganizacional.objects
            .select_related("unidad_padre")
            .filter(empresa_id=empresa_id, id=pk)
            .first()
        )

    def get(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(unidad_to_dict(obj), status=200)

    def put(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        # Campos editables:
        # - unidad_padre_id
        # - nombre
        # - tipo
        # - ubicacion
        # - estado
        nombre = (request.data.get("nombre") or "").strip()
        ubicacion = (request.data.get("ubicacion") or "").strip()
        tipo = request.data.get("tipo")
        estado = request.data.get("estado")
        unidad_padre_id = request.data.get("unidad_padre_id")

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)
        if not ubicacion:
            return Response({"ubicacion": "Ubicación es obligatoria."}, status=400)

        try:
            tipo = int(tipo)
        except Exception:
            return Response({"tipo": "Tipo inválido."}, status=400)
        if tipo not in (1, 2, 3):
            return Response({"tipo": "Tipo inválido (1 sede, 2 area, 3 depto)."}, status=400)

        try:
            estado = int(estado)
        except Exception:
            return Response({"estado": "Estado inválido."}, status=400)
        if estado not in (1, 2):
            return Response({"estado": "Estado inválido (1 activa, 2 inactiva)."}, status=400)

        # Parent (opcional)
        parent = None
        if unidad_padre_id in (None, "", 0, "0"):
            parent = None
        else:
            try:
                unidad_padre_id = int(unidad_padre_id)
            except Exception:
                return Response({"unidad_padre_id": "unidad_padre_id inválido."}, status=400)

            parent = validate_parent_same_company(empresa_id, unidad_padre_id)
            validate_no_cycle(obj.id, parent)

        obj.nombre = nombre
        obj.tipo = tipo
        obj.ubicacion = ubicacion
        obj.estado = estado
        obj.unidad_padre = parent
        obj.save()

        obj = self.get_obj(empresa_id, pk)
        return Response(unidad_to_dict(obj), status=200)

    def delete(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        try:
            obj.delete()
        except IntegrityError:
            # Si hay FK PROTECT desde otros modelos (ej: Puesto), aquí caería
            return Response(
                {"detail": "No se puede eliminar: está siendo usada en otros registros."},
                status=409
            )

        return Response(status=204)
