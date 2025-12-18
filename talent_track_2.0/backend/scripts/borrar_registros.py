import os
import sys

# Agrega la carpeta backend al path para que Python encuentre talent_track
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configura el settings correcto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talent_track.settings')

import django
django.setup()

from apps.core.models import Empresa, UnidadOrganizacional, Puesto
from apps.empleados.models import Empleado, Contrato, DocumentoEmpleado
from apps.asistencia.models import Turno, AsignacionTurno, ReglaAsistencia, GeoCerca, DispositivoEmpleado, EventoAsistencia, JornadaCalculada
from apps.ausencias.models import TipoAusencia, SolicitudAusencia, AprobacionAusencia, SaldoVacaciones
from apps.kpi.models import KPI, PlantillaKPI, AsignacionKPI, ResultadoKPI, EvaluacionDesempeno
from apps.usuarios.models import Usuario, Rol, UsuarioRol, Permiso
from apps.integraciones.models import ReporteProgramado, IntegracionERP, Webhook, ExportacionNomina
from apps.notificaciones.models import Notificacion
from apps.auditoria.models import LogAuditoria

# Lista de todos los modelos en orden correcto para evitar problemas de FK
tablas = [
    LogAuditoria,
    Notificacion,
    ReporteProgramado, IntegracionERP, Webhook, ExportacionNomina,
    Permiso, UsuarioRol, Rol, Usuario,
    EvaluacionDesempeno, ResultadoKPI, AsignacionKPI, PlantillaKPI, KPI,
    SaldoVacaciones, AprobacionAusencia, SolicitudAusencia, TipoAusencia,
    JornadaCalculada, EventoAsistencia, DispositivoEmpleado, GeoCerca, ReglaAsistencia, AsignacionTurno, Turno,
    DocumentoEmpleado, Contrato, Empleado,
    Puesto, UnidadOrganizacional, Empresa
]

for modelo in tablas:
    modelo.objects.all().delete()
    print(f"Registros de {modelo.__name__} eliminados.")

print("Todos los registros eliminados correctamente.")

# python scripts\borrar_registros.py