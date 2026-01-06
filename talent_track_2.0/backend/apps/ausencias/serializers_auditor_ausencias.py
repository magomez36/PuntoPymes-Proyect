# apps/ausencias/serializers_auditor_ausencias.py
from rest_framework import serializers
from apps.ausencias.models import SolicitudAusencia, AprobacionAusencia, SaldoVacaciones

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


class AuditorSolicitudAusenciaSerializer(serializers.ModelSerializer):
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
            "motivo",
            "estado_label",
            "flujo_actual",
            "creada_el",
        ]

    def get_estado_label(self, obj):
        return ESTADO_SOLICITUD.get(obj.estado, f"desconocido({obj.estado})")


class AuditorAprobacionAusenciaSerializer(serializers.ModelSerializer):
    # datos solicitud + empleado
    nombres = serializers.CharField(source="solicitud.empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="solicitud.empleado.apellidos", read_only=True)
    email = serializers.CharField(source="solicitud.empleado.email", read_only=True)
    tipo_ausencia = serializers.CharField(source="solicitud.tipo_ausencia.nombre", read_only=True)
    fecha_inicio = serializers.DateField(source="solicitud.fecha_inicio", read_only=True)
    fecha_fin = serializers.DateField(source="solicitud.fecha_fin", read_only=True)
    dias_habiles = serializers.IntegerField(source="solicitud.dias_habiles", read_only=True)
    motivo = serializers.CharField(source="solicitud.motivo", read_only=True)

    aprobador_nombre = serializers.SerializerMethodField()
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
            "aprobador_nombre",
            "accion_label",
            "comentario",
            "fecha",
        ]

    def get_aprobador_nombre(self, obj):
        if not obj.aprobador_id:
            return "N/A"
        u = obj.aprobador
        # si el usuario tiene empleado asociado, usa nombres/apellidos
        if getattr(u, "empleado_id", None) and u.empleado:
            return f"{u.empleado.nombres} {u.empleado.apellidos}".strip()
        # fallback
        return getattr(u, "email", "N/A") or "N/A"

    def get_accion_label(self, obj):
        return ACCION_APROBACION.get(obj.accion, f"desconocido({obj.accion})")


class AuditorSaldoVacacionesSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    class Meta:
        model = SaldoVacaciones
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "periodo",
            "dias_asignados",
            "dias_tomados",
            "dias_disponibles",
        ]
