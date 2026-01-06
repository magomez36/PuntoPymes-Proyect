# apps/empleados/serializers_auditor_expedientes.py
from rest_framework import serializers
from apps.empleados.models import Empleado, Contrato
from apps.asistencia.models import JornadaCalculada


ESTADO_EMPLEADO = {
    1: "activo",
    2: "suspendido",
    3: "baja",
}

TIPO_CONTRATO = {
    1: "indefinido",
    2: "plazo",
    3: "temporal",
    4: "practicante",
}

ESTADO_CONTRATO = {
    1: "activo",
    2: "inactivo",
}

ESTADO_JORNADA = {
    1: "completo",
    2: "incompleto",
    3: "sin_registros",
}


class AuditorEmpleadoListSerializer(serializers.ModelSerializer):
    unidad_nombre = serializers.CharField(source="unidad.nombre", read_only=True)
    puesto_nombre = serializers.CharField(source="puesto.nombre", read_only=True)
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = [
            "id",
            "nombres",
            "apellidos",
            "unidad_nombre",
            "puesto_nombre",
            "email",
            "direccion",
            "estado_label",
        ]

    def get_estado_label(self, obj):
        return ESTADO_EMPLEADO.get(obj.estado, f"desconocido({obj.estado})")


class AuditorEmpleadoDetalleSerializer(serializers.ModelSerializer):
    unidad_nombre = serializers.CharField(source="unidad.nombre", read_only=True)
    puesto_nombre = serializers.CharField(source="puesto.nombre", read_only=True)
    manager_nombre = serializers.SerializerMethodField()
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = [
            "id",
            "nombres",
            "apellidos",
            "unidad_nombre",
            "manager_nombre",
            "puesto_nombre",
            "email",
            "telefono",
            "direccion",
            "fecha_nacimiento",
            "fecha_ingreso",
            "estado_label",
        ]

    def get_manager_nombre(self, obj):
        if not obj.manager_id:
            return "N/A"
        m = obj.manager
        return f"{m.nombres} {m.apellidos}".strip()

    def get_estado_label(self, obj):
        return ESTADO_EMPLEADO.get(obj.estado, f"desconocido({obj.estado})")


class AuditorContratoEmpleadoSerializer(serializers.ModelSerializer):
    tipo_label = serializers.SerializerMethodField()
    estado_label = serializers.SerializerMethodField()
    fecha_fin_label = serializers.SerializerMethodField()

    class Meta:
        model = Contrato
        fields = [
            "id",
            "tipo",
            "tipo_label",
            "fecha_inicio",
            "fecha_fin",
            "fecha_fin_label",
            "salario_base",
            "jornada_semanal_horas",
            "estado",
            "estado_label",
        ]

    def get_tipo_label(self, obj):
        return TIPO_CONTRATO.get(obj.tipo, f"desconocido({obj.tipo})")

    def get_estado_label(self, obj):
        return ESTADO_CONTRATO.get(obj.estado, f"desconocido({obj.estado})")

    def get_fecha_fin_label(self, obj):
        return obj.fecha_fin.isoformat() if obj.fecha_fin else "Sin fecha fin"


class AuditorJornadaEmpleadoSerializer(serializers.ModelSerializer):
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = JornadaCalculada
        fields = [
            "id",
            "fecha",
            "hora_primera_entrada",
            "hora_ultimo_salida",
            "minutos_trabajados",
            "minutos_tardanza",
            "minutos_extra",
            "estado_label",
        ]

    def get_estado_label(self, obj):
        return ESTADO_JORNADA.get(obj.estado, f"desconocido({obj.estado})")
