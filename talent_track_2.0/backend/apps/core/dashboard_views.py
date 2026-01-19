from datetime import date, timedelta

from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import pandas as pd
import plotly.express as px

from apps.usuarios.permissions import IsSuperAdmin
from apps.empleados.models import Empleado
from apps.asistencia.models import JornadaCalculada
from apps.kpi.models import ResultadoKPI
from apps.ausencias.models import SolicitudAusencia

BRAND_RED = "#D51F36"


def _parse_days(qp, default=180, max_days=365):
    try:
        d = int(qp.get("days", default))
    except Exception:
        d = default
    return max(1, min(d, max_days))


def _base_layout(fig):
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"),
        title=dict(x=0.02, xanchor="left"),
        legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="left", x=0),
    )
    fig.update_xaxes(showgrid=True, gridcolor="rgba(15, 23, 42, 0.08)")
    fig.update_yaxes(showgrid=True, gridcolor="rgba(15, 23, 42, 0.08)")
    return fig


class SuperAdminOverviewPlotlyAPIView(APIView):
    """
    GET /api/dashboard/superadmin/overview-plotly/?days=180&question=overview
    question: overview | asistencia | ausencias | kpi | riesgo
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        days = _parse_days(request.query_params, default=180)
        desde = date.today() - timedelta(days=days)
        question = (request.query_params.get("question") or "overview").lower()

        # =============================
        # KPI Cards
        # =============================
        total_empresas = Empleado.objects.values("empresa_id").distinct().count()
        total_empleados = Empleado.objects.count()

        tard_prom_global = (
            JornadaCalculada.objects.filter(fecha__gte=desde)
            .aggregate(prom=Avg("minutos_tardanza"))
            .get("prom") or 0
        )

        kpi_qs = ResultadoKPI.objects.filter(calculado_el__date__gte=desde)
        kpi_criticos = kpi_qs.filter(cumplimiento_pct__lt=70).count()

        # =============================
        # 1) Empleados por empresa (bar)
        # =============================
        emp_rows = (
            Empleado.objects.values("empresa__razon_social")
            .annotate(total=Count("id"))
            .order_by("-total")
        )
        df_emp = pd.DataFrame(list(emp_rows))
        if df_emp.empty:
            df_emp = pd.DataFrame([{"empresa__razon_social": "Sin datos", "total": 0}])

        fig_emp = px.bar(
            df_emp,
            x="empresa__razon_social",
            y="total",
            title="Empleados por empresa",
            color_discrete_sequence=[BRAND_RED],
        )
        fig_emp.update_layout(
            xaxis_title="Empresa",
            yaxis_title="Total empleados",
            margin=dict(l=45, r=20, t=60, b=90)
        )
        _base_layout(fig_emp)

        # =============================
        # 2) KPI global donut
        # =============================
        ok = kpi_qs.filter(cumplimiento_pct__gte=90).count()
        medio = kpi_qs.filter(cumplimiento_pct__gte=70, cumplimiento_pct__lt=90).count()
        critico = kpi_qs.filter(cumplimiento_pct__lt=70).count()

        df_kpi_global = pd.DataFrame([
            {"estado": "OK (>=90)", "total": ok},
            {"estado": "Medio (70-89)", "total": medio},
            {"estado": "Crítico (<70)", "total": critico},
        ])

        fig_kpi_global = px.pie(
            df_kpi_global,
            names="estado",
            values="total",
            hole=0.55,
            title="Cumplimiento KPI global",
            color="estado",
            color_discrete_map={
                "OK (>=90)": BRAND_RED,
                "Medio (70-89)": "#111827",
                "Crítico (<70)": "#94a3b8",
            },
        )
        fig_kpi_global.update_layout(margin=dict(l=20, r=20, t=60, b=20))
        _base_layout(fig_kpi_global)

        # =============================
        # 3) Tardanza promedio por mes (line, x category)
        # =============================
        tardanza_rows = (
            JornadaCalculada.objects.filter(fecha__gte=desde)
            .annotate(mes=TruncMonth("fecha"))
            .values("mes")
            .annotate(tardanza_prom=Avg("minutos_tardanza"))
            .order_by("mes")
        )
        df_tard = pd.DataFrame(list(tardanza_rows))
        if df_tard.empty:
            df_tard = pd.DataFrame([{"mes": pd.Timestamp(date.today().replace(day=1)), "tardanza_prom": 0}])

        # ✅ evita warning timezone
        df_tard["mes"] = (
            pd.to_datetime(df_tard["mes"])
            .dt.tz_localize(None)
            .dt.to_period("M")
            .astype(str)
        )

        fig_tard = px.line(
            df_tard,
            x="mes",
            y="tardanza_prom",
            markers=True,
            title="Tardanza promedio por mes",
            color_discrete_sequence=[BRAND_RED],
        )
        fig_tard.update_xaxes(type="category", title="Mes")
        fig_tard.update_layout(
            yaxis_title="Minutos tardanza (prom)",
            margin=dict(l=60, r=20, t=60, b=55)
        )
        _base_layout(fig_tard)

        # =============================
        # 4) Top tardanzas por empresa (bar horizontal)
        # =============================
        top_tard_rows = (
            JornadaCalculada.objects.filter(fecha__gte=desde, minutos_tardanza__gt=0)
            .values("empresa__razon_social")
            .annotate(tardanzas=Count("id"), prom=Avg("minutos_tardanza"))
            .order_by("-tardanzas")[:10]
        )
        df_top_tard = pd.DataFrame(list(top_tard_rows))
        if df_top_tard.empty:
            df_top_tard = pd.DataFrame([{"empresa__razon_social": "Sin datos", "tardanzas": 0, "prom": 0}])

        fig_top_tard = px.bar(
            df_top_tard.sort_values("tardanzas", ascending=True),
            x="tardanzas",
            y="empresa__razon_social",
            orientation="h",
            title="Top empresas con más tardanzas",
            color_discrete_sequence=[BRAND_RED],
        )
        fig_top_tard.update_layout(
            xaxis_title="Tardanzas",
            yaxis_title="",
            margin=dict(l=140, r=20, t=60, b=30)
        )
        _base_layout(fig_top_tard)

        # =============================
        # 5) Ausencias por mes (area)  ✅ usa creada_el
        # =============================
        aus_rows = (
            SolicitudAusencia.objects.filter(creada_el__date__gte=desde)
            .annotate(mes=TruncMonth("creada_el"))
            .values("mes")
            .annotate(total=Count("id"))
            .order_by("mes")
        )
        df_aus = pd.DataFrame(list(aus_rows))
        if df_aus.empty:
            df_aus = pd.DataFrame([{"mes": pd.Timestamp(date.today().replace(day=1)), "total": 0}])

        # ✅ evita warning timezone
        df_aus["mes"] = (
            pd.to_datetime(df_aus["mes"])
            .dt.tz_localize(None)
            .dt.to_period("M")
            .astype(str)
        )

        fig_aus_area = px.area(
            df_aus,
            x="mes",
            y="total",
            title="Solicitudes de ausencia por mes",
            color_discrete_sequence=[BRAND_RED],
        )
        fig_aus_area.update_xaxes(type="category", title="Mes")
        fig_aus_area.update_layout(
            yaxis_title="Solicitudes",
            margin=dict(l=60, r=20, t=60, b=55)
        )
        _base_layout(fig_aus_area)

        # =============================
        # 6) KPIs por empresa (stacked) ✅ FIX KeyError robusto
        # =============================
        k_ok = (
            ResultadoKPI.objects.filter(calculado_el__date__gte=desde, cumplimiento_pct__gte=90)
            .values("empresa__razon_social").annotate(total=Count("id"))
        )
        k_med = (
            ResultadoKPI.objects.filter(calculado_el__date__gte=desde, cumplimiento_pct__gte=70, cumplimiento_pct__lt=90)
            .values("empresa__razon_social").annotate(total=Count("id"))
        )
        k_cri = (
            ResultadoKPI.objects.filter(calculado_el__date__gte=desde, cumplimiento_pct__lt=70)
            .values("empresa__razon_social").annotate(total=Count("id"))
        )

        df_ok = pd.DataFrame(list(k_ok)).rename(columns={"total": "OK (>=90)"})
        df_med = pd.DataFrame(list(k_med)).rename(columns={"total": "Medio (70-89)"})
        df_cri = pd.DataFrame(list(k_cri)).rename(columns={"total": "Crítico (<70)"})

        # ✅ Si vienen vacíos, forzamos columnas para que merge no falle
        if df_ok.empty:
            df_ok = pd.DataFrame(columns=["empresa__razon_social", "OK (>=90)"])
        if df_med.empty:
            df_med = pd.DataFrame(columns=["empresa__razon_social", "Medio (70-89)"])
        if df_cri.empty:
            df_cri = pd.DataFrame(columns=["empresa__razon_social", "Crítico (<70)"])

        # ✅ merge robusto (outer) sin bucle frágil
        df_kpi_emp = (
            df_ok.merge(df_med, on="empresa__razon_social", how="outer")
            .merge(df_cri, on="empresa__razon_social", how="outer")
            .fillna(0)
        )

        if df_kpi_emp.empty:
            df_kpi_emp = pd.DataFrame([{
                "empresa__razon_social": "Sin datos",
                "OK (>=90)": 0,
                "Medio (70-89)": 0,
                "Crítico (<70)": 0
            }])

        df_kpi_long = df_kpi_emp.melt(
            id_vars=["empresa__razon_social"],
            value_vars=["OK (>=90)", "Medio (70-89)", "Crítico (<70)"],
            var_name="estado",
            value_name="total"
        )

        fig_kpi_emp = px.bar(
            df_kpi_long,
            x="empresa__razon_social",
            y="total",
            color="estado",
            title="Distribución de KPIs por empresa",
            barmode="stack",
            color_discrete_map={
                "OK (>=90)": BRAND_RED,
                "Medio (70-89)": "#111827",
                "Crítico (<70)": "#94a3b8",
            },
        )
        fig_kpi_emp.update_layout(
            xaxis_title="Empresa",
            yaxis_title="KPIs",
            margin=dict(l=45, r=20, t=60, b=90)
        )
        _base_layout(fig_kpi_emp)

        # =============================
        # 7) Heatmap: Riesgo (Ausencias vs Tardanza)
        # =============================
        tard_emp = (
            JornadaCalculada.objects.filter(fecha__gte=desde)
            .values("empresa__razon_social")
            .annotate(tard_prom=Avg("minutos_tardanza"), tardanzas=Count("id"))
        )
        aus_emp = (
            SolicitudAusencia.objects.filter(creada_el__date__gte=desde)
            .values("empresa__razon_social")
            .annotate(ausencias=Count("id"))
        )

        df_t = pd.DataFrame(list(tard_emp))
        df_a = pd.DataFrame(list(aus_emp))

        if df_t.empty:
            df_t = pd.DataFrame([{"empresa__razon_social": "Sin datos", "tard_prom": 0, "tardanzas": 0}])
        if df_a.empty:
            df_a = pd.DataFrame([{"empresa__razon_social": "Sin datos", "ausencias": 0}])

        df_r = df_t.merge(df_a, on="empresa__razon_social", how="outer").fillna(0)
        df_heat = df_r[["empresa__razon_social", "ausencias", "tard_prom"]].set_index("empresa__razon_social")
        df_heat.columns = ["Ausencias", "Tardanza (prom)"]

        fig_riesgo = px.imshow(
            df_heat,
            aspect="auto",
            title="Mapa de riesgo (Ausencias vs Tardanza)",
            color_continuous_scale=[[0, "#ffffff"], [1, BRAND_RED]],
        )
        fig_riesgo.update_layout(margin=dict(l=140, r=20, t=60, b=30))
        _base_layout(fig_riesgo)

        # =============================
        # Tabla ranking (siempre)
        # =============================
        alerts_table = (
            JornadaCalculada.objects.filter(fecha__gte=desde, minutos_tardanza__gt=0)
            .values("empresa__razon_social")
            .annotate(tardanzas=Count("id"), prom=Avg("minutos_tardanza"))
            .order_by("-tardanzas")[:10]
        )

        figures = {
            "employees_by_company": fig_emp.to_json(),
            "kpi_global": fig_kpi_global.to_json(),
            "lateness_by_month": fig_tard.to_json(),
            "top_lateness_horizontal": fig_top_tard.to_json(),
            "absences_area": fig_aus_area.to_json(),
            "kpi_by_company_stacked": fig_kpi_emp.to_json(),
            "risk_heatmap": fig_riesgo.to_json(),
        }

        presets = {
            "overview": ["employees_by_company", "kpi_global", "lateness_by_month", "top_lateness_horizontal"],
            "asistencia": ["lateness_by_month", "top_lateness_horizontal", "risk_heatmap"],
            "ausencias": ["absences_area", "risk_heatmap"],
            "kpi": ["kpi_global", "kpi_by_company_stacked"],
            "riesgo": ["risk_heatmap", "top_lateness_horizontal", "absences_area"],
        }
        selected_keys = presets.get(question, presets["overview"])
        selected_figures = {k: figures[k] for k in selected_keys if k in figures}

        return Response({
            "range": {"days": days, "from": str(desde), "to": str(date.today())},
            "brand": {"primary": BRAND_RED},
            "kpis": {
                "total_empresas": total_empresas,
                "total_empleados": total_empleados,
                "tardanza_promedio": float(tard_prom_global),
                "kpi_criticos": kpi_criticos,
            },
            "alerts": list(alerts_table),
            "questions": [
                {"key": "overview", "label": "¿Cómo va el sistema en general?"},
                {"key": "asistencia", "label": "¿Qué empresas tienen más problemas de asistencia?"},
                {"key": "ausencias", "label": "¿Cómo evolucionan las ausencias?"},
                {"key": "kpi", "label": "¿Qué pasa con el desempeño/KPIs por empresa?"},
                {"key": "riesgo", "label": "¿Dónde está el mayor riesgo operativo?"},
            ],
            "figures": selected_figures,
        }, status=status.HTTP_200_OK)


from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated

class AdminRRHHOverviewPlotlyAPIView(APIView):
    """
    GET /api/dashboard/adminrrhh/overview-plotly/?days=180&question=overview
    question: overview | ausencias | asistencia | kpi
    ✅ Filtrado por empresa del usuario
    ✅ No depende de IsAdminRRHH
    """
    permission_classes = [IsAuthenticated]

    def _get_usuario(self, request):
        # en tu proyecto suele existir request.user.usuario
        return getattr(request.user, "usuario", None)

    def _check_rrhh_role(self, usuario):
        """
        Ajusta esta función según cómo guardas roles.
        Opciones típicas:
        - usuario.rol.nombre
        - usuario.roles (many-to-many)
        - usuario.tipo
        """
        if not usuario:
            return False

        # ✅ CASO 1: usuario tiene atributo "rol" con "nombre"
        rol = getattr(usuario, "rol", None)
        if rol and getattr(rol, "nombre", "").lower() in ["rrhh", "adminrrhh", "admin_rrhh"]:
            return True

        # ✅ CASO 2: usuario tiene roles M2M: usuario.roles.all()
        roles = getattr(usuario, "roles", None)
        if roles:
            try:
                for r in roles.all():
                    if getattr(r, "nombre", "").lower() in ["rrhh", "adminrrhh", "admin_rrhh"]:
                        return True
            except Exception:
                pass

        # ✅ CASO 3: campo directo tipo_rol / tipo
        tipo = (getattr(usuario, "tipo", "") or getattr(usuario, "tipo_rol", "")).lower()
        if tipo in ["rrhh", "adminrrhh", "admin_rrhh"]:
            return True

        return False

    def _get_empresa_id(self, usuario):
        # ✅ Tu usuario suele tener empresa_id
        return getattr(usuario, "empresa_id", None)

    def get(self, request):
        usuario = self._get_usuario(request)

        if not self._check_rrhh_role(usuario):
            return Response({"detail": "No autorizado (se requiere rol RRHH)."}, status=status.HTTP_403_FORBIDDEN)

        empresa_id = self._get_empresa_id(usuario)
        if not empresa_id:
            return Response({"detail": "No se pudo determinar la empresa del usuario RRHH."}, status=status.HTTP_400_BAD_REQUEST)

        days = _parse_days(request.query_params, default=180)
        desde = date.today() - timedelta(days=days)
        question = (request.query_params.get("question") or "overview").lower()

        # KPI cards RRHH (solo su empresa)
        total_empleados = Empleado.objects.filter(empresa_id=empresa_id).count()

        tard_prom = (
            JornadaCalculada.objects.filter(empresa_id=empresa_id, fecha__gte=desde)
            .aggregate(prom=Avg("minutos_tardanza"))
            .get("prom") or 0
        )

        # Estado pendiente: AJUSTA si tu enum es distinto
        aus_pend = SolicitudAusencia.objects.filter(empresa_id=empresa_id, estado=1).count()
        aus_total = SolicitudAusencia.objects.filter(empresa_id=empresa_id, creada_el__date__gte=desde).count()

        kpi_qs = ResultadoKPI.objects.filter(empresa_id=empresa_id, calculado_el__date__gte=desde)
        kpi_criticos = kpi_qs.filter(cumplimiento_pct__lt=70).count()

        # 1) Empleados por unidad (si el campo no existe, fallback a Puesto)
        try:
            emp_unidad_rows = (
                Empleado.objects.filter(empresa_id=empresa_id)
                .values("unidad_organizacional__nombre")
                .annotate(total=Count("id"))
                .order_by("-total")[:12]
            )
            df_unidad = pd.DataFrame(list(emp_unidad_rows))
            if df_unidad.empty:
                df_unidad = pd.DataFrame([{"unidad_organizacional__nombre": "Sin datos", "total": 0}])

            fig_unidad = px.bar(
                df_unidad.sort_values("total", ascending=True),
                x="total",
                y="unidad_organizacional__nombre",
                orientation="h",
                title="Empleados por unidad organizacional",
                color_discrete_sequence=[BRAND_RED],
            )
            fig_unidad.update_layout(margin=dict(l=160, r=20, t=60, b=30), xaxis_title="Empleados", yaxis_title="")
            _base_layout(fig_unidad)
            fig_unidad_json = fig_unidad.to_json()
        except Exception:
            # fallback: empleados por puesto
            emp_puesto_rows = (
                Empleado.objects.filter(empresa_id=empresa_id)
                .values("puesto__nombre")
                .annotate(total=Count("id"))
                .order_by("-total")[:12]
            )
            df_p = pd.DataFrame(list(emp_puesto_rows))
            if df_p.empty:
                df_p = pd.DataFrame([{"puesto__nombre": "Sin datos", "total": 0}])

            fig_p = px.bar(
                df_p.sort_values("total", ascending=True),
                x="total",
                y="puesto__nombre",
                orientation="h",
                title="Empleados por puesto",
                color_discrete_sequence=[BRAND_RED],
            )
            fig_p.update_layout(margin=dict(l=160, r=20, t=60, b=30), xaxis_title="Empleados", yaxis_title="")
            _base_layout(fig_p)
            fig_unidad_json = fig_p.to_json()

        # 2) Ausencias por mes (area) + por estado (donut)
        aus_rows = (
            SolicitudAusencia.objects.filter(empresa_id=empresa_id, creada_el__date__gte=desde)
            .annotate(mes=TruncMonth("creada_el"))
            .values("mes")
            .annotate(total=Count("id"))
            .order_by("mes")
        )
        df_aus = pd.DataFrame(list(aus_rows))
        if df_aus.empty:
            df_aus = pd.DataFrame([{"mes": pd.Timestamp(date.today().replace(day=1)), "total": 0}])

        df_aus["mes"] = pd.to_datetime(df_aus["mes"]).dt.tz_localize(None).dt.to_period("M").astype(str)

        fig_aus_area = px.area(
            df_aus, x="mes", y="total",
            title="Solicitudes de ausencia por mes (mi empresa)",
            color_discrete_sequence=[BRAND_RED],
        )
        fig_aus_area.update_xaxes(type="category", title="Mes")
        fig_aus_area.update_layout(margin=dict(l=60, r=20, t=60, b=55), yaxis_title="Solicitudes")
        _base_layout(fig_aus_area)

        aus_estado_rows = (
            SolicitudAusencia.objects.filter(empresa_id=empresa_id, creada_el__date__gte=desde)
            .values("estado")
            .annotate(total=Count("id"))
            .order_by("estado")
        )
        df_aus_estado = pd.DataFrame(list(aus_estado_rows))
        if df_aus_estado.empty:
            df_aus_estado = pd.DataFrame([{"estado": 0, "total": 0}])

        estado_map = {1: "Pendiente", 2: "Aprobada", 3: "Rechazada", 0: "Sin datos"}
        df_aus_estado["estado_lbl"] = df_aus_estado["estado"].map(lambda x: estado_map.get(x, f"Estado {x}"))

        fig_aus_donut = px.pie(
            df_aus_estado, names="estado_lbl", values="total",
            hole=0.55, title="Ausencias por estado",
            color_discrete_sequence=[BRAND_RED, "#111827", "#94a3b8", "#64748b"],
        )
        fig_aus_donut.update_layout(margin=dict(l=20, r=20, t=60, b=20))
        _base_layout(fig_aus_donut)

        # 3) Asistencia: tardanza por mes
        tard_rows = (
            JornadaCalculada.objects.filter(empresa_id=empresa_id, fecha__gte=desde)
            .annotate(mes=TruncMonth("fecha"))
            .values("mes")
            .annotate(tardanza_prom=Avg("minutos_tardanza"))
            .order_by("mes")
        )
        df_t = pd.DataFrame(list(tard_rows))
        if df_t.empty:
            df_t = pd.DataFrame([{"mes": pd.Timestamp(date.today().replace(day=1)), "tardanza_prom": 0}])

        df_t["mes"] = pd.to_datetime(df_t["mes"]).dt.tz_localize(None).dt.to_period("M").astype(str)

        fig_t = px.line(
            df_t, x="mes", y="tardanza_prom",
            markers=True,
            title="Tardanza promedio por mes (mi empresa)",
            color_discrete_sequence=[BRAND_RED],
        )
        fig_t.update_xaxes(type="category", title="Mes")
        fig_t.update_layout(margin=dict(l=60, r=20, t=60, b=55), yaxis_title="Minutos (prom)")
        _base_layout(fig_t)

        # 4) KPI donut (empresa)
        ok = kpi_qs.filter(cumplimiento_pct__gte=90).count()
        medio = kpi_qs.filter(cumplimiento_pct__gte=70, cumplimiento_pct__lt=90).count()
        crit = kpi_qs.filter(cumplimiento_pct__lt=70).count()

        df_k = pd.DataFrame([
            {"estado": "OK (>=90)", "total": ok},
            {"estado": "Medio (70-89)", "total": medio},
            {"estado": "Crítico (<70)", "total": crit},
        ])

        fig_k = px.pie(
            df_k, names="estado", values="total",
            hole=0.55, title="KPIs (mi empresa) • distribución",
            color="estado",
            color_discrete_map={
                "OK (>=90)": BRAND_RED,
                "Medio (70-89)": "#111827",
                "Crítico (<70)": "#94a3b8",
            },
        )
        fig_k.update_layout(margin=dict(l=20, r=20, t=60, b=20))
        _base_layout(fig_k)

        # Tabla top empleados tardíos
        top_emp_rows = (
            JornadaCalculada.objects.filter(empresa_id=empresa_id, fecha__gte=desde, minutos_tardanza__gt=0)
            .values("empleado__nombres", "empleado__apellidos")
            .annotate(tardanzas=Count("id"), prom=Avg("minutos_tardanza"))
            .order_by("-tardanzas")[:10]
        )

        figures_all = {
            "employees_by_unit_horizontal": fig_unidad_json,
            "absences_status_donut": fig_aus_donut.to_json(),
            "absences_area": fig_aus_area.to_json(),
            "lateness_by_month": fig_t.to_json(),
            "kpi_company_donut": fig_k.to_json(),
        }

        presets = {
            "overview": ["employees_by_unit_horizontal", "absences_status_donut", "lateness_by_month", "kpi_company_donut"],
            "ausencias": ["absences_status_donut", "absences_area"],
            "asistencia": ["lateness_by_month"],
            "kpi": ["kpi_company_donut"],
        }
        selected_keys = presets.get(question, presets["overview"])
        selected_figures = {k: figures_all[k] for k in selected_keys if k in figures_all}

        return Response({
            "range": {"days": days, "from": str(desde), "to": str(date.today())},
            "brand": {"primary": BRAND_RED},
            "empresa_id": empresa_id,
            "kpis": {
                "total_empleados": total_empleados,
                "tardanza_promedio": float(tard_prom),
                "ausencias_pendientes": aus_pend,
                "ausencias_total_rango": aus_total,
                "kpi_criticos": kpi_criticos,
            },
            "questions": [
                {"key": "overview", "label": "¿Cómo va mi empresa hoy?"},
                {"key": "ausencias", "label": "¿Qué pasa con ausencias y aprobaciones?"},
                {"key": "asistencia", "label": "¿Cómo está la asistencia (tardanzas)?"},
                {"key": "kpi", "label": "¿Cómo va el desempeño (KPIs)?"},
            ],
            "top_empleados_tardanzas": list(top_emp_rows),
            "figures": selected_figures,
        }, status=status.HTTP_200_OK)
