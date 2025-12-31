# apps/empleados/serializers.py
from django.utils import timezone
from rest_framework import serializers

from apps.empleados.models import Empleado
from apps.core.models import Empresa, UnidadOrganizacional, Puesto


class EmpleadoListSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(source="empresa.id", read_only=True)
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)

    unidad_id = serializers.IntegerField(source="unidad.id", read_only=True)
    unidad_nombre = serializers.CharField(source="unidad.nombre", read_only=True)

    puesto_id = serializers.IntegerField(source="puesto.id", read_only=True)
    puesto_nombre = serializers.CharField(source="puesto.nombre", read_only=True)

    manager_id = serializers.IntegerField(source="manager.id", read_only=True, allow_null=True)
    manager_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = [
            "id",
            "nombres",
            "apellidos",
            "empresa_razon_social",
            "unidad_nombre",
            "manager_nombre",
            "puesto_nombre",
            "email",
            "telefono",
            "direccion",
            "fecha_nacimiento",
            "fecha_ingreso",
            "estado",
            # extras útiles para editar:
            "empresa_id",
            "unidad_id",
            "puesto_id",
            "manager_id",
        ]

    def get_manager_nombre(self, obj):
        if not obj.manager:
            return "N/A"
        n = (obj.manager.nombres or "").strip()
        a = (obj.manager.apellidos or "").strip()
        full = f"{n} {a}".strip()
        return full or "N/A"


class EmpleadoCreateSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    unidad_id = serializers.IntegerField()
    puesto_id = serializers.IntegerField()
    manager_id = serializers.IntegerField(required=False, allow_null=True)

    nombres = serializers.CharField()
    apellidos = serializers.CharField()
    email = serializers.EmailField()
    telefono = serializers.CharField()
    direccion = serializers.CharField()
    fecha_nacimiento = serializers.DateField()
    estado = serializers.IntegerField()

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        attrs["email"] = email

        if attrs["estado"] not in (1, 2, 3):
            raise serializers.ValidationError({"estado": "Estado inválido. Use 1=activo, 2=suspendido, 3=baja."})

        # email unique lógico (aunque DB no tenga unique)
        if Empleado.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Ya existe un empleado con ese email."})

        # empresa existe
        try:
            empresa = Empresa.objects.get(id=attrs["empresa_id"])
        except Empresa.DoesNotExist:
            raise serializers.ValidationError({"empresa_id": "Empresa no existe."})

        # unidad pertenece a empresa
        try:
            unidad = UnidadOrganizacional.objects.get(id=attrs["unidad_id"], empresa_id=empresa.id)
        except UnidadOrganizacional.DoesNotExist:
            raise serializers.ValidationError({"unidad_id": "Unidad no existe o no pertenece a la empresa."})

        # puesto pertenece a empresa (y típicamente a una unidad; tu modelo tiene unidad FK)
        try:
            puesto = Puesto.objects.get(id=attrs["puesto_id"], empresa_id=empresa.id)
        except Puesto.DoesNotExist:
            raise serializers.ValidationError({"puesto_id": "Puesto no existe o no pertenece a la empresa."})

        # manager opcional, pero si viene debe pertenecer a la misma empresa
        manager_id = attrs.get("manager_id", None)
        manager_obj = None
        if manager_id:
            try:
                manager_obj = Empleado.objects.get(id=manager_id, empresa_id=empresa.id)
            except Empleado.DoesNotExist:
                raise serializers.ValidationError({"manager_id": "Manager no existe o no pertenece a la empresa."})

        attrs["empresa_obj"] = empresa
        attrs["unidad_obj"] = unidad
        attrs["puesto_obj"] = puesto
        attrs["manager_obj"] = manager_obj
        return attrs

    def create(self, validated_data):
        hoy = timezone.localdate()

        e = Empleado.objects.create(
            empresa=validated_data["empresa_obj"],
            unidad=validated_data["unidad_obj"],
            puesto=validated_data["puesto_obj"],
            manager=validated_data.get("manager_obj"),
            nombres=validated_data["nombres"].strip(),
            apellidos=validated_data["apellidos"].strip(),
            documento=None,      # NULL SIEMPRE
            email=validated_data["email"],
            telefono=validated_data["telefono"].strip(),
            direccion=validated_data["direccion"].strip(),
            fecha_nacimiento=validated_data["fecha_nacimiento"],
            fecha_ingreso=hoy,   # backend registra hoy
            foto_url=None,       # NULL SIEMPRE
            estado=validated_data["estado"],
        )
        return e


class EmpleadoUpdateSerializer(serializers.Serializer):
    unidad_id = serializers.IntegerField()
    puesto_id = serializers.IntegerField()
    manager_id = serializers.IntegerField(required=False, allow_null=True)

    nombres = serializers.CharField()
    apellidos = serializers.CharField()
    email = serializers.EmailField()
    telefono = serializers.CharField()
    direccion = serializers.CharField()
    fecha_nacimiento = serializers.DateField()
    estado = serializers.IntegerField()

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        attrs["email"] = email

        if attrs["estado"] not in (1, 2, 3):
            raise serializers.ValidationError({"estado": "Estado inválido. Use 1=activo, 2=suspendido, 3=baja."})

        return attrs

    def update(self, instance, validated_data):
        # empresa fija (no se cambia)
        empresa_id = instance.empresa_id
        if not empresa_id:
            raise serializers.ValidationError({"empresa": "Este empleado no tiene empresa asociada."})

        # unidad y puesto deben ser de la misma empresa
        try:
            unidad = UnidadOrganizacional.objects.get(id=validated_data["unidad_id"], empresa_id=empresa_id)
        except UnidadOrganizacional.DoesNotExist:
            raise serializers.ValidationError({"unidad_id": "Unidad no existe o no pertenece a la empresa."})

        try:
            puesto = Puesto.objects.get(id=validated_data["puesto_id"], empresa_id=empresa_id)
        except Puesto.DoesNotExist:
            raise serializers.ValidationError({"puesto_id": "Puesto no existe o no pertenece a la empresa."})

        # manager opcional
        manager_obj = None
        manager_id = validated_data.get("manager_id", None)
        if manager_id:
            if manager_id == instance.id:
                raise serializers.ValidationError({"manager_id": "Un empleado no puede ser su propio manager."})
            try:
                manager_obj = Empleado.objects.get(id=manager_id, empresa_id=empresa_id)
            except Empleado.DoesNotExist:
                raise serializers.ValidationError({"manager_id": "Manager no existe o no pertenece a la empresa."})

        # email unique lógico (excluyendo a sí mismo)
        email = validated_data["email"]
        if Empleado.objects.filter(email__iexact=email).exclude(id=instance.id).exists():
            raise serializers.ValidationError({"email": "Ya existe otro empleado con ese email."})

        instance.unidad = unidad
        instance.puesto = puesto
        instance.manager = manager_obj

        instance.nombres = validated_data["nombres"].strip()
        instance.apellidos = validated_data["apellidos"].strip()
        instance.email = email
        instance.telefono = validated_data["telefono"].strip()
        instance.direccion = validated_data["direccion"].strip()
        instance.fecha_nacimiento = validated_data["fecha_nacimiento"]
        instance.estado = validated_data["estado"]

        # documento, foto_url, fecha_ingreso NO se tocan
        instance.save()
        return instance
