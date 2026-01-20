import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../services/api";
import Plot from "react-plotly.js";
import Sidebar from "../../../components/Sidebar"; 
import logoWatermark from "../../../assets/img/talentrack_small.svg";
import "./dashboard-superadmin.css";

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

export default function DashboardSuperAdmin() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(180);
  const [question, setQuestion] = useState("overview");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/dashboard/superadmin/overview-plotly/?days=${days}&question=${question}`
      );
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Dashboard error:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [days, question]);

  const brand = data?.brand?.primary || "#D51F36";
  const kpis = data?.kpis || {};
  const questions = data?.questions || [];
  const alerts = data?.alerts || [];
  const figs = data?.figures || {};

  const charts = useMemo(() => {
    const items = [];
    for (const [key, figJson] of Object.entries(figs)) {
      const fig = parseFig(figJson);
      if (!fig) continue;
      const title = fig?.layout?.title?.text || key;
      items.push({ key, title, fig });
    }
    return items;
  }, [figs]);

  // --- Estilos de Layout y Nav ---
  const layoutWrapperStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f6f7fb',
    width: '100%',
  };

  const mainAreaStyle = {
    flex: 1,
    paddingLeft: '110px', 
    paddingRight: '30px',
    paddingTop: '30px',
    paddingBottom: '40px',
    position: 'relative',
    zIndex: 1,
  };

  const navBarStyle = {
    display: 'flex',
    gap: '25px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '25px',
    paddingLeft: '5px'
  };

  const navItemStyle = (isActive) => ({
    padding: '12px 5px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: isActive ? '#d51e37' : '#64748b',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #d51e37' : '3px solid transparent',
    transition: 'all 0.2s ease',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    outline: 'none'
  });

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px',
    opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  if (loading) return (
    <div style={layoutWrapperStyle}>
      <Sidebar />
      <div style={{...mainAreaStyle, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{ color: '#64748b', fontWeight: '600' }}>
            <i className='bx bx-loader-alt bx-spin' style={{ marginRight: '10px' }}></i>
            Generando reporte global...
        </div>
      </div>
    </div>
  );

  return (
    <div style={layoutWrapperStyle}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />
      
      <main style={{ ...mainAreaStyle, "--tt-brand": brand }}>
        {/* HEADER */}
        <div className="tt-header">
          <div>
            <h1 className="tt-h1">Consola de Mando Global</h1>
            <div className="tt-h2">SuperAdmin • Análisis de métricas consolidadas</div>
          </div>
          <div className="tt-filters">
            <button className={days === 30 ? "tt-btn tt-btn-primary" : "tt-btn"} onClick={() => setDays(30)}>30 días</button>
            <button className={days === 90 ? "tt-btn tt-btn-primary" : "tt-btn"} onClick={() => setDays(90)}>90 días</button>
            <button className={days === 180 ? "tt-btn tt-btn-primary" : "tt-btn"} onClick={() => setDays(180)}>180 días</button>
          </div>
        </div>

        {/* NUEVA BARRA DE NAVEGACIÓN DE PREGUNTAS (TABS) */}
        <nav style={navBarStyle}>
          {questions.map((q) => (
            <button
              key={q.key}
              style={navItemStyle(question === q.key)}
              onClick={() => setQuestion(q.key)}
            >
              {q.label}
            </button>
          ))}
        </nav>

        {/* RESUMEN KPI */}
        <div className="tt-kpis">
          <KpiCard title="Empresas activas" value={kpis.total_empresas ?? "0"} sub="en el sistema" />
          <KpiCard title="Total empleados" value={kpis.total_empleados ?? "0"} sub="consolidado" />
          <KpiCard title="Tardanza promedio" value={`${Number(kpis.tardanza_promedio || 0).toFixed(1)}m`} sub="minutos / global" />
          <KpiCard title="KPIs críticos" value={kpis.kpi_criticos ?? "0"} sub="revisión urgente" />
        </div>

        {/* GRÁFICAS */}
        <div className="tt-grid-6">
          {charts.slice(0, 6).map((c) => (
            <ChartCard key={c.key} title={c.title} subtitle="Métricas interactivas de gestión">
              <Plot
                data={c.fig.data}
                layout={{
                  ...c.fig.layout,
                  autosize: true,
                  margin: { t: 30, r: 10, l: 30, b: 30 },
                  paper_bgcolor: "rgba(0,0,0,0)",
                  plot_bgcolor: "rgba(0,0,0,0)",
                }}
                style={{ width: "100%", height: 320 }}
                useResizeHandler
                config={{ displayModeBar: false }}
              />
            </ChartCard>
          ))}

          {/* TABLA DE INCIDENCIAS */}
          <div className="tt-card tt-card-span2">
            <div className="tt-card-head">
              <div>
                <div className="tt-card-title">Ranking de Incidencias por Empresa</div>
                <div className="tt-card-sub">Top organizaciones con mayores tardanzas registradas</div>
              </div>
            </div>

            <div className="tt-card-body">
              <div className="tt-table-wrap">
                <table className="tt-table">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th style={{textAlign: 'center'}}>N° Tardanzas</th>
                      <th style={{textAlign: 'center'}}>Promedio (min)</th>
                      <th style={{textAlign: 'center'}}>Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: 20 }}>No hay alertas críticas</td></tr>
                    ) : (
                      alerts.map((r, idx) => {
                        const t = Number(r.tardanzas || 0);
                        const sev = t >= 20 ? "CRÍTICO" : t >= 10 ? "ADVERTENCIA" : "ESTABLE";
                        const cls = t >= 20 ? "tt-badge-high" : t >= 10 ? "tt-badge-med" : "tt-badge-low";
                        return (
                          <tr key={idx}>
                            <td style={{fontWeight: '700', color: '#1e293b'}}>{r.empresa__razon_social}</td>
                            <td style={{textAlign: 'center'}}>{t}</td>
                            <td style={{textAlign: 'center'}}>{Number(r.prom || 0).toFixed(1)}</td>
                            <td style={{textAlign: 'center'}}><span className={`tt-badge ${cls}`}>{sev}</span></td>
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
      </main>
    </div>
  );
}