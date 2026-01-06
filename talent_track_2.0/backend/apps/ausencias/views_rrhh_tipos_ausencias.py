# apps/ausencias/views_rrhh_tipos_ausencias.py
from django.db import IntegrityError, transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.ausencias.models import TipoAusencia


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


def to_dict(obj: TipoAusencia):
    return {
        "id": obj.id,
        "nombre": obj.nombre,
        "afecta_sueldo": bool(obj.afecta_sueldo),
        "requiere_soporte": bool(obj.requiere_soporte),
    }


class RRHHTiposAusenciasListCreateAPIView(APIView):
    """
    HU01 - Ver tipos de ausencias (GET)
    HU02 - Crear tipo de ausencia (POST)
    GET  /api/rrhh/tipos-ausencias/
    POST /api/rrhh/tipos-ausencias/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = TipoAusencia.objects.filter(empresa_id=empresa_id).order_by("id")
        return Response([to_dict(x) for x in qs], status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        nombre = (request.data.get("nombre") or "").strip()
        afecta_sueldo = request.data.get("afecta_sueldo", False)
        requiere_soporte = request.data.get("requiere_soporte", False)

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)

        # normalizar booleans (por si llega "true"/"false")
        afecta_sueldo = True if str(afecta_sueldo).lower() in ("1", "true", "t", "yes", "si") else False
        requiere_soporte = True if str(requiere_soporte).lower() in ("1", "true", "t", "yes", "si") else False

        # regla práctica: nombre único por empresa (si quieres)
        if TipoAusencia.objects.filter(empresa_id=empresa_id, nombre__iexact=nombre).exists():
            return Response({"nombre": "Ya existe un tipo de ausencia con ese nombre."}, status=400)

        with transaction.atomic():
            obj = TipoAusencia.objects.create(
                empresa_id=empresa_id,
                nombre=nombre,
                afecta_sueldo=afecta_sueldo,
                requiere_soporte=requiere_soporte,
            )

        return Response(to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHTiposAusenciasDetailAPIView(APIView):
    """
    HU03 - Actualizar tipo ausencia (PUT)
    HU04 - Eliminar tipo ausencia (DELETE)
    + GET detalle
    GET    /api/rrhh/tipos-ausencias/<id>/
    PUT    /api/rrhh/tipos-ausencias/<id>/
    DELETE /api/rrhh/tipos-ausencias/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return TipoAusencia.objects.filter(empresa_id=empresa_id, id=pk).first()

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

        nombre = (request.data.get("nombre") or "").strip()
        afecta_sueldo = request.data.get("afecta_sueldo", False)
        requiere_soporte = request.data.get("requiere_soporte", False)

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)

        afecta_sueldo = True if str(afecta_sueldo).lower() in ("1", "true", "t", "yes", "si") else False
        requiere_soporte = True if str(requiere_soporte).lower() in ("1", "true", "t", "yes", "si") else False

        if TipoAusencia.objects.filter(empresa_id=empresa_id, nombre__iexact=nombre).exclude(id=obj.id).exists():
            return Response({"nombre": "Ya existe otro tipo de ausencia con ese nombre."}, status=400)

        obj.nombre = nombre
        obj.afecta_sueldo = afecta_sueldo
        obj.requiere_soporte = requiere_soporte
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
                {"detail": "No se puede eliminar: está siendo usado por solicitudes u otros registros."},
                status=409,
            )

        return Response(status=204)
