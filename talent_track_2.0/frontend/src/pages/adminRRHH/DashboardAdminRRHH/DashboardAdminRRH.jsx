import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../services/api";
import Plot from "react-plotly.js";
import "./dashboard-adminRRH.css";

function KpiCard({ title, value, sub }) {
  return (
    <div className="tt-kpi">
      <div className="tt-kpi-title">{title}</div>
      <div className="tt-kpi-value">{value}</div>
      {sub ? <div className="tt-kpi-sub">{sub}</div> : null}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="tt-card">
      <div className="tt-card-head">
        <div>
          <div className="tt-card-title">{title}</div>
          {subtitle ? <div className="tt-card-sub">{subtitle}</div> : null}
        </div>
        <div className="tt-card-actions">
          <button className="tt-btn">Acciones</button>
        </div>
      </div>
      <div className="tt-card-body">{children}</div>
    </div>
  );
}

function parseFig(figJson) {
  try {
    return figJson ? JSON.parse(figJson) : null;
  } catch {
    return null;
  }
}

export default function DashboardAdminRRH() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(180);
  const [question, setQuestion] = useState("overview");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/dashboard/adminrrhh/overview-plotly/?days=${days}&question=${question}`
      );
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Dashboard RRHH error:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, question]);

  const brand = data?.brand?.primary || "#D51F36";
  const kpis = data?.kpis || {};
  const questions = data?.questions || [];
  const top = data?.top_empleados_tardanzas || [];
  const figs = data?.figures || {};

  const charts = useMemo(() => {
    const items = [];
    for (const [key, figJson] of Object.entries(figs)) {
      const fig = parseFig(figJson);
      if (!fig) continue;
      items.push({
        key,
        title: fig?.layout?.title?.text || key,
        fig,
      });
    }
    return items;
  }, [figs]);

  if (loading) return <div className="tt-page">Cargando dashboard RRHH...</div>;
  if (!data) return <div className="tt-page">Sin datos</div>;

  return (
    <div className="tt-page" style={{ "--tt-brand": brand }}>
      {/* HEADER */}
      <div className="tt-header">
        <div>
          <div className="tt-h1">Dashboard Admin RRHH</div>
          <div className="tt-h2">Tu empresa • Ausencias • Asistencia • KPIs</div>
        </div>
        <div className="tt-filters">
          <button className={days === 30 ? "tt-btn tt-btn-primary" : "tt-btn"} onClick={() => setDays(30)}>30d</button>
          <button className={days === 90 ? "tt-btn tt-btn-primary" : "tt-btn"} onClick={() => setDays(90)}>90d</button>
          <button className={days === 180 ? "tt-btn tt-btn-primary" : "tt-btn"} onClick={() => setDays(180)}>180d</button>
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="tt-questions">
        {questions.map((q) => (
          <button
            key={q.key}
            className={question === q.key ? "tt-chip tt-chip-active" : "tt-chip"}
            onClick={() => setQuestion(q.key)}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="tt-kpis">
        <KpiCard title="Empleados" value={kpis.total_empleados ?? "-"} sub="en mi empresa" />
        <KpiCard title="Ausencias pendientes" value={kpis.ausencias_pendientes ?? "-"} sub="requieren acción" />
        <KpiCard title="Tardanza promedio" value={Number(kpis.tardanza_promedio || 0).toFixed(1)} sub="minutos (prom)" />
        <KpiCard title="KPIs críticos" value={kpis.kpi_criticos ?? "-"} sub="cumplimiento < 70" />
      </div>

      {/* GRID de gráficas */}
      <div className="tt-grid-2">
        {charts.map((c) => (
          <ChartCard key={c.key} title={c.title} subtitle="Plotly • Interactivo • Filtrado por empresa">
            <Plot
              data={c.fig.data}
              layout={{
                ...c.fig.layout,
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
              }}
              style={{ width: "100%", height: 320 }}
              useResizeHandler
              config={{ displayModeBar: false }}
            />
          </ChartCard>
        ))}

        {/* Tabla Top empleados tardíos */}
        <div className="tt-card tt-span2">
          <div className="tt-card-head">
            <div>
              <div className="tt-card-title">Top empleados con tardanzas</div>
              <div className="tt-card-sub">Ranking del rango seleccionado</div>
            </div>
            <div className="tt-card-actions">
              <button className="tt-btn tt-btn-primary">Abrir Jornadas</button>
            </div>
          </div>
          <div className="tt-card-body">
            <div className="tt-table-wrap">
              <table className="tt-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Tardanzas</th>
                    <th>Prom (min)</th>
                    <th>Severidad</th>
                  </tr>
                </thead>
                <tbody>
                  {top.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 14 }}>Sin registros</td></tr>
                  ) : (
                    top.map((r, idx) => {
                      const t = Number(r.tardanzas || 0);
                      const sev = t >= 15 ? "ALTA" : t >= 8 ? "MEDIA" : "BAJA";
                      const cls = t >= 15 ? "tt-badge-high" : t >= 8 ? "tt-badge-med" : "tt-badge-low";
                      return (
                        <tr key={idx}>
                          <td>{r.empleado__nombres} {r.empleado__apellidos}</td>
                          <td>{t}</td>
                          <td>{Number(r.prom || 0).toFixed(1)}</td>
                          <td><span className={`tt-badge ${cls}`}>{sev}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
