# apps/kpi/serializers_manager_evaluaciones.py
from rest_framework import serializers
from apps.kpi.models import EvaluacionDesempeno
from apps.empleados.models import Empleado

TIPO_MAP = {
    1: "auto",
    2: "manager",
    3: "360",
}


class InstrumentoItemSerializer(serializers.Serializer):
    peso = serializers.FloatField()
    competencia = serializers.CharField()

    def validate(self, attrs):
        peso = attrs.get("peso")
        comp = (attrs.get("competencia") or "").strip()

        if peso is None or peso < 0:
            raise serializers.ValidationError("peso no puede ser negativo.")
        if not comp:
            raise serializers.ValidationError("competencia es obligatoria.")

        attrs["competencia"] = comp
        return attrs


class EvaluacionListSerializer(serializers.ModelSerializer):
    empleado_id = serializers.IntegerField(source="empleado.id", read_only=True)
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    evaluador_nombre = serializers.SerializerMethodField()
    tipo_label = serializers.SerializerMethodField()
    instrumento_resumen = serializers.SerializerMethodField()

    class Meta:
        model = EvaluacionDesempeno
        fields = [
            "id",
            "empleado_id",
            "nombres",
            "apellidos",
            "email",
            "evaluador_id",
            "evaluador_nombre",
            "periodo",
            "tipo",
            "tipo_label",
            "instrumento",
            "instrumento_resumen",
            "puntaje_total",
            "comentarios",
            "fecha",
        ]

    def get_evaluador_nombre(self, obj):
        if not obj.evaluador_id:
            return "N/A"
        e = obj.evaluador
        return f"{e.nombres} {e.apellidos}".strip()

    def get_tipo_label(self, obj):
        return TIPO_MAP.get(obj.tipo, f"desconocido({obj.tipo})")

    def get_instrumento_resumen(self, obj):
        inst = obj.instrumento or []
        if not isinstance(inst, list) or not inst:
            return []
        out = []
        for it in inst:
            if not isinstance(it, dict):
                continue
            comp = it.get("competencia")
            peso = it.get("peso")
            if comp is None:
                continue
            try:
                p = float(peso) if peso is not None else 0.0
            except Exception:
                p = 0.0
            out.append(
                {
                    "competencia": str(comp),
                    "peso": p,
                    "peso_pct": round(p * 100, 2),
                }
            )
        return out


class EvaluacionCreateSerializer(serializers.Serializer):
    empleado_id = serializers.IntegerField()
    periodo = serializers.CharField()
    tipo = serializers.IntegerField()
    instrumento = InstrumentoItemSerializer(many=True)
    puntaje_total = serializers.DecimalField(max_digits=5, decimal_places=2)
    comentarios = serializers.CharField(allow_blank=True, required=False)

    def validate(self, attrs):
        periodo = (attrs.get("periodo") or "").strip()
        tipo = attrs.get("tipo")
        instrumento = attrs.get("instrumento") or []

        if not periodo:
            raise serializers.ValidationError({"periodo": "periodo es obligatorio."})
        if tipo not in (1, 2, 3):
            raise serializers.ValidationError({"tipo": "tipo inválido (1 auto, 2 manager, 3 360)."})
        if not isinstance(instrumento, list) or len(instrumento) == 0:
            raise serializers.ValidationError({"instrumento": "instrumento debe tener al menos 1 ítem."})

        attrs["periodo"] = periodo
        attrs["comentarios"] = (attrs.get("comentarios") or "").strip()
        return attrs


class EvaluacionUpdateSerializer(serializers.Serializer):
    periodo = serializers.CharField()
    tipo = serializers.IntegerField()
    instrumento = InstrumentoItemSerializer(many=True)
    puntaje_total = serializers.DecimalField(max_digits=5, decimal_places=2)
    comentarios = serializers.CharField(allow_blank=True, required=False)

    def validate(self, attrs):
        periodo = (attrs.get("periodo") or "").strip()
        tipo = attrs.get("tipo")
        instrumento = attrs.get("instrumento") or []

        if not periodo:
            raise serializers.ValidationError({"periodo": "periodo es obligatorio."})
        if tipo not in (1, 2, 3):
            raise serializers.ValidationError({"tipo": "tipo inválido (1 auto, 2 manager, 3 360)."})
        if not isinstance(instrumento, list) or len(instrumento) == 0:
            raise serializers.ValidationError({"instrumento": "instrumento debe tener al menos 1 ítem."})

        attrs["periodo"] = periodo
        attrs["comentarios"] = (attrs.get("comentarios") or "").strip()
        return attrs
