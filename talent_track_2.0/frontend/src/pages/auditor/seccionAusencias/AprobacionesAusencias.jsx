import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AprobacionesAusencias() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/ausencias/aprobaciones/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando aprobaciones.");
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
        <h2>Auditoría — Aprobaciones de Ausencias</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/ausencias/solicitudes")}>
            Volver a solicitudes
          </button>
          <button onClick={() => navigate("/auditor/ausencias/saldos-vacaciones")}>
            Ver saldos vacaciones
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
                <th>Tipo ausencia</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Días hábiles</th>
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
                  <td style={{ maxWidth: 220 }}>{r.motivo || "N/A"}</td>
                  <td>{r.aprobador_nombre}</td>
                  <td>{r.accion_label}</td>
                  <td style={{ maxWidth: 220 }}>{r.comentario || "N/A"}</td>
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
