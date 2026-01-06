import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { useNavigate } from "react-router-dom";

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function AsistenciasEmpleados() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(""); // YYYY-MM-DD
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (f = "") => {
    setErr("");
    setLoading(true);
    try {
      const qs = f ? `?fecha=${encodeURIComponent(f)}` : "";
      const res = await apiFetch(`/api/auditor/asistencia/eventos/${qs}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando eventos de asistencia.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Auditoría — Eventos de Asistencia</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/auditor/asistencia/jornadas")}>Ver jornadas</button>
          <button onClick={() => navigate("/auditor/asistencia/turnos-empleados")}>Ver turnos</button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <label>Filtrar por fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <button onClick={() => load(fecha)}>Aplicar</button>
            <button
              onClick={() => {
                setFecha("");
                load("");
              }}
            >
              Limpiar
            </button>
          </div>
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
                <th>Tipo</th>
                <th>Registrado</th>
                <th>Fuente</th>
                <th>IP</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} title="Detalle incluido en la fila (HU02)">
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{r.tipo_label}</td>
                  <td>{fmtDT(r.registrado_el)}</td>
                  <td>{r.fuente_label}</td>
                  <td>{r.ip || "N/A"}</td>
                  <td>{r.observaciones || "N/A"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="8">No hay eventos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
