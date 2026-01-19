import pytest
from django.utils import timezone

from apps.core.models import Empresa, UnidadOrganizacional
from apps.core.serializers import (
    EmpresaSerializer,
    UnidadOrganizacionalCreateSerializer,
    UnidadOrganizacionalUpdateSerializer,
)

pytestmark = pytest.mark.django_db


def test_mapeo_desconocido_en_serializer_empresa():
    """
    Verifica que el serializer de Empresa devuelva valores por defecto
    cuando los códigos de país, moneda y estado no existen.
    """
    empresa = Empresa.objects.create(
        razon_social="Empresa X",
        nombre_comercial="X",
        ruc_nit="0999999999001",
        pais=999,
        moneda=999,
        estado=999,
        creada_el=timezone.now(),
        logo_url=None,
    )

    data = EmpresaSerializer(empresa).data
    assert data["pais_nombre"] == "Desconocido"
    assert data["moneda_nombre"] == "Desconocida"
    assert data["estado_nombre"] == "Desconocido"


def test_validacion_unidad_padre_debe_pertenecer_a_misma_empresa():
    """
    Verifica que no se permita crear una unidad organizacional
    cuya unidad padre pertenezca a una empresa diferente.
    """
    empresa_a = Empresa.objects.create(
        razon_social="Empresa A",
        nombre_comercial="A",
        ruc_nit="0999999999002",
        pais=8,
        moneda=8,
        estado=1,
        creada_el=timezone.now(),
        logo_url=None,
    )
    empresa_b = Empresa.objects.create(
        razon_social="Empresa B",
        nombre_comercial="B",
        ruc_nit="0999999999003",
        pais=8,
        moneda=8,
        estado=1,
        creada_el=timezone.now(),
        logo_url=None,
    )

    unidad_padre_b = UnidadOrganizacional.objects.create(
        empresa=empresa_b,
        unidad_padre=None,
        nombre="Padre B",
        tipo=1,
        ubicacion="Quito",
        estado=1,
        creada_el=timezone.now(),
    )

    payload = {
        "empresa": empresa_a.id,
        "unidad_padre": unidad_padre_b.id,
        "nombre": "Hija A",
        "tipo": 2,
        "ubicacion": "Loja",
    }

    serializer = UnidadOrganizacionalCreateSerializer(data=payload)
    assert serializer.is_valid() is False
    assert serializer.errors["unidad_padre"][0] == (
        "La unidad padre debe pertenecer a la misma empresa."
    )


def test_validacion_unidad_no_puede_ser_padre_de_si_misma():
    """
    Verifica que una unidad organizacional no pueda asignarse
    a sí misma como unidad padre.
    """
    empresa = Empresa.objects.create(
        razon_social="Empresa C",
        nombre_comercial="C",
        ruc_nit="0999999999004",
        pais=8,
        moneda=8,
        estado=1,
        creada_el=timezone.now(),
        logo_url=None,
    )

    unidad = UnidadOrganizacional.objects.create(
        empresa=empresa,
        unidad_padre=None,
        nombre="Unidad 1",
        tipo=1,
        ubicacion="Loja",
        estado=1,
        creada_el=timezone.now(),
    )

    payload = {"unidad_padre": unidad.id}
    serializer = UnidadOrganizacionalUpdateSerializer(
        instance=unidad,
        data=payload,
        partial=True
    )
    assert serializer.is_valid() is False
    assert serializer.errors["unidad_padre"][0] == (
        "Una unidad no puede ser padre de sí misma."
    )
