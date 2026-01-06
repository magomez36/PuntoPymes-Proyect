import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function ResultadosKPI() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/desempeno/resultados-kpi/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando resultados KPI.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Auditoría — Resultados KPI</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/desempeno/asignaciones-kpi")}>
            Volver a asignaciones
          </button>
          <button onClick={() => navigate("/auditor/desempeno/evaluaciones")}>
            Ver evaluaciones
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>KPI Código</th>
                <th>KPI Nombre</th>
                <th>Periodo</th>
                <th>Valor</th>
                <th>Cumplimiento %</th>
                <th>Clasificación</th>
                <th>Calculado</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{r.kpi_codigo}</td>
                  <td>{r.kpi_nombre}</td>
                  <td>{r.periodo}</td>
                  <td>{r.valor}</td>
                  <td>{r.cumplimiento_pct}</td>
                  <td>{r.clasificacion_label}</td>
                  <td>{fmtDT(r.calculado_el)}</td>
                  <td>{r.fuente}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="11">No hay resultados registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
