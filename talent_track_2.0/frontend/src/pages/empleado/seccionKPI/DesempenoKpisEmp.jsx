import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/SidebarEmpleado";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";
import "../../../assets/css/admin-empresas.css"; // Global styles

// --- HELPERS ---
async function safeJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; }
  catch { return { _non_json: true, raw: text }; }
}

// Visual Progress Bar Component
function PctBar({ value }) {
  const v = Number(value || 0);
  const w = Math.max(0, Math.min(100, v));
  
  let color = '#3b82f6'; // Blue default
  if (w >= 90) color = '#16a34a'; // Green (Excellent)
  else if (w < 60) color = '#dc2626'; // Red (Low)
  else if (w < 80) color = '#d97706'; // Orange (Warning)

  return (
    <div style={{ background: "#e2e8f0", borderRadius: 20, overflow: "hidden", height: 8, width: 120, display: 'inline-block', verticalAlign: 'middle' }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function DesempenoKpisEmp() {
  const [tab, setTab] = useState("asignados"); // asignados | resultados | evaluaciones | evolucion
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [catalogoKpi, setCatalogoKpi] = useState([]);
  const [asignados, setAsignados] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evolucion, setEvolucion] = useState({ kpi_avg: [], eval_avg: [] });

  const [filtro, setFiltro] = useState({
    kpi_id: "",
    desde: "",
    hasta: "",
    periodo: "",
  });

  // --- API LOADING ---
  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const rCat = await apiFetch("/api/empleado/kpis/catalogo/");
      const dCat = await safeJson(rCat);
      if (!rCat.ok) throw new Error(dCat?.detail || "Error cargando catálogo de KPIs.");

      const rAs = await apiFetch("/api/empleado/kpis/asignados/");
      const dAs = await safeJson(rAs);
      if (!rAs.ok) throw new Error(dAs?.detail || "Error cargando KPIs asignados.");

      setCatalogoKpi(dCat || []);
      setAsignados(dAs || []);
    } catch (e) {
      setErr(e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filtro.kpi_id) params.set("kpi_id", filtro.kpi_id);
    if (filtro.periodo) params.set("periodo", filtro.periodo);
    if (filtro.desde) params.set("desde", filtro.desde);
    if (filtro.hasta) params.set("hasta", filtro.hasta);
    const q = params.toString();
    return q ? `?${q}` : "";
  };

  const cargarResultados = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/empleado/kpis/resultados/${buildQuery()}`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data || {}));
      setResultados(data || []);
    } catch (e) {
      setErr(e?.message || "Error cargando resultados.");
    } finally {
      setLoading(false);
    }
  };

  const cargarEvaluaciones = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/empleado/kpis/evaluaciones/${buildQuery()}`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data || {}));
      setEvaluaciones(data || []);
    } catch (e) {
      setErr(e?.message || "Error cargando evaluaciones.");
    } finally {
      setLoading(false);
    }
  };

  const cargarEvolucion = async () => {
    setErr("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtro.desde) params.set("desde", filtro.desde);
      if (filtro.hasta) params.set("hasta", filtro.hasta);
      const q = params.toString();
      const res = await apiFetch(`/api/empleado/kpis/evolucion/${q ? `?${q}` : ""}`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data || {}));
      setEvolucion(data || { kpi_avg: [], eval_avg: [] });
    } catch (e) {
      setErr(e?.message || "Error cargando evolución.");
    } finally {
      setLoading(false);
    }
  };

  const quick = useMemo(() => {
    const lastRes = resultados?.[0];
    const lastEval = evaluaciones?.[0];
    return {
      asignados: asignados?.length || 0,
      lastCumpl: lastRes?.cumplimiento_pct ?? null,
      lastPeriodoRes: lastRes?.periodo ?? "",
      lastEval: lastEval?.puntaje_total ?? null,
      lastPeriodoEval: lastEval?.periodo ?? "",
    };
  }, [asignados, resultados, evaluaciones]);

  const onFiltro = (e) => {
    const { name, value } = e.target;
    setFiltro((p) => ({ ...p, [name]: value }));
  };

  // --- STYLES ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', padding: '24px' };
  
  const tabBtnStyle = (isActive) => ({
    padding: '10px 20px', borderRadius: '8px', border: 'none', 
    backgroundColor: isActive ? '#0f172a' : 'transparent', 
    color: isActive ? 'white' : '#64748b', 
    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
    fontSize: '0.9rem'
  });

  const filterInputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', width: '100%', outline: 'none' };
  const filterLabelStyle = { fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Desempeño & KPIs</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Monitorea tus objetivos y evaluaciones.</p>
            </div>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* QUICK STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
             <div style={cardStyle}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-target-lock' style={{ fontSize: '1.5rem' }}></i></div>
                     <div>
                         <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>KPIs Asignados</span>
                         <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{quick.asignados} <span style={{fontSize: '0.8rem', fontWeight: '400', color: '#94a3b8'}}>Activos</span></div>
                     </div>
                 </div>
             </div>

             <div style={cardStyle}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><i className='bx bx-trending-up' style={{ fontSize: '1.5rem' }}></i></div>
                     <div style={{ flex: 1 }}>
                         <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Último Cumplimiento</span>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{quick.lastCumpl != null ? `${quick.lastCumpl}%` : 'N/A'}</div>
                            {quick.lastCumpl != null && <PctBar value={quick.lastCumpl} />}
                         </div>
                         <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Periodo: {quick.lastPeriodoRes || "-"}</div>
                     </div>
                 </div>
             </div>

             <div style={cardStyle}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04' }}><i className='bx bx-star' style={{ fontSize: '1.5rem' }}></i></div>
                     <div>
                         <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Última Evaluación</span>
                         <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{quick.lastEval ?? 'N/A'} <span style={{fontSize: '0.8rem', fontWeight: '400', color: '#94a3b8'}}>Puntos</span></div>
                         <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Periodo: {quick.lastPeriodoEval || "-"}</div>
                     </div>
                 </div>
             </div>
        </div>

        {/* TABS & FILTERS */}
        <div style={{ ...cardStyle, padding: '15px 24px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                <button onClick={() => setTab("asignados")} style={tabBtnStyle(tab === "asignados")}>Asignados</button>
                <button onClick={() => { setTab("resultados"); cargarResultados(); }} style={tabBtnStyle(tab === "resultados")}>Resultados</button>
                <button onClick={() => { setTab("evaluaciones"); cargarEvaluaciones(); }} style={tabBtnStyle(tab === "evaluaciones")}>Evaluaciones</button>
                <button onClick={() => { setTab("evolucion"); cargarEvolucion(); }} style={tabBtnStyle(tab === "evolucion")}>Evolución</button>
                <button onClick={loadAll} style={{ ...tabBtnStyle(false), marginLeft: 'auto', color: '#0f172a' }}><i className='bx bx-refresh'></i></button>
            </div>

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
                <div>
                    <label style={filterLabelStyle}>Filtrar por KPI</label>
                    <select name="kpi_id" value={filtro.kpi_id} onChange={onFiltro} style={filterInputStyle}>
                        <option value="">(Todos los KPIs)</option>
                        {catalogoKpi.map((k) => (
                            <option key={k.id} value={k.id}>{k.codigo} - {k.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={filterLabelStyle}>Periodo Exacto</label>
                    <input name="periodo" value={filtro.periodo} onChange={onFiltro} placeholder="Ej: 2026-01" style={filterInputStyle} />
                </div>
                <div>
                    <label style={filterLabelStyle}>Desde</label>
                    <input name="desde" value={filtro.desde} onChange={onFiltro} placeholder="Ej: 2025-01" style={filterInputStyle} />
                </div>
                <div>
                    <label style={filterLabelStyle}>Hasta</label>
                    <input name="hasta" value={filtro.hasta} onChange={onFiltro} placeholder="Ej: 2026-12" style={filterInputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
                    <button 
                        onClick={() => {
                            if (tab === "resultados") cargarResultados();
                            if (tab === "evaluaciones") cargarEvaluaciones();
                            if (tab === "evolucion") cargarEvolucion();
                        }}
                        style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', height: '38px', flex: 1 }}
                    >
                        Filtrar
                    </button>
                    <button 
                        onClick={() => setFiltro({ kpi_id: "", desde: "", hasta: "", periodo: "" })}
                        style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', height: '38px' }}
                    >
                        Limpiar
                    </button>
                </div>
            </div>
        </div>

        {/* CONTENT AREA */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando datos...</p>}
        {err && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: '600' }}>{err}</div>}

        {!loading && (
            <div style={cardStyle}>
                
                {/* --- TAB: ASIGNADOS --- */}
                {tab === "asignados" && (
                    <>
                        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>KPIs Asignados Activos</h3>
                        {asignados.length === 0 ? <p style={{color: '#94a3b8'}}>No tienes plantillas KPI asignadas.</p> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Plantilla</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Vigencia</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Objetivos</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ajustes Pers.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asignados.map((a) => (
                                            <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>{a.plantilla_nombre}</td>
                                                <td style={{ padding: '15px', fontSize: '0.9rem', color: '#4b5563' }}>
                                                    {String(a.desde).slice(0, 10)} <i className='bx bx-right-arrow-alt'></i> {a.hasta ? String(a.hasta).slice(0, 10) : "Indefinido"}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#334155' }}>
                                                        {JSON.stringify(a.plantilla_objetivos, null, 2).slice(0, 50)}...
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                     <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                        {a.ajustes_personalizados && Object.keys(a.ajustes_personalizados).length > 0 ? "Sí (Personalizado)" : "Estándar"}
                                                     </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* --- TAB: RESULTADOS --- */}
                {tab === "resultados" && (
                    <>
                        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Historial de Resultados</h3>
                        {resultados.length === 0 ? <p style={{color: '#94a3b8'}}>No hay resultados para los filtros seleccionados.</p> : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Periodo</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>KPI</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Valor</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cumplimiento</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Clasificación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultados.map((r) => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '15px', fontWeight: '700', color: '#0f172a' }}>{r.periodo}</td>
                                                <td style={{ padding: '15px', fontSize: '0.9rem', color: '#334155' }}>
                                                    <div style={{fontWeight: '600'}}>{r.kpi_nombre}</div>
                                                    <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>{r.kpi_codigo}</div>
                                                </td>
                                                <td style={{ padding: '15px', fontWeight: '600' }}>{r.valor}</td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                        <span style={{ fontWeight: '700', fontSize: '0.9rem', width: '40px' }}>{r.cumplimiento_pct}%</span>
                                                        <PctBar value={r.cumplimiento_pct} />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{ 
                                                        backgroundColor: r.cumplimiento_pct >= 90 ? '#dcfce7' : r.cumplimiento_pct < 60 ? '#fee2e2' : '#fef3c7',
                                                        color: r.cumplimiento_pct >= 90 ? '#166534' : r.cumplimiento_pct < 60 ? '#991b1b' : '#854d0e',
                                                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                                                    }}>
                                                        {r.clasificacion}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* --- TAB: EVALUACIONES --- */}
                {tab === "evaluaciones" && (
                    <>
                        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Evaluaciones de Desempeño</h3>
                        {evaluaciones.length === 0 ? <p style={{color: '#94a3b8'}}>No hay evaluaciones registradas.</p> : (
                             <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Periodo</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Tipo</th>
                                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Puntaje</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Evaluador</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Comentarios</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {evaluaciones.map((e) => (
                                            <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '15px', fontWeight: '700', color: '#0f172a' }}>{e.periodo}</td>
                                                <td style={{ padding: '15px', fontSize: '0.9rem', color: '#475569' }}>{e.tipo}</td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <div style={{ 
                                                        width: '32px', height: '32px', borderRadius: '50%', 
                                                        background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: '700', color: '#0f172a'
                                                    }}>
                                                        {e.puntaje_total}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px', fontSize: '0.9rem' }}>{e.evaluador_id ? `${e.evaluador_nombres} ${e.evaluador_apellidos}` : "Autoevaluación/Sistema"}</td>
                                                <td style={{ padding: '15px', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>"{e.comentarios}"</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        )}
                    </>
                )}

                {/* --- TAB: EVOLUCIÓN --- */}
                {tab === "evolucion" && (
                    <>
                         <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Evolución Temporal</h3>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                             
                             {/* Tabla Gráfica KPI */}
                             <div>
                                 <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px', textTransform: 'uppercase' }}>Promedio Cumplimiento KPI</h4>
                                 {evolucion.kpi_avg?.length ? (
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                         {evolucion.kpi_avg.map((x) => (
                                             <div key={`k-${x.periodo}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                 <span style={{ width: '60px', fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{x.periodo}</span>
                                                 <div style={{ flex: 1 }}>
                                                     <PctBar value={x.avg_cumplimiento} />
                                                 </div>
                                                 <span style={{ width: '50px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>{Number(x.avg_cumplimiento).toFixed(1)}%</span>
                                             </div>
                                         ))}
                                     </div>
                                 ) : <p style={{color: '#94a3b8', fontStyle: 'italic'}}>Sin datos suficientes.</p>}
                             </div>

                             {/* Tabla Gráfica Evaluaciones */}
                             <div>
                                 <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px', textTransform: 'uppercase' }}>Promedio Puntaje Evaluación</h4>
                                 {evolucion.eval_avg?.length ? (
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                         {evolucion.eval_avg.map((x) => (
                                             <div key={`e-${x.periodo}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                 <span style={{ width: '60px', fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>{x.periodo}</span>
                                                 <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                     {/* Asumiendo puntaje sobre 10 o 100, ajustamos ancho */}
                                                     <div style={{ width: `${Math.min(x.avg_puntaje * 10, 100)}%`, height: '100%', backgroundColor: '#8b5cf6' }}></div>
                                                 </div>
                                                 <span style={{ width: '50px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>{Number(x.avg_puntaje).toFixed(1)}</span>
                                             </div>
                                         ))}
                                     </div>
                                 ) : <p style={{color: '#94a3b8', fontStyle: 'italic'}}>Sin datos suficientes.</p>}
                             </div>
                         </div>
                    </>
                )}

            </div>
        )}

      </main>
    </div>
  );
}