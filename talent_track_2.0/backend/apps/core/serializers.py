from rest_framework import serializers
from .models import Empresa

from django.utils import timezone

PAISES = {
    1: "Argentina",
    2: "Bolivia",
    3: "Chile",
    4: "Colombia",
    5: "Costa Rica",
    6: "Cuba",
    7: "República Dominicana",
    8: "Ecuador",
    9: "El Salvador",
    10: "España",
    11: "Guatemala",
    12: "Honduras",
    13: "México",
    14: "Nicaragua",
    15: "Panamá",
    16: "Paraguay",
    17: "Perú",
    18: "Uruguay",
    19: "Venezuela",
}

MONEDAS = {
    1: "Peso argentino (ARS)",
    2: "Boliviano (BOB)",
    3: "Peso chileno (CLP)",
    4: "Peso colombiano (COP)",
    5: "Colón costarricense (CRC)",
    6: "Peso cubano (CUP)",
    7: "Peso dominicano (DOP)",
    8: "Dólar estadounidense (USD)",
    9: "Dólar estadounidense (USD)",
    10: "Euro (EUR)",
    11: "Quetzal (GTQ)",
    12: "Lempira (HNL)",
    13: "Peso mexicano (MXN)",
    14: "Córdoba nicaragüense (NIO)",
    15: "Balboa (PAB) / USD",
    16: "Guaraní paraguayo (PYG)",
    17: "Sol peruano (PEN)",
    18: "Peso uruguayo (UYU)",
    19: "Bolívar venezolano (VES)",
}

ESTADOS = {
    1: "activo",
    2: "inactivo",
}

class EmpresaSerializer(serializers.ModelSerializer):
    pais_nombre = serializers.SerializerMethodField()
    moneda_nombre = serializers.SerializerMethodField()
    estado_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Empresa
        fields = [
            'id',
            'razon_social',
            'nombre_comercial',
            'ruc_nit',
            'pais',
            'pais_nombre',
            'moneda',
            'moneda_nombre',
            'logo_url',
            'estado',
            'estado_nombre',
            'creada_el'
        ]

    def get_pais_nombre(self, obj):
        return PAISES.get(obj.pais, "Desconocido")

    def get_moneda_nombre(self, obj):
        return MONEDAS.get(obj.moneda, "Desconocida")

    def get_estado_nombre(self, obj):
        return ESTADOS.get(obj.estado, "Desconocido")


class EmpresaCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Empresa
        fields = (
            'razon_social',
            'nombre_comercial',
            'ruc_nit',
            'pais',
            'moneda',
            'estado',
            'creada_el',
            'logo_url',
        )
        read_only_fields = (
            'estado',
            'creada_el',
            'logo_url',
        )
        
    def create(self, validated_data):
        empresa = Empresa.objects.create(
            razon_social=validated_data['razon_social'],
            nombre_comercial=validated_data['nombre_comercial'],
            ruc_nit=validated_data['ruc_nit'],
            pais=validated_data['pais'],
            moneda=validated_data['moneda'],
            estado=1,            
            creada_el=timezone.now(),
            logo_url=None                
        )
        return empresa
    
class EmpresaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = (
            'razon_social',
            'nombre_comercial',
            'ruc_nit',
            'pais',
            'moneda',
            'estado',
        )

 # apps/core/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Empresa, UnidadOrganizacional

TIPOS_UNIDAD = {
    1: "sede",
    2: "area",
    3: "depto",
}

ESTADOS_UNIDAD = {
    1: "activa",
    2: "inactiva",
}


class UnidadOrganizacionalListSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.SerializerMethodField()
    unidad_padre_nombre = serializers.SerializerMethodField()
    tipo_nombre = serializers.SerializerMethodField()
    estado_nombre = serializers.SerializerMethodField()

    class Meta:
        model = UnidadOrganizacional
        fields = [
            "id",
            "empresa",              # id empresa
            "empresa_nombre",       # razon_social
            "unidad_padre",         # id unidad padre
            "unidad_padre_nombre",  # nombre unidad padre (o N/A)
            "nombre",
            "tipo",
            "tipo_nombre",
            "ubicacion",
            "estado",
            "estado_nombre",
            "creada_el",
        ]

    def get_empresa_nombre(self, obj):
        return getattr(obj.empresa, "razon_social", None)

    def get_unidad_padre_nombre(self, obj):
        if obj.unidad_padre and obj.unidad_padre.nombre:
            return obj.unidad_padre.nombre
        return "N/A"

    def get_tipo_nombre(self, obj):
        return TIPOS_UNIDAD.get(obj.tipo, "desconocido")

    def get_estado_nombre(self, obj):
        return ESTADOS_UNIDAD.get(obj.estado, "desconocido")


class UnidadOrganizacionalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadOrganizacional
        fields = [
            "empresa",
            "unidad_padre",
            "nombre",
            "tipo",
            "ubicacion",
        ]

    def validate(self, attrs):
        # Si unidad_padre existe, debe ser de la MISMA empresa
        empresa = attrs.get("empresa")
        unidad_padre = attrs.get("unidad_padre")
        if unidad_padre and empresa and unidad_padre.empresa_id != empresa.id:
            raise serializers.ValidationError(
                {"unidad_padre": "La unidad padre debe pertenecer a la misma empresa."}
            )
        return attrs

    def create(self, validated_data):
        # Defaults en backend
        validated_data["estado"] = 1
        validated_data["creada_el"] = timezone.now()
        return super().create(validated_data)


class UnidadOrganizacionalUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadOrganizacional
        fields = [
            "unidad_padre",
            "nombre",
            "tipo",
            "ubicacion",
            "estado",
        ]

    def validate(self, attrs):
        # Evitar que unidad_padre apunte a sí misma
        unidad_padre = attrs.get("unidad_padre")
        if unidad_padre and self.instance and unidad_padre.id == self.instance.id:
            raise serializers.ValidationError(
                {"unidad_padre": "Una unidad no puede ser padre de sí misma."}
            )

        # Si se cambia unidad_padre, debe ser misma empresa
        if unidad_padre and self.instance and unidad_padre.empresa_id != self.instance.empresa_id:
            raise serializers.ValidationError(
                {"unidad_padre": "La unidad padre debe pertenecer a la misma empresa."}
            )

        return attrs
   

# apps/core/serializers.py
from rest_framework import serializers
from django.utils import timezone

from .models import Empresa, Puesto, UnidadOrganizacional  # <-- agrega Puesto, UnidadOrganizacional

# ... (tu código actual de EmpresaSerializer, etc) ...

class PuestoSerializer(serializers.ModelSerializer):
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)
    unidad_nombre = serializers.CharField(source="unidad.nombre", read_only=True)

    class Meta:
        model = Puesto
        fields = [
            "id",
            "empresa",
            "empresa_razon_social",
            "unidad",
            "unidad_nombre",
            "nombre",
            "descripcion",
            "nivel",
            "salario_referencial",
        ]


class PuestoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = [
            "empresa",
            "unidad",
            "nombre",
            "descripcion",
            "nivel",
            "salario_referencial",
        ]

    def validate(self, attrs):
        empresa = attrs.get("empresa")
        unidad = attrs.get("unidad")

        # La unidad debe pertenecer a la misma empresa
        if unidad and empresa and unidad.empresa_id != empresa.id:
            raise serializers.ValidationError("La unidad seleccionada no pertenece a la empresa.")
        return attrs


class PuestoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puesto
        fields = [
            "unidad",
            "nombre",
            "descripcion",
            "nivel",
            "salario_referencial",
        ]

    def validate(self, attrs):
        # Si cambia unidad, validar que sea de la misma empresa del puesto
        puesto = self.instance
        unidad = attrs.get("unidad")
        if unidad and puesto and unidad.empresa_id != puesto.empresa_id:
            raise serializers.ValidationError("La unidad seleccionada no pertenece a la empresa del puesto.")
        return attrs
