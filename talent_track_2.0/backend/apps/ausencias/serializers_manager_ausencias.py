# apps/ausencias/serializers_manager_ausencias.py
from rest_framework import serializers
from apps.ausencias.models import SolicitudAusencia, AprobacionAusencia

ESTADO_SOLICITUD = {
    1: "pendiente",
    2: "aprobado",
    3: "rechazado",
    4: "cancelado",
}

ACCION_APROBACION = {
    1: "aprobado",
    2: "rechazado",
}


class SolicitudPendienteManagerSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    tipo_ausencia = serializers.CharField(source="tipo_ausencia.nombre", read_only=True)
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudAusencia
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "tipo_ausencia",
            "fecha_inicio",
            "fecha_fin",
            "dias_habiles",
            "estado",
            "estado_label",
            "creada_el",
        ]

    def get_estado_label(self, obj):
        return ESTADO_SOLICITUD.get(obj.estado, f"desconocido({obj.estado})")


class SolicitudDetalleManagerSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    unidad_organizacional = serializers.CharField(source="empleado.unidad.nombre", read_only=True)
    puesto = serializers.CharField(source="empleado.puesto.nombre", read_only=True)

    tipo_ausencia = serializers.CharField(source="tipo_ausencia.nombre", read_only=True)
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudAusencia
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "unidad_organizacional",
            "puesto",
            "tipo_ausencia",
            "fecha_inicio",
            "fecha_fin",
            "dias_habiles",
            "motivo",
            "flujo_actual",
            "creada_el",
            "estado",
            "estado_label",
        ]

    def get_estado_label(self, obj):
        return ESTADO_SOLICITUD.get(obj.estado, f"desconocido({obj.estado})")


class AprobacionesHechasManagerSerializer(serializers.ModelSerializer):
    # de la solicitud
    nombres = serializers.CharField(source="solicitud.empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="solicitud.empleado.apellidos", read_only=True)
    email = serializers.CharField(source="solicitud.empleado.email", read_only=True)
    tipo_ausencia = serializers.CharField(source="solicitud.tipo_ausencia.nombre", read_only=True)

    fecha_inicio = serializers.DateField(source="solicitud.fecha_inicio", read_only=True)
    fecha_fin = serializers.DateField(source="solicitud.fecha_fin", read_only=True)
    dias_habiles = serializers.IntegerField(source="solicitud.dias_habiles", read_only=True)
    motivo = serializers.CharField(source="solicitud.motivo", read_only=True)

    # aprobador (usuario -> empleado)
    aprobador = serializers.SerializerMethodField()

    accion_label = serializers.SerializerMethodField()

    class Meta:
        model = AprobacionAusencia
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "tipo_ausencia",
            "fecha_inicio",
            "fecha_fin",
            "dias_habiles",
            "motivo",
            "aprobador",
            "accion",
            "accion_label",
            "comentario",
            "fecha",
        ]

    def get_aprobador(self, obj):
        if not obj.aprobador or not obj.aprobador.empleado:
            return "N/A"
        e = obj.aprobador.empleado
        return f"{e.nombres} {e.apellidos}".strip()

    def get_accion_label(self, obj):
        return ACCION_APROBACION.get(obj.accion, f"desconocido({obj.accion})")
