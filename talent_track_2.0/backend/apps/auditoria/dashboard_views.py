from datetime import timedelta

from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncHour, TruncDay

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.auditoria.models import LogAuditoria
from apps.notificaciones.models import Notificacion
from apps.usuarios.models import Usuario
from apps.core.models import Empresa  # asumo existe en apps/core/models.py


class SuperAdminDashboardView(APIView):
    """
    Dashboard GLOBAL (SuperAdmin):
    - métricas
    - series (uso por hora/día)
    - top empresas
    - notificaciones
    - picos/horas críticas
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # range: 24h | 7d | 30d
        r = (request.query_params.get("range") or "24h").lower()

        now = timezone.now()
        if r == "7d":
            since = now - timedelta(days=7)
            bucket = "day"
        elif r == "30d":
            since = now - timedelta(days=30)
            bucket = "day"
        else:
            since = now - timedelta(hours=24)
            bucket = "hour"

        # -----------------------
        # CARDS (métricas globales)
        # -----------------------
        total_empresas = Empresa.objects.count()
        usuarios_activos = Usuario.objects.filter(estado=1).count()
        usuarios_bloqueados = Usuario.objects.filter(estado=2).count()

        acciones_total = LogAuditoria.objects.filter(fecha__gte=since).count()

        notif_total = Notificacion.objects.filter(enviada_el__gte=since).count()
        notif_leidas = Notificacion.objects.filter(enviada_el__gte=since, leida_el__isnull=False).count()

        # -----------------------
        # SERIES (uso)
        # -----------------------
        qs = LogAuditoria.objects.filter(fecha__gte=since)

        if bucket == "hour":
            serie = (
                qs.annotate(b=TruncHour("fecha"))
                  .values("b")
                  .annotate(total=Count("id"))
                  .order_by("b")
            )
            labels = [x["b"].strftime("%H:00") for x in serie]
        else:
            serie = (
                qs.annotate(b=TruncDay("fecha"))
                  .values("b")
                  .annotate(total=Count("id"))
                  .order_by("b")
            )
            labels = [x["b"].strftime("%Y-%m-%d") for x in serie]

        values = [x["total"] for x in serie]

        # -----------------------
        # Picos (hora/día crítica)
        # -----------------------
        avg = (sum(values) / len(values)) if values else 0
        threshold = avg * 1.5 if avg else 0

        picos = []
        for lbl, val in zip(labels, values):
            if threshold and val >= threshold:
                picos.append({"label": lbl, "value": val})

        # -----------------------
        # Top empresas por actividad
        # -----------------------
        top_empresas = (
            qs.values("empresa_id")
              .annotate(total=Count("id"))
              .order_by("-total")[:5]
        )

        # traer nombres de empresa
        empresa_ids = [x["empresa_id"] for x in top_empresas]
        empresas_map = {e.id: e.nombre for e in Empresa.objects.filter(id__in=empresa_ids)}

        top_empresas_fmt = [
            {"empresa_id": x["empresa_id"], "empresa": empresas_map.get(x["empresa_id"], f"Empresa {x['empresa_id']}"), "total": x["total"]}
            for x in top_empresas
        ]

        payload = {
            "range": r,
            "cards": {
                "total_empresas": total_empresas,
                "usuarios_activos": usuarios_activos,
                "usuarios_bloqueados": usuarios_bloqueados,
                "acciones_total": acciones_total,
                "notif_total": notif_total,
                "notif_leidas": notif_leidas,
            },
            "series": {
                "bucket": bucket,
                "labels": labels,
                "values": values,
            },
            "picos": {
                "avg": round(avg, 2),
                "threshold": round(threshold, 2),
                "items": picos,
            },
            "top_empresas": top_empresas_fmt,
            "descripciones": {
                "uso": "Cuenta acciones registradas en LogAuditoria por intervalo de tiempo.",
                "top_empresas": "Ranking de empresas con más actividad (acciones en LogAuditoria).",
                "notificaciones": "Notificaciones enviadas y cuántas fueron marcadas como leídas.",
                "picos": "Se marca pico si el valor supera 1.5x el promedio del rango seleccionado.",
            }
        }

        return Response(payload, status=200)
