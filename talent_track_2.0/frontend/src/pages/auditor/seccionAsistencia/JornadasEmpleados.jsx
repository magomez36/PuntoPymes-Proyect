import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { useNavigate } from "react-router-dom";

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function JornadasEmpleados() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (f = "") => {
    setErr("");
    setLoading(true);
    try {
      const qs = f ? `?fecha=${encodeURIComponent(f)}` : "";
      const res = await apiFetch(`/api/auditor/asistencia/jornadas/${qs}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas calculadas.");
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
        <h2>Auditoría — Jornadas Calculadas</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/auditor/asistencia/eventos")}>Ver eventos</button>
          <button onClick={() => navigate("/auditor/asistencia/turnos-empleados")}>Ver turnos</button>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <label>Filtrar por fecha:</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
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
                <th>Fecha</th>
                <th>Primera entrada</th>
                <th>Última salida</th>
                <th>Min. trabajados</th>
                <th>Min. tardanza</th>
                <th>Min. extra</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{fmtDate(r.fecha)}</td>
                  <td>{fmtDT(r.hora_primera_entrada)}</td>
                  <td>{fmtDT(r.hora_ultimo_salida)}</td>
                  <td>{r.minutos_trabajados}</td>
                  <td>{r.minutos_tardanza}</td>
                  <td>{r.minutos_extra}</td>
                  <td>{r.estado_label}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="10">No hay jornadas para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
