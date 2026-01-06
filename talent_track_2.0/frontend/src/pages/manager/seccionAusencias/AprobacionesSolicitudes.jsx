import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function AprobacionesSolicitudes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/manager/ausencias/aprobaciones/");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setRows([]);
      setErr(e?.message || "Error cargando aprobaciones.");
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
        <h2>Historial de aprobaciones (Mi actividad)</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <Link to="/manager/ausencias/solicitudes">Volver a solicitudes</Link>
          <Link to="/manager/inicio">Volver al inicio</Link>
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
                <th>Tipo Ausencia</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Días</th>
                <th>Motivo</th>
                <th>Aprobador</th>
                <th>Acción</th>
                <th>Comentario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{r.tipo_ausencia}</td>
                  <td>{fmtDate(r.fecha_inicio)}</td>
                  <td>{fmtDate(r.fecha_fin)}</td>
                  <td>{r.dias_habiles}</td>
                  <td>{(r.motivo || "").slice(0, 60) || "N/A"}</td>
                  <td>{r.aprobador}</td>
                  <td>{r.accion_label || r.accion}</td>
                  <td>{r.comentario || "—"}</td>
                  <td>{fmtDT(r.fecha)}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="12">No hay aprobaciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
