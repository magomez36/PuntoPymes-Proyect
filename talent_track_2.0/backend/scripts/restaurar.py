import os
import sys
import json
from datetime import datetime

# Agrega la carpeta backend al path para que Python encuentre talent_track
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configura el settings correcto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')

import django
django.setup()

from django.contrib.auth.hashers import make_password

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

# 🔐 Password común SOLO para restauración (DEV)
PASSWORD_DEV = "12345talent"

# Orden correcto para respetar FK
tablas = [
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

respaldo_json = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "respaldo_completo.json"
)

if not os.path.exists(respaldo_json):
    print(f"No se encontró el archivo de respaldo en {respaldo_json}")
    sys.exit(1)

with open(respaldo_json, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"JSON cargado correctamente: {len(data.keys())} tablas encontradas")

for modelo, nombre_tabla in tablas:
    registros = data.get(nombre_tabla, [])
    insertados = 0

    for registro in registros:
        # Eliminar _state (Django interno)
        registro.pop("_state", None)

        # Convertir fechas ISO a datetime
        for campo in ["creada_el", "ultimo_acceso"]:
            if campo in registro and registro[campo]:
                registro[campo] = datetime.fromisoformat(
                    registro[campo].replace("Z", "+00:00")
                )

        try:
            # 🔐 Forzar password común SOLO en usuarios
            if nombre_tabla == "usuario":
                registro["hash_password"] = make_password(PASSWORD_DEV)

            modelo.objects.create(**registro)
            insertados += 1

        except Exception as e:
            print(f"Error insertando en {nombre_tabla}: {e}")

    print(f"{insertados} registros insertados en {nombre_tabla}")

print("Restauración completada correctamente.")

# python scripts\restaurar.py