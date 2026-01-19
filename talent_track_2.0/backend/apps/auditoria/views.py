from django.shortcuts import render

# Create your views here.
# apps/auditoria/views.py
from datetime import datetime
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.auditoria.models import LogAuditoria
from apps.usuarios.models import Usuario
from apps.usuarios.permissions import IsSuperAdmin, IsAuditor
from apps.usuarios.scopes import get_scope

from .serializers import LogAuditoriaListSerializer, LogAuditoriaDetailSerializer


# =========================================================
# SUPERADMIN (GLOBAL - multiempresa)
# =========================================================

class SuperAdminLogsAuditoriaAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    """
    GET /api/auditoria/superadmin/logs/?empresa_id=&usuario_email=&fecha=YYYY-MM-DD
    - empresa_id: opcional
    - usuario_email: opcional
    - fecha: opcional (YYYY-MM-DD)
    """

    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        usuario_email = request.query_params.get("usuario_email")
        fecha_str = request.query_params.get("fecha")

        qs = (
            LogAuditoria.objects
            .select_related("empresa", "usuario")
            .all()
            .order_by("-fecha", "-id")
        )

        if empresa_id:
            qs = qs.filter(empresa_id=empresa_id)

        if usuario_email:
            qs = qs.filter(usuario__email__iexact=usuario_email.strip().lower())

        if fecha_str:
            d = parse_date(fecha_str)
            if d:
                qs = qs.filter(fecha__date=d)

        return Response(LogAuditoriaListSerializer(qs, many=True).data, status=200)


class SuperAdminLogAuditoriaDetailAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    """
    GET /api/auditoria/superadmin/logs/<id>/
    """

    def get(self, request, pk):
        obj = get_object_or_404(
            LogAuditoria.objects.select_related("empresa", "usuario"),
            pk=pk
        )
        return Response(LogAuditoriaDetailSerializer(obj).data, status=200)


class SuperAdminUsuariosToggleAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    """
    GET /api/auditoria/superadmin/helpers/usuarios/?empresa_id=
    - Devuelve lista de emails para el toggle.
    - Si empresa_id viene, devuelve usuarios de esa empresa.
    - Si no viene, devuelve todos los usuarios (excepto superadmin global si existiera).
    """

    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")

        qs = Usuario.objects.all().order_by("email")

        # opcional: filtrar por empresa
        if empresa_id:
            qs = qs.filter(empresa_id=empresa_id)

        # opcional: excluir superadmin por coherencia (si hay usuarios con ese rol global)
        # (sin joins pesados aquí; lo dejamos simple)
        data = [{"email": (u.email or "").strip().lower()} for u in qs if u.email]
        # eliminar duplicados manteniendo orden
        seen = set()
        out = []
        for item in data:
            if item["email"] not in seen:
                seen.add(item["email"])
                out.append(item)
        return Response(out, status=200)


# =========================================================
# AUDITOR (SCOPED - solo su empresa)  [si lo quieres aquí también]
# =========================================================

class AuditorLogsAuditoriaAPIView(APIView):
    permission_classes = [IsAuditor]

    """
    GET /api/auditoria/auditor/logs/?usuario_email=&fecha=YYYY-MM-DD
    (filtra por empresa desde el token)
    """

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope.get("empresa_id")

        usuario_email = request.query_params.get("usuario_email")
        fecha_str = request.query_params.get("fecha")

        qs = (
            LogAuditoria.objects
            .select_related("empresa", "usuario")
            .filter(empresa_id=empresa_id)
            .order_by("-fecha", "-id")
        )

        if usuario_email:
            qs = qs.filter(usuario__email__iexact=usuario_email.strip().lower())

        if fecha_str:
            d = parse_date(fecha_str)
            if d:
                qs = qs.filter(fecha__date=d)

        return Response(LogAuditoriaListSerializer(qs, many=True).data, status=200)
