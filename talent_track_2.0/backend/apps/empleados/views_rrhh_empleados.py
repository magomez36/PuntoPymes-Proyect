# apps/empleados/views_rrhh_empleados.py
from datetime import datetime
from django.utils import timezone
from django.db import IntegrityError, transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.empleados.models import Empleado, Contrato
from apps.core.models import UnidadOrganizacional, Puesto


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


ESTADO_LABEL = {
    1: "activo",
    2: "suspendido",
    3: "baja",
}


def parse_date(value, field_name):
    """
    Espera 'YYYY-MM-DD'
    """
    if not value:
        return None
    s = str(value).strip()
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"{field_name} inválido. Usa YYYY-MM-DD.")


def validate_unidad_same_company(empresa_id: int, unidad_id: int):
    u = UnidadOrganizacional.objects.filter(id=unidad_id, empresa_id=empresa_id).first()
    if not u:
        raise PermissionDenied("La unidad organizacional no pertenece a tu empresa o no existe.")
    return u


def validate_puesto_same_company(empresa_id: int, puesto_id: int):
    p = Puesto.objects.filter(id=puesto_id, empresa_id=empresa_id).first()
    if not p:
        raise PermissionDenied("El puesto no pertenece a tu empresa o no existe.")
    return p


def validate_manager_same_company(empresa_id: int, manager_id: int):
    m = Empleado.objects.filter(id=manager_id, empresa_id=empresa_id).first()
    if not m:
        raise PermissionDenied("El manager no pertenece a tu empresa o no existe.")
    return m


def empleado_to_dict(e: Empleado):
    manager_nombre = "N/A"
    if getattr(e, "manager", None):
        mn = (e.manager.nombres or "").strip()
        ma = (e.manager.apellidos or "").strip()
        manager_nombre = (f"{mn} {ma}".strip()) if (mn or ma) else "N/A"

    unidad_nombre = e.unidad.nombre if getattr(e, "unidad", None) else "N/A"
    puesto_nombre = e.puesto.nombre if getattr(e, "puesto", None) else "N/A"

    return {
        "id": e.id,
        "unidad_id": e.unidad_id,
        "unidad_nombre": unidad_nombre,
        "puesto_id": e.puesto_id,
        "puesto_nombre": puesto_nombre,
        "manager_id": e.manager_id,
        "manager_nombre": manager_nombre,
        "nombres": e.nombres,
        "apellidos": e.apellidos,
        "email": e.email,
        "telefono": e.telefono,
        "direccion": e.direccion,
        "fecha_nacimiento": e.fecha_nacimiento.isoformat() if e.fecha_nacimiento else None,
        "fecha_ingreso": e.fecha_ingreso.isoformat() if e.fecha_ingreso else None,
        "estado": e.estado,
        "estado_label": ESTADO_LABEL.get(e.estado, f"desconocido({e.estado})"),
    }


class RRHHEmpleadosMinHelperAPIView(APIView):
    """
    Helper para selects (Managers):
      GET /api/rrhh/helpers/empleados-min/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            Empleado.objects
            .filter(empresa_id=empresa_id)
            .only("id", "nombres", "apellidos")
            .order_by("id")
        )
        data = []
        for e in qs:
            nn = (e.nombres or "").strip()
            aa = (e.apellidos or "").strip()
            label = (f"{nn} {aa}".strip()) if (nn or aa) else f"Empleado #{e.id}"
            data.append({"id": e.id, "label": label})
        return Response(data, status=200)


class RRHHEmpleadosListCreateAPIView(APIView):
    """
    HU01 - Ver Empleados (GET)
    HU02 - Crear Empleado (POST)
    Endpoints:
      GET  /api/rrhh/empleados/
      POST /api/rrhh/empleados/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            Empleado.objects
            .select_related("unidad", "puesto", "manager")
            .filter(empresa_id=empresa_id)
            .order_by("id")
        )
        return Response([empleado_to_dict(e) for e in qs], status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        unidad_id = request.data.get("unidad_id")
        puesto_id = request.data.get("puesto_id")
        manager_id = request.data.get("manager_id")

        nombres = (request.data.get("nombres") or "").strip()
        apellidos = (request.data.get("apellidos") or "").strip()
        email = (request.data.get("email") or "").strip().lower()
        telefono = (request.data.get("telefono") or "").strip()
        direccion = (request.data.get("direccion") or "").strip()
        fecha_nacimiento_raw = request.data.get("fecha_nacimiento")
        estado = request.data.get("estado")

        if not unidad_id:
            return Response({"unidad_id": "Unidad es obligatoria."}, status=400)
        if not puesto_id:
            return Response({"puesto_id": "Puesto es obligatorio."}, status=400)
        if not nombres:
            return Response({"nombres": "Nombres es obligatorio."}, status=400)
        if not apellidos:
            return Response({"apellidos": "Apellidos es obligatorio."}, status=400)
        if not email:
            return Response({"email": "Email es obligatorio."}, status=400)
        if not telefono:
            return Response({"telefono": "Teléfono es obligatorio."}, status=400)

        try:
            unidad_id = int(unidad_id)
            puesto_id = int(puesto_id)
        except Exception:
            return Response({"detail": "unidad_id o puesto_id inválido."}, status=400)

        # manager opcional
        manager = None
        if manager_id not in (None, "", 0, "0"):
            try:
                manager_id = int(manager_id)
            except Exception:
                return Response({"manager_id": "manager_id inválido."}, status=400)
            manager = validate_manager_same_company(empresa_id, manager_id)

        try:
            estado = int(estado)
        except Exception:
            return Response({"estado": "Estado inválido."}, status=400)
        if estado not in (1, 2, 3):
            return Response({"estado": "Estado inválido (1 activo, 2 suspendido, 3 baja)."}, status=400)

        try:
            fecha_nacimiento = parse_date(fecha_nacimiento_raw, "fecha_nacimiento")
        except ValueError as e:
            return Response({"fecha_nacimiento": str(e)}, status=400)

        # Validación email único
        if Empleado.objects.filter(email__iexact=email).exists():
            return Response({"email": "Ya existe un empleado con ese email."}, status=400)

        # Validar unidad/puesto de la empresa
        unidad = validate_unidad_same_company(empresa_id, unidad_id)
        puesto = validate_puesto_same_company(empresa_id, puesto_id)

        fecha_ingreso = timezone.localdate()  # backend registra fecha actual

        with transaction.atomic():
            obj = Empleado.objects.create(
                empresa_id=empresa_id,      # SIEMPRE desde token
                unidad=unidad,
                puesto=puesto,
                manager=manager,            # puede ser None
                nombres=nombres,
                apellidos=apellidos,
                documento=None,             # NULL SIEMPRE
                email=email,
                telefono=telefono,
                direccion=direccion,
                fecha_nacimiento=fecha_nacimiento,
                fecha_ingreso=fecha_ingreso,
                foto_url=None,              # NULL SIEMPRE
                estado=estado,
            )

        obj = (
            Empleado.objects
            .select_related("unidad", "puesto", "manager")
            .get(id=obj.id)
        )
        return Response(empleado_to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHEmpleadosDetailAPIView(APIView):
    """
    HU03 - Actualizar Empleado (PUT)
    HU04 - Eliminar Empleado (DELETE) (también elimina contrato)
    + GET detalle para editar
    Endpoints:
      GET    /api/rrhh/empleados/<id>/
      PUT    /api/rrhh/empleados/<id>/
      DELETE /api/rrhh/empleados/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return (
            Empleado.objects
            .select_related("unidad", "puesto", "manager")
            .filter(empresa_id=empresa_id, id=pk)
            .first()
        )

    def get(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(empleado_to_dict(obj), status=200)

    def put(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        unidad_id = request.data.get("unidad_id")
        puesto_id = request.data.get("puesto_id")
        manager_id = request.data.get("manager_id")

        nombres = (request.data.get("nombres") or "").strip()
        apellidos = (request.data.get("apellidos") or "").strip()
        email = (request.data.get("email") or "").strip().lower()
        telefono = (request.data.get("telefono") or "").strip()
        direccion = (request.data.get("direccion") or "").strip()
        fecha_nacimiento_raw = request.data.get("fecha_nacimiento")

        if not unidad_id:
            return Response({"unidad_id": "Unidad es obligatoria."}, status=400)
        if not puesto_id:
            return Response({"puesto_id": "Puesto es obligatorio."}, status=400)
        if not nombres:
            return Response({"nombres": "Nombres es obligatorio."}, status=400)
        if not apellidos:
            return Response({"apellidos": "Apellidos es obligatorio."}, status=400)
        if not email:
            return Response({"email": "Email es obligatorio."}, status=400)
        if not telefono:
            return Response({"telefono": "Teléfono es obligatorio."}, status=400)

        try:
            unidad_id = int(unidad_id)
            puesto_id = int(puesto_id)
        except Exception:
            return Response({"detail": "unidad_id o puesto_id inválido."}, status=400)

        # manager opcional (y no puede ser el mismo empleado)
        manager = None
        if manager_id in (None, "", 0, "0"):
            manager = None
        else:
            try:
                manager_id = int(manager_id)
            except Exception:
                return Response({"manager_id": "manager_id inválido."}, status=400)
            if manager_id == obj.id:
                return Response({"manager_id": "Un empleado no puede ser su propio manager."}, status=400)
            manager = validate_manager_same_company(empresa_id, manager_id)

        try:
            fecha_nacimiento = parse_date(fecha_nacimiento_raw, "fecha_nacimiento")
        except ValueError as e:
            return Response({"fecha_nacimiento": str(e)}, status=400)

        # Validación email único (excluye el propio)
        if Empleado.objects.filter(email__iexact=email).exclude(id=obj.id).exists():
            return Response({"email": "Ya existe otro empleado con ese email."}, status=400)

        unidad = validate_unidad_same_company(empresa_id, unidad_id)
        puesto = validate_puesto_same_company(empresa_id, puesto_id)

        obj.unidad = unidad
        obj.puesto = puesto
        obj.manager = manager
        obj.nombres = nombres
        obj.apellidos = apellidos
        obj.email = email
        obj.telefono = telefono
        obj.direccion = direccion
        obj.fecha_nacimiento = fecha_nacimiento
        obj.save()

        obj = self.get_obj(empresa_id, pk)
        return Response(empleado_to_dict(obj), status=200)

    def delete(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        # Requisito: "también se elimina el contrato"
        try:
            Contrato.objects.filter(empleado_id=obj.id).delete()
        except Exception:
            pass

        try:
            obj.delete()
        except IntegrityError:
            return Response(
                {"detail": "No se puede eliminar: está siendo usado en otros registros."},
                status=409
            )

        return Response(status=204)
