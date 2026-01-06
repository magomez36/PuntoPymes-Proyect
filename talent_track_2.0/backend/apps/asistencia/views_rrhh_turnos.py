# apps/asistencia/views_rrhh_turnos.py
from datetime import datetime

from django.db import IntegrityError, transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from apps.asistencia.models import Turno
from apps.empleados.models import Contrato  # para eliminar contratos relacionados (si aplica)


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


DAYS = {
    1: "lunes",
    2: "martes",
    3: "miércoles",
    4: "jueves",
    5: "viernes",
    6: "sábado",
    7: "domingo",
}


def parse_time_str(value, field_name):
    """
    Espera "HH:MM" o "HH:MM:SS" (input type=time suele mandar HH:MM).
    Devuelve un objeto time.
    """
    if not value:
        raise ValueError(f"{field_name} es obligatorio.")
    s = str(value).strip()
    for fmt in ("%H:%M", "%H:%M:%S"):
        try:
            return datetime.strptime(s, fmt).time()
        except ValueError:
            continue
    raise ValueError(f"{field_name} inválido. Usa formato HH:MM.")


def parse_int_non_negative(value, field_name):
    if value is None or value == "":
        raise ValueError(f"{field_name} es obligatorio.")
    try:
        n = int(value)
    except Exception:
        raise ValueError(f"{field_name} inválido.")
    if n < 0:
        raise ValueError(f"{field_name} no puede ser negativo.")
    return n


def parse_bool(value):
    # soporta true/false boolean o strings "true"/"false" o 1/0
    if isinstance(value, bool):
        return value
    if value in (1, "1", "true", "True", "TRUE"):
        return True
    if value in (0, "0", "false", "False", "FALSE", None, ""):
        return False
    return bool(value)


def normalize_dias_semana(raw):
    """
    Espera lista de dicts con formato:
      [{"num":1,"nombre":"lunes"}, ...]
    Normaliza:
    - valida num 1..7
    - nombre correcto según DAYS
    - sin repetidos
    - ordenado por num
    """
    if not isinstance(raw, list) or len(raw) == 0:
        raise ValueError("dias_semana debe tener al menos 1 día.")

    seen = set()
    out = []
    for item in raw:
        if not isinstance(item, dict):
            raise ValueError("dias_semana inválido (debe ser lista de objetos).")

        num = item.get("num")
        if num is None:
            raise ValueError("dias_semana inválido: falta num.")
        try:
            num = int(num)
        except Exception:
            raise ValueError("dias_semana inválido: num debe ser entero.")

        if num not in DAYS:
            raise ValueError("dias_semana inválido: num debe ser 1..7.")

        if num in seen:
            continue
        seen.add(num)

        # nombre se fuerza según map (no confiamos en el cliente)
        out.append({"num": num, "nombre": DAYS[num]})

    out.sort(key=lambda x: x["num"])
    if len(out) == 0:
        raise ValueError("dias_semana debe tener al menos 1 día.")
    return out


def dias_label(dias_list):
    if not isinstance(dias_list, list) or len(dias_list) == 0:
        return "N/A"
    # ordenar por num y mapear a nombres
    try:
        nums = sorted({int(d.get("num")) for d in dias_list if isinstance(d, dict) and d.get("num")})
    except Exception:
        nums = []
    names = [DAYS.get(n, f"dia({n})") for n in nums]
    return ", ".join(names) if names else "N/A"


def turno_to_dict(t: Turno):
    return {
        "id": t.id,
        "nombre": t.nombre,
        "hora_inicio": t.hora_inicio.strftime("%H:%M") if t.hora_inicio else None,
        "hora_fin": t.hora_fin.strftime("%H:%M") if t.hora_fin else None,
        "dias_semana": t.dias_semana or [],           # para edición
        "dias_semana_label": dias_label(t.dias_semana or []),  # para tabla (SIN JSON)
        "tolerancia_minutos": t.tolerancia_minutos,
        "requiere_gps": bool(t.requiere_gps),
        "requiere_foto": bool(t.requiere_foto),
    }


class RRHHTurnosListCreateAPIView(APIView):
    """
    HU01 - Ver Turnos (GET)
    HU02 - Crear Turno (POST)
    Endpoints:
      GET  /api/rrhh/turnos/
      POST /api/rrhh/turnos/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            Turno.objects
            .filter(empresa_id=empresa_id)
            .order_by("id")
        )
        return Response([turno_to_dict(t) for t in qs], status=200)

    def post(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        nombre = (request.data.get("nombre") or "").strip()
        hora_inicio_raw = request.data.get("hora_inicio")
        hora_fin_raw = request.data.get("hora_fin")
        dias_raw = request.data.get("dias_semana")
        tolerancia_raw = request.data.get("tolerancia_minutos")
        requiere_gps_raw = request.data.get("requiere_gps")
        requiere_foto_raw = request.data.get("requiere_foto")

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)

        try:
            hora_inicio = parse_time_str(hora_inicio_raw, "hora_inicio")
            hora_fin = parse_time_str(hora_fin_raw, "hora_fin")
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        # regla simple (si quieres permitir turnos nocturnos, quita esta validación)
        if hora_fin <= hora_inicio:
            return Response(
                {"detail": "hora_fin debe ser mayor que hora_inicio (turno en el mismo día)."},
                status=400
            )

        try:
            dias_semana = normalize_dias_semana(dias_raw)
        except ValueError as e:
            return Response({"dias_semana": str(e)}, status=400)

        try:
            tolerancia_minutos = parse_int_non_negative(tolerancia_raw, "tolerancia_minutos")
        except ValueError as e:
            return Response({"tolerancia_minutos": str(e)}, status=400)

        requiere_gps = parse_bool(requiere_gps_raw)
        requiere_foto = parse_bool(requiere_foto_raw)

        with transaction.atomic():
            obj = Turno.objects.create(
                empresa_id=empresa_id,          # SIEMPRE desde token
                nombre=nombre,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                dias_semana=dias_semana,
                tolerancia_minutos=tolerancia_minutos,
                requiere_gps=requiere_gps,
                requiere_foto=requiere_foto,
            )

        obj = Turno.objects.get(id=obj.id)
        return Response(turno_to_dict(obj), status=status.HTTP_201_CREATED)


class RRHHTurnosDetailAPIView(APIView):
    """
    HU03 - Actualizar Turno (PUT)
    HU04 - Eliminar Turno (DELETE) (también elimina contrato si aplica)
    + GET detalle para cargar form
    Endpoints:
      GET    /api/rrhh/turnos/<id>/
      PUT    /api/rrhh/turnos/<id>/
      DELETE /api/rrhh/turnos/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get_obj(self, empresa_id, pk):
        return Turno.objects.filter(empresa_id=empresa_id, id=pk).first()

    def get(self, request, pk):
        scope = require_rrhh(request)
        obj = self.get_obj(scope["empresa_id"], pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(turno_to_dict(obj), status=200)

    def put(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        nombre = (request.data.get("nombre") or "").strip()
        hora_inicio_raw = request.data.get("hora_inicio")
        hora_fin_raw = request.data.get("hora_fin")
        dias_raw = request.data.get("dias_semana")
        tolerancia_raw = request.data.get("tolerancia_minutos")
        requiere_gps_raw = request.data.get("requiere_gps")
        requiere_foto_raw = request.data.get("requiere_foto")

        if not nombre:
            return Response({"nombre": "Nombre es obligatorio."}, status=400)

        try:
            hora_inicio = parse_time_str(hora_inicio_raw, "hora_inicio")
            hora_fin = parse_time_str(hora_fin_raw, "hora_fin")
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        if hora_fin <= hora_inicio:
            return Response(
                {"detail": "hora_fin debe ser mayor que hora_inicio (turno en el mismo día)."},
                status=400
            )

        try:
            dias_semana = normalize_dias_semana(dias_raw)
        except ValueError as e:
            return Response({"dias_semana": str(e)}, status=400)

        try:
            tolerancia_minutos = parse_int_non_negative(tolerancia_raw, "tolerancia_minutos")
        except ValueError as e:
            return Response({"tolerancia_minutos": str(e)}, status=400)

        obj.nombre = nombre
        obj.hora_inicio = hora_inicio
        obj.hora_fin = hora_fin
        obj.dias_semana = dias_semana
        obj.tolerancia_minutos = tolerancia_minutos
        obj.requiere_gps = parse_bool(requiere_gps_raw)
        obj.requiere_foto = parse_bool(requiere_foto_raw)
        obj.save()

        obj = self.get_obj(empresa_id, pk)
        return Response(turno_to_dict(obj), status=200)

    def delete(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        obj = self.get_obj(empresa_id, pk)
        if not obj:
            return Response({"detail": "No encontrado."}, status=404)

        # Requisito: "también se elimina el contrato"
        # Si tu FK ya es CASCADE, esto no hace daño.
        # Si tu FK es PROTECT, esto lo soluciona (borramos contratos primero).
        try:
            Contrato.objects.filter(turno_base_id=obj.id).delete()
        except Exception:
            # Si tu proyecto no usa turno_base en Contrato, ajustamos (ver nota abajo)
            pass

        try:
            obj.delete()
        except IntegrityError:
            return Response(
                {"detail": "No se puede eliminar: está siendo usado en otros registros."},
                status=409
            )

        return Response(status=204)
