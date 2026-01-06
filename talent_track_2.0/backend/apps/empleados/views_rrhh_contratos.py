# apps/empleados/views_rrhh_contratos.py
from decimal import Decimal, InvalidOperation
from datetime import datetime

from django.db import transaction, IntegrityError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.empleados.models import Contrato, Empleado
from apps.asistencia.models import Turno


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


TIPO_LABEL = {
    1: "indefinido",
    2: "plazo",
    3: "temporal",
    4: "practicante",
}

ESTADO_LABEL = {
    1: "activo",
    2: "inactivo",
}


def parse_date(value, field):
    if value in (None, "", "null"):
        return None
    s = str(value).strip()
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"{field} inválido. Usa YYYY-MM-DD.")


def parse_int_non_negative(value, field):
    if value is None or value == "":
        raise ValueError(f"{field} es obligatorio.")
    try:
        n = int(value)
    except Exception:
        raise ValueError(f"{field} inválido.")
    if n < 0:
        raise ValueError(f"{field} no puede ser negativo.")
    return n


def parse_decimal_2(value, field):
    if value is None or value == "":
        raise ValueError(f"{field} es obligatorio.")
    try:
        d = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError(f"{field} inválido.")
    if d < 0:
        raise ValueError(f"{field} no puede ser negativo.")
    return d.quantize(Decimal("0.01"))


def validate_empleado_company(empresa_id, empleado_id):
    e = Empleado.objects.filter(empresa_id=empresa_id, id=empleado_id).first()
    if not e:
        raise PermissionDenied("Empleado no pertenece a tu empresa o no existe.")
    return e


def validate_turno_company(empresa_id, turno_id):
    if turno_id in (None, "", 0, "0"):
        return None
    try:
        tid = int(turno_id)
    except Exception:
        raise ValueError("turno_base_id inválido.")
    t = Turno.objects.filter(empresa_id=empresa_id, id=tid).first()
    if not t:
        raise PermissionDenied("Turno no pertenece a tu empresa o no existe.")
    return t


def contrato_to_dict(c: Contrato):
    e = c.empleado
    t = getattr(c, "turno_base", None)

    return {
        "id": c.id,
        "empleado_id": c.empleado_id,
        "empleado_nombres": e.nombres if e else "",
        "empleado_apellidos": e.apellidos if e else "",
        "empleado_email": e.email if e else "",

        "turno_base_id": c.turno_base_id,
        "turno_base_nombre": (t.nombre if t else "Sin turno base"),

        "tipo": c.tipo,
        "tipo_label": TIPO_LABEL.get(c.tipo, f"desconocido({c.tipo})"),

        "fecha_inicio": c.fecha_inicio.isoformat() if c.fecha_inicio else None,
        "fecha_fin": c.fecha_fin.isoformat() if c.fecha_fin else None,

        "salario_base": str(c.salario_base) if c.salario_base is not None else "0.00",
        "jornada_semanal_horas": c.jornada_semanal_horas,

        "estado": c.estado,
        "estado_label": ESTADO_LABEL.get(c.estado, f"desconocido({c.estado})"),
    }


# ========= HELPERS =========

class RRHHTurnosMinHelperAPIView(APIView):
    """
    GET /api/rrhh/helpers/turnos-min/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = Turno.objects.filter(empresa_id=empresa_id).only("id", "nombre").order_by("id")
        return Response([{"id": t.id, "nombre": t.nombre} for t in qs], status=200)


class RRHHEmpleadosSinContratoHelperAPIView(APIView):
    """
    GET /api/rrhh/helpers/empleados-sin-contrato/
    - Solo devuelve empleados de la empresa que NO tengan contrato.
    - Para edición: puedes pasar ?include_empleado_id=XX para incluir el actual aunque ya tenga contrato.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]
        include_id = request.query_params.get("include_empleado_id")

        empleados_con_contrato = Contrato.objects.filter(
            empresa_id=empresa_id
        ).values_list("empleado_id", flat=True)

        qs = Empleado.objects.filter(empresa_id=empresa_id).exclude(id__in=empleados_con_contrato).only(
            "id", "email", "nombres", "apellidos"
        )

        data = []
        for e in qs.order_by("id"):
            label = e.email or f"Empleado #{e.id}"
            data.append({"id": e.id, "email": e.email, "label": label})

        # incluir empleado actual (edición) si lo piden
        if include_id not in (None, "", "0", 0):
            try:
                inc = int(include_id)
            except Exception:
                inc = None
            if inc:
                e = Empleado.objects.filter(empresa_id=empresa_id, id=inc).only("id", "email").first()
                if e:
                    if not any(x["id"] == e.id for x in data):
                        data.insert(0, {"id": e.id, "email": e.email, "label": e.email or f"Empleado #{e.id}"})

        return Response(data, status=200)


# ========= CRUD CONTRATOS =========

class RRHHContratosListCreateAPIView(APIView):
    """
    HU01 - Ver contratos (GET)
    HU02 - Crear contrato (POST)
    GET  /api/rrhh/contratos/
    POST /api/rrhh/contratos/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            Contrato.objects
            .select_related("empleado", "turno_base")
            .filter(empresa_id=empresa_id)
            .order_by("id")
        )
        return Response([contrato_to_dict(c) for c in qs], status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        empleado_id = request.data.get("empleado_id")
        turno_base_id = request.data.get("turno_base_id")

        tipo = request.data.get("tipo")
        fecha_inicio_raw = request.data.get("fecha_inicio")
        fecha_fin_raw = request.data.get("fecha_fin")
        salario_raw = request.data.get("salario_base")
        jornada_raw = request.data.get("jornada_semanal_horas")

        # básicos
        try:
            empleado_id = int(empleado_id)
        except Exception:
            return Response({"empleado_id": "empleado_id inválido."}, status=400)

        try:
            tipo = int(tipo)
        except Exception:
            return Response({"tipo": "Tipo inválido."}, status=400)
        if tipo not in (1, 2, 3, 4):
            return Response({"tipo": "Tipo inválido (1..4)."}, status=400)

        try:
            fecha_inicio = parse_date(fecha_inicio_raw, "fecha_inicio")
        except ValueError as e:
            return Response({"fecha_inicio": str(e)}, status=400)
        if not fecha_inicio:
            return Response({"fecha_inicio": "fecha_inicio es obligatoria."}, status=400)

        try:
            fecha_fin = parse_date(fecha_fin_raw, "fecha_fin")
        except ValueError as e:
            return Response({"fecha_fin": str(e)}, status=400)

        if fecha_fin and fecha_fin < fecha_inicio:
            return Response({"fecha_fin": "fecha_fin no puede ser menor que fecha_inicio."}, status=400)

        try:
            salario_base = parse_decimal_2(salario_raw, "salario_base")
        except ValueError as e:
            return Response({"salario_base": str(e)}, status=400)

        try:
            jornada = parse_int_non_negative(jornada_raw, "jornada_semanal_horas")
        except ValueError as e:
            return Response({"jornada_semanal_horas": str(e)}, status=400)

        empleado = validate_empleado_company(empresa_id, empleado_id)

        # Restricción clave: empleado NO debe tener contrato
        if Contrato.objects.filter(empresa_id=empresa_id, empleado_id=empleado_id).exists():
            return Response({"empleado_id": "Este empleado ya tiene un contrato asociado."}, status=400)

        try:
            turno_base = validate_turno_company(empresa_id, turno_base_id)
        except ValueError as e:
            return Response({"turno_base_id": str(e)}, status=400)

        with transaction.atomic():
            obj = Contrato.objects.create(
                empresa_id=empresa_id,
                empleado=empleado,
                turno_base=turno_base,      # puede ser None
                tipo=tipo,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                salario_base=salario_base,
                jornada_semanal_horas=jornada,
                estado=1,                   # activo por defecto (NO va en el formulario)
            )

        obj = Contrato.objects.select_related("empleado", "turno_base").get(id=obj.id)
        return Response(contrato_to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHContratosDetailAPIView(APIView):
    """
    HU03 - Actualizar contrato (PUT)
    HU04 - Cambiar estado (PATCH)
    + GET detalle
    GET   /api/rrhh/contratos/<id>/
    PUT   /api/rrhh/contratos/<id>/
    PATCH /api/rrhh/contratos/<id>/   { "estado": 1|2 }  (si no envías estado, se alterna)
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return (
            Contrato.objects
            .select_related("empleado", "turno_base")
            .filter(empresa_id=empresa_id, id=pk)
            .first()
        )

    def get(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(contrato_to_dict(obj), status=200)

    def put(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        empleado_id = request.data.get("empleado_id")
        turno_base_id = request.data.get("turno_base_id")
        tipo = request.data.get("tipo")
        fecha_inicio_raw = request.data.get("fecha_inicio")
        fecha_fin_raw = request.data.get("fecha_fin")
        salario_raw = request.data.get("salario_base")
        jornada_raw = request.data.get("jornada_semanal_horas")
        estado = request.data.get("estado")

        try:
            empleado_id = int(empleado_id)
        except Exception:
            return Response({"empleado_id": "empleado_id inválido."}, status=400)

        try:
            tipo = int(tipo)
        except Exception:
            return Response({"tipo": "Tipo inválido."}, status=400)
        if tipo not in (1, 2, 3, 4):
            return Response({"tipo": "Tipo inválido (1..4)."}, status=400)

        try:
            fecha_inicio = parse_date(fecha_inicio_raw, "fecha_inicio")
        except ValueError as e:
            return Response({"fecha_inicio": str(e)}, status=400)
        if not fecha_inicio:
            return Response({"fecha_inicio": "fecha_inicio es obligatoria."}, status=400)

        try:
            fecha_fin = parse_date(fecha_fin_raw, "fecha_fin")
        except ValueError as e:
            return Response({"fecha_fin": str(e)}, status=400)
        if fecha_fin and fecha_fin < fecha_inicio:
            return Response({"fecha_fin": "fecha_fin no puede ser menor que fecha_inicio."}, status=400)

        try:
            salario_base = parse_decimal_2(salario_raw, "salario_base")
        except ValueError as e:
            return Response({"salario_base": str(e)}, status=400)

        try:
            jornada = parse_int_non_negative(jornada_raw, "jornada_semanal_horas")
        except ValueError as e:
            return Response({"jornada_semanal_horas": str(e)}, status=400)

        try:
            estado = int(estado)
        except Exception:
            return Response({"estado": "Estado inválido."}, status=400)
        if estado not in (1, 2):
            return Response({"estado": "Estado inválido (1 activo, 2 inactivo)."}, status=400)

        # empleado debe ser de la empresa
        empleado = validate_empleado_company(empresa_id, empleado_id)

        # Restricción: el empleado seleccionado debe no tener contrato,
        # EXCEPTO si es el mismo empleado actual del contrato
        if empleado_id != obj.empleado_id:
            if Contrato.objects.filter(empresa_id=empresa_id, empleado_id=empleado_id).exists():
                return Response({"empleado_id": "Ese empleado ya tiene un contrato asociado."}, status=400)

        try:
            turno_base = validate_turno_company(empresa_id, turno_base_id)
        except ValueError as e:
            return Response({"turno_base_id": str(e)}, status=400)

        obj.empleado = empleado
        obj.turno_base = turno_base
        obj.tipo = tipo
        obj.fecha_inicio = fecha_inicio
        obj.fecha_fin = fecha_fin
        obj.salario_base = salario_base
        obj.jornada_semanal_horas = jornada
        obj.estado = estado
        obj.save()

        obj = self.get_obj(empresa_id, pk)
        return Response(contrato_to_dict(obj), status=200)

    def patch(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        # si viene estado -> se fija; si no -> toggle
        estado = request.data.get("estado", None)

        if estado is None:
            obj.estado = 2 if int(obj.estado) == 1 else 1
            obj.save()
            obj = self.get_obj(empresa_id, pk)
            return Response(contrato_to_dict(obj), status=200)

        try:
            estado = int(estado)
        except Exception:
            return Response({"estado": "Estado inválido."}, status=400)
        if estado not in (1, 2):
            return Response({"estado": "Estado inválido (1 activo, 2 inactivo)."}, status=400)

        obj.estado = estado
        obj.save()
        obj = self.get_obj(empresa_id, pk)
        return Response(contrato_to_dict(obj), status=200)
