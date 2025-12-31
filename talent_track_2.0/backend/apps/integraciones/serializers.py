from rest_framework import serializers
from apps.integraciones.models import ReporteProgramado
from apps.core.models import Empresa

TIPOS = {
    1: "asistencia",
    2: "kpi",
    3: "ausencias",
}

FORMATOS = {
    1: "CSV",
    2: "XLS",
    3: "PDF",
}


class ReporteProgramadoListSerializer(serializers.ModelSerializer):
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)
    tipo_nombre = serializers.SerializerMethodField()
    formato_nombre = serializers.SerializerMethodField()
    destinatarios_texto = serializers.SerializerMethodField()
    parametros_texto = serializers.SerializerMethodField()

    class Meta:
        model = ReporteProgramado
        fields = [
            "id",
            "nombre",
            "empresa",
            "empresa_razon_social",
            "tipo",
            "tipo_nombre",
            "parametros",
            "parametros_texto",
            "frecuencia_cron",
            "formato",
            "formato_nombre",
            "destinatarios",
            "destinatarios_texto",
            "activo",
        ]

    def get_tipo_nombre(self, obj):
        return TIPOS.get(obj.tipo, str(obj.tipo))

    def get_formato_nombre(self, obj):
        return FORMATOS.get(obj.formato, str(obj.formato))

    def get_destinatarios_texto(self, obj):
        # Para tabla: "a@a.com, b@b.com"
        if isinstance(obj.destinatarios, list):
            return ", ".join(obj.destinatarios)
        return ""

    def get_parametros_texto(self, obj):
        # Para tabla: JSON en una línea bonita
        try:
            import json
            if obj.parametros is None:
                return ""
            return json.dumps(obj.parametros, ensure_ascii=False)
        except Exception:
            return ""


class ReporteProgramadoCreateSerializer(serializers.ModelSerializer):
    empresa = serializers.PrimaryKeyRelatedField(queryset=Empresa.objects.all())

    class Meta:
        model = ReporteProgramado
        # OJO: no incluimos "parametros" en el form (la épica dice NO)
        fields = [
            "empresa",
            "nombre",
            "tipo",
            "frecuencia_cron",
            "formato",
            "destinatarios",
            "activo",
        ]

    def validate_destinatarios(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("destinatarios debe ser una lista de correos.")
        # opcional: validar formato básico
        for email in value:
            if not isinstance(email, str) or "@" not in email:
                raise serializers.ValidationError("Hay correos inválidos en destinatarios.")
        if len(value) == 0:
            raise serializers.ValidationError("Debe existir al menos 1 destinatario.")
        return value

    def create(self, validated_data):
        # parametros NO viene del front -> lo seteamos vacío
        validated_data["parametros"] = {}
        return super().create(validated_data)


class ReporteProgramadoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteProgramado
        # épica: NO se edita empresa ni parametros
        fields = [
            "nombre",
            "tipo",
            "frecuencia_cron",
            "formato",
            "destinatarios",
            "activo",
        ]

    def validate_destinatarios(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("destinatarios debe ser una lista de correos.")
        for email in value:
            if not isinstance(email, str) or "@" not in email:
                raise serializers.ValidationError("Hay correos inválidos en destinatarios.")
        if len(value) == 0:
            raise serializers.ValidationError("Debe existir al menos 1 destinatario.")
        return value
