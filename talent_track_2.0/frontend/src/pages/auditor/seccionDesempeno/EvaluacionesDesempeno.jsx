import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function EvaluacionesDesempeno() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/desempeno/evaluaciones/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando evaluaciones.");
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
        <h2>Auditoría — Evaluaciones de Desempeño</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/desempeno/asignaciones-kpi")}>
            Volver a asignaciones
          </button>
          <button onClick={() => navigate("/auditor/desempeno/resultados-kpi")}>
            Ver resultados KPI
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
                <th>Evaluador</th>
                <th>Periodo</th>
                <th>Tipo</th>
                <th>Instrumento (resumen)</th>
                <th>Puntaje total</th>
                <th>Comentarios</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{r.evaluador_nombre}</td>
                  <td>{r.periodo}</td>
                  <td>{r.tipo_label}</td>
                  <td style={{ maxWidth: 420 }}>
                    {Array.isArray(r.instrumento_items) && r.instrumento_items.length ? (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {r.instrumento_items.map((it, idx) => (
                          <li key={idx}>
                            {it.competencia} — peso: {it.peso}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{r.puntaje_total}</td>
                  <td style={{ maxWidth: 260 }}>{r.comentarios || "N/A"}</td>
                  <td>{fmtDT(r.fecha)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="10">No hay evaluaciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
