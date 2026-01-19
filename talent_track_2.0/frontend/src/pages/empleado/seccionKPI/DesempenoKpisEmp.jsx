import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";

async function safeJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; }
  catch { return { _non_json: true, raw: text }; }
}

function pctBar(value) {
  const v = Number(value || 0);
  const w = Math.max(0, Math.min(100, v));
  return (
    <div style={{ background: "#eee", borderRadius: 8, overflow: "hidden", height: 10, width: 160 }}>
      <div style={{ width: `${w}%`, height: 10, background: "#3b82f6" }} />
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

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>KPIs y Desempeño</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <button onClick={() => setTab("asignados")} disabled={tab === "asignados"}>KPIs asignados</button>
          <button onClick={() => { setTab("resultados"); cargarResultados(); }} disabled={tab === "resultados"}>Resultados históricos</button>
          <button onClick={() => { setTab("evaluaciones"); cargarEvaluaciones(); }} disabled={tab === "evaluaciones"}>Evaluaciones</button>
          <button onClick={() => { setTab("evolucion"); cargarEvolucion(); }} disabled={tab === "evolucion"}>Evolución</button>
          <button onClick={loadAll}>Refrescar</button>
        </div>

        {/* filtros */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 12 }}>
          <strong>Filtros</strong>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <div>
              <label>KPI</label><br />
              <select name="kpi_id" value={filtro.kpi_id} onChange={onFiltro}>
                <option value="">(Todos)</option>
                {catalogoKpi.map((k) => (
                  <option key={k.id} value={k.id}>{k.codigo} - {k.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Periodo exacto</label><br />
              <input name="periodo" value={filtro.periodo} onChange={onFiltro} placeholder="Ej: 2026-01" />
            </div>

            <div>
              <label>Desde (periodo)</label><br />
              <input name="desde" value={filtro.desde} onChange={onFiltro} placeholder="Ej: 2025-01" />
            </div>

            <div>
              <label>Hasta (periodo)</label><br />
              <input name="hasta" value={filtro.hasta} onChange={onFiltro} placeholder="Ej: 2026-12" />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
              <button onClick={() => {
                if (tab === "resultados") cargarResultados();
                if (tab === "evaluaciones") cargarEvaluaciones();
                if (tab === "evolucion") cargarEvolucion();
              }}>
                Aplicar
              </button>
              <button onClick={() => setFiltro({ kpi_id: "", desde: "", hasta: "", periodo: "" })}>
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* quick stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10, minWidth: 220 }}>
            <div><strong>Asignaciones</strong></div>
            <div>{quick.asignados} activas</div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10, minWidth: 220 }}>
            <div><strong>Último KPI</strong></div>
            <div>Periodo: {quick.lastPeriodoRes || "—"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>{quick.lastCumpl ?? "—"}%</span>
              {quick.lastCumpl != null ? pctBar(quick.lastCumpl) : null}
            </div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10, minWidth: 220 }}>
            <div><strong>Última evaluación</strong></div>
            <div>Periodo: {quick.lastPeriodoEval || "—"}</div>
            <div>Puntaje: {quick.lastEval ?? "—"}</div>
          </div>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && tab === "asignados" && (
          <div>
            <h3>KPIs asignados</h3>
            {asignados.length === 0 ? <p>No tienes plantillas KPI asignadas.</p> : (
              <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Plantilla</th>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Objetivos (JSON)</th>
                    <th>Ajustes (JSON)</th>
                  </tr>
                </thead>
                <tbody>
                  {asignados.map((a) => (
                    <tr key={a.id}>
                      <td>{a.plantilla_nombre}</td>
                      <td>{String(a.desde).slice(0, 10)}</td>
                      <td>{a.hasta ? String(a.hasta).slice(0, 10) : "—"}</td>
                      <td><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(a.plantilla_objetivos, null, 2)}</pre></td>
                      <td><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(a.ajustes_personalizados, null, 2)}</pre></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && tab === "resultados" && (
          <div>
            <h3>Resultados históricos</h3>
            {resultados.length === 0 ? <p>No hay resultados aún para los filtros.</p> : (
              <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>KPI</th>
                    <th>Valor</th>
                    <th>Cumplimiento %</th>
                    <th>Clasificación</th>
                    <th>Calculado</th>
                    <th>Fuente</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r) => (
                    <tr key={r.id}>
                      <td>{r.periodo}</td>
                      <td>{r.kpi_codigo} - {r.kpi_nombre}</td>
                      <td>{r.valor}</td>
                      <td style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span>{r.cumplimiento_pct}%</span>
                        {pctBar(r.cumplimiento_pct)}
                      </td>
                      <td>{r.clasificacion}</td>
                      <td>{String(r.calculado_el).replace("T", " ").slice(0, 19)}</td>
                      <td>{r.fuente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && tab === "evaluaciones" && (
          <div>
            <h3>Evaluaciones recibidas</h3>
            {evaluaciones.length === 0 ? <p>No hay evaluaciones aún para los filtros.</p> : (
              <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Tipo</th>
                    <th>Puntaje</th>
                    <th>Evaluador</th>
                    <th>Fecha</th>
                    <th>Comentarios</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluaciones.map((e) => (
                    <tr key={e.id}>
                      <td>{e.periodo}</td>
                      <td>{e.tipo}</td>
                      <td>{e.puntaje_total}</td>
                      <td>{e.evaluador_id ? `${e.evaluador_nombres} ${e.evaluador_apellidos}` : "—"}</td>
                      <td>{String(e.fecha).replace("T", " ").slice(0, 19)}</td>
                      <td>{e.comentarios}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && tab === "evolucion" && (
          <div>
            <h3>Evolución por periodo</h3>

            <h4>Cumplimiento KPI promedio</h4>
            {evolucion.kpi_avg?.length ? (
              <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%", marginBottom: 14 }}>
                <thead>
                  <tr><th>Periodo</th><th>Promedio %</th><th>Barra</th></tr>
                </thead>
                <tbody>
                  {evolucion.kpi_avg.map((x) => (
                    <tr key={`k-${x.periodo}`}>
                      <td>{x.periodo}</td>
                      <td>{(x.avg_cumplimiento ?? 0).toFixed(2)}%</td>
                      <td>{pctBar(x.avg_cumplimiento)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Sin datos KPI agregados.</p>}

            <h4>Puntaje de evaluación promedio</h4>
            {evolucion.eval_avg?.length ? (
              <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr><th>Periodo</th><th>Promedio puntaje</th></tr>
                </thead>
                <tbody>
                  {evolucion.eval_avg.map((x) => (
                    <tr key={`e-${x.periodo}`}>
                      <td>{x.periodo}</td>
                      <td>{(x.avg_puntaje ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Sin datos de evaluaciones agregadas.</p>}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/empleado/inicio">Volver</Link>
        </div>
      </main>
    </div>
  );
}
