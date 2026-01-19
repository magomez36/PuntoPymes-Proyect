import os
import sys
import json
from datetime import datetime, date

# Agrega la carpeta backend al path para que Python encuentre talent_track
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configura el settings correcto
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talent_track.settings")

import django
django.setup()

from django.db import connection, transaction
from django.contrib.auth.hashers import make_password
from django.db.models.fields import DateField, DateTimeField, AutoField, BigAutoField

from apps.core.models import Empresa, UnidadOrganizacional, Puesto
from apps.empleados.models import Empleado, Contrato, DocumentoEmpleado
from apps.asistencia.models import (
    Turno, AsignacionTurno, ReglaAsistencia, GeoCerca,
    DispositivoEmpleado, EventoAsistencia, JornadaCalculada
)
from apps.ausencias.models import (
    TipoAusencia, SolicitudAusencia, AprobacionAusencia, SaldoVacaciones
)
from apps.kpi.models import (
    KPI, PlantillaKPI, AsignacionKPI, ResultadoKPI, EvaluacionDesempeno
)
from apps.usuarios.models import Usuario, Rol, UsuarioRol, Permiso
from apps.integraciones.models import (
    ReporteProgramado, IntegracionERP, Webhook, ExportacionNomina
)
from apps.notificaciones.models import Notificacion
from apps.auditoria.models import LogAuditoria

# 👇 IMPORTANTE: tu user de login real (db_table="auth_user_tt")
from apps.accounts.models import AuthUser


# ==========================
# CONFIG
# ==========================
PASSWORD_DEV = "12345talent"      # Password común SOLO para restauración (DEV)
PURGE_BEFORE_RESTORE = True       # Borra datos antes de insertar (recomendado)


# Orden correcto para respetar FK (padres -> hijos)
TABLAS = [
    (Empresa, "empresa"),
    (UnidadOrganizacional, "unidad_organizacional"),
    (Puesto, "puesto"),
    (Empleado, "empleado"),
    (Contrato, "contrato"),
    (DocumentoEmpleado, "documento_empleado"),
    (Turno, "turno"),
    (AsignacionTurno, "asignacion_turno"),
    (ReglaAsistencia, "regla_asistencia"),
    (GeoCerca, "geocerca"),
    (DispositivoEmpleado, "dispositivo_empleado"),
    (EventoAsistencia, "evento_asistencia"),
    (JornadaCalculada, "jornada_calculada"),
    (TipoAusencia, "tipo_ausencia"),
    (SolicitudAusencia, "solicitud_ausencia"),
    (AprobacionAusencia, "aprobacion_ausencia"),
    (SaldoVacaciones, "saldo_vacaciones"),
    (KPI, "kpi"),
    (PlantillaKPI, "plantilla_kpi"),
    (AsignacionKPI, "asignacion_kpi"),
    (ResultadoKPI, "resultado_kpi"),
    (EvaluacionDesempeno, "evaluacion_desempeno"),
    (Usuario, "usuario"),
    (Rol, "rol"),
    (UsuarioRol, "usuario_rol"),  
    (Permiso, "permiso"),
    (ReporteProgramado, "reporte_programado"),
    (IntegracionERP, "integracion_erp"),
    (Webhook, "webhook"),
    (ExportacionNomina, "exportacion_nomina"),
    (Notificacion, "notificacion"),
    (LogAuditoria, "log_auditoria"),
]

RESPALDO_JSON = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "respaldo_completo.json"
)


# ==========================
# UTILS
# ==========================
def parse_value_for_field(field, value):
    """
    Convierte strings ISO a date/datetime según el tipo de campo del modelo.
    """
    if value is None or value == "":
        return value

    try:
        if isinstance(field, DateTimeField):
            if isinstance(value, str):
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
        if isinstance(field, DateField):
            if isinstance(value, str):
                return date.fromisoformat(value[:10])
    except Exception:
        return value

    return value


def normalize_record_for_model(model, record: dict) -> dict:
    """
    - Quita _state
    - Convierte fechas automáticamente según fields
    """
    record.pop("_state", None)

    field_map = {f.name: f for f in model._meta.fields}
    for k, v in list(record.items()):
        f = field_map.get(k)
        if f is not None:
            record[k] = parse_value_for_field(f, v)

    return record


def purge_all():
    """
    Borra todo en orden inverso (hijos -> padres) para no romper FKs.
    Incluye auth_user_tt (AuthUser) para que no queden credenciales viejas.
    """
    print("\n🧹 PURGE: eliminando datos existentes...")

    # 1) Primero borrar auth_user_tt para evitar conflictos de unique email
    try:
        deleted = AuthUser.objects.all().delete()
        print(f"  - {AuthUser._meta.db_table}: deleted_count={deleted[0]}")
    except Exception as e:
        print(f"  - {AuthUser._meta.db_table}: ERROR al borrar -> {e}")

    # 2) Luego tus tablas del sistema
    for model, _json_key in reversed(TABLAS):
        try:
            deleted = model.objects.all().delete()
            print(f"  - {model._meta.db_table}: deleted_count={deleted[0]}")
        except Exception as e:
            print(f"  - {model._meta.db_table}: ERROR al borrar -> {e}")


def reset_sequences_postgres():
    """
    Re-sincroniza las secuencias de todas las tablas con PK autoincrement.
    Incluye también auth_user_tt.
    """
    print("\n🔁 Reseteando secuencias (PostgreSQL)...")

    models_to_reset = [m for (m, _k) in TABLAS] + [AuthUser]

    with connection.cursor() as cursor:
        for model in models_to_reset:
            table = model._meta.db_table
            pk_field = model._meta.pk

            if not isinstance(pk_field, (AutoField, BigAutoField)):
                continue

            pk_name = pk_field.column  # normalmente "id"

            try:
                cursor.execute(
                    f"""
                    SELECT setval(
                        pg_get_serial_sequence(%s, %s),
                        COALESCE((SELECT MAX({pk_name}) FROM {table}), 1),
                        true
                    );
                    """,
                    [table, pk_name],
                )
                print(f"  ✅ {table}.{pk_name} OK")
            except Exception as e:
                print(f"  ⚠️ {table}.{pk_name} NO se pudo resetear -> {e}")

    print("✅ Secuencias sincronizadas.\n")


def sync_auth_users_from_usuarios():
    """
    Crea/actualiza auth_user_tt (AuthUser) usando usuarios.Usuario.
    - Password DEV usando set_password (necesario para login)
    - is_active = True si usuario.estado == 1
    - link OneToOne AuthUser.usuario
    """
    print("👤 Sincronizando auth_user_tt desde usuario...")

    creados = 0
    actualizados = 0
    saltados = 0

    for u in Usuario.objects.all():
        email = (u.email or "").strip().lower()
        if not email:
            saltados += 1
            continue

        auth, created = AuthUser.objects.get_or_create(
            email=email,
            defaults={
                "usuario": u,
                "is_active": (u.estado == 1),
                "is_staff": False,  # ajústalo si quieres
            },
        )

        # Link correcto a tabla negocio
        if auth.usuario_id != u.id:
            auth.usuario = u

        # Estado activo según negocio
        auth.is_active = (u.estado == 1)

        # IMPORTANTÍSIMO: password real para authenticate()
        auth.set_password(PASSWORD_DEV)

        auth.save()

        if created:
            creados += 1
        else:
            actualizados += 1

    print(f"✅ auth_user_tt: creados={creados}, actualizados={actualizados}, saltados={saltados}\n")


# ==========================
# MAIN
# ==========================
def main():
    if not os.path.exists(RESPALDO_JSON):
        print(f"❌ No se encontró el archivo de respaldo en: {RESPALDO_JSON}")
        sys.exit(1)

    with open(RESPALDO_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"✅ JSON cargado correctamente: {len(data.keys())} tablas encontradas")

    if PURGE_BEFORE_RESTORE:
        purge_all()

    # Restauración en transacción para consistencia
    with transaction.atomic():
        for model, json_key in TABLAS:
            records = data.get(json_key, [])
            inserted = 0
            errors = 0

            for record in records:
                try:
                    record = normalize_record_for_model(model, dict(record))

                    # 🔐 Forzar password común SOLO en usuarios.Usuario (tabla negocio)
                    if json_key == "usuario":
                        record["hash_password"] = make_password(PASSWORD_DEV)

                    model.objects.create(**record)
                    inserted += 1
                except Exception as e:
                    errors += 1
                    print(f"❌ Error insertando en {json_key}: {e}")

            print(f"📌 {json_key}: insertados={inserted} errores={errors}")

    # 1) Resetea secuencias para que los próximos INSERTS no rompan PK
    reset_sequences_postgres()

    # 2) Genera/actualiza auth_user_tt (lo que usa el login)
    sync_auth_users_from_usuarios()

    # 3) Resetea secuencia de auth_user_tt por si quedó movida por los creates
    reset_sequences_postgres()

    print("🎉 Restauración completada correctamente.")


if __name__ == "__main__":
    main()

# Ejecutar:
# python scripts\restaurar.py