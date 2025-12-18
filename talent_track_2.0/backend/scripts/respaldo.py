import os
import sys
import json

# Configuración de Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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

# Diccionario para guardar todos los datos
data = {}

# Función auxiliar para serializar QuerySets
def serialize_queryset(qs):
    return [obj.__dict__ for obj in qs]

# Agregamos todas las tablas
data['empresa'] = serialize_queryset(Empresa.objects.all())
data['unidad_organizacional'] = serialize_queryset(UnidadOrganizacional.objects.all())
data['puesto'] = serialize_queryset(Puesto.objects.all())

data['empleado'] = serialize_queryset(Empleado.objects.all())
data['contrato'] = serialize_queryset(Contrato.objects.all())
data['documento_empleado'] = serialize_queryset(DocumentoEmpleado.objects.all())

data['turno'] = serialize_queryset(Turno.objects.all())
data['asignacion_turno'] = serialize_queryset(AsignacionTurno.objects.all())
data['regla_asistencia'] = serialize_queryset(ReglaAsistencia.objects.all())
data['geocerca'] = serialize_queryset(GeoCerca.objects.all())
data['dispositivo_empleado'] = serialize_queryset(DispositivoEmpleado.objects.all())
data['evento_asistencia'] = serialize_queryset(EventoAsistencia.objects.all())
data['jornada_calculada'] = serialize_queryset(JornadaCalculada.objects.all())

data['tipo_ausencia'] = serialize_queryset(TipoAusencia.objects.all())
data['solicitud_ausencia'] = serialize_queryset(SolicitudAusencia.objects.all())
data['aprobacion_ausencia'] = serialize_queryset(AprobacionAusencia.objects.all())
data['saldo_vacaciones'] = serialize_queryset(SaldoVacaciones.objects.all())

data['kpi'] = serialize_queryset(KPI.objects.all())
data['plantilla_kpi'] = serialize_queryset(PlantillaKPI.objects.all())
data['asignacion_kpi'] = serialize_queryset(AsignacionKPI.objects.all())
data['resultado_kpi'] = serialize_queryset(ResultadoKPI.objects.all())
data['evaluacion_desempeno'] = serialize_queryset(EvaluacionDesempeno.objects.all())

data['usuario'] = serialize_queryset(Usuario.objects.all())
data['rol'] = serialize_queryset(Rol.objects.all())
data['usuario_rol'] = serialize_queryset(UsuarioRol.objects.all())
data['permiso'] = serialize_queryset(Permiso.objects.all())

data['reporte_programado'] = serialize_queryset(ReporteProgramado.objects.all())
data['integracion_erp'] = serialize_queryset(IntegracionERP.objects.all())
data['webhook'] = serialize_queryset(Webhook.objects.all())
data['exportacion_nomina'] = serialize_queryset(ExportacionNomina.objects.all())

data['notificacion'] = serialize_queryset(Notificacion.objects.all())
data['log_auditoria'] = serialize_queryset(LogAuditoria.objects.all())

# Carpeta donde está el script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Guardamos en JSON dentro de la carpeta scripts
output_file = os.path.join(script_dir, 'respaldo_completo.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4, default=str)

print(f"Respaldo generado correctamente: {output_file}")

# python scripts\respaldo.py