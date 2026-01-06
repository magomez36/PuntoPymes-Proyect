import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function TurnosEmpleados() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/asistencia/turnos-empleados/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando turnos por empleado.");
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
        <h2>Auditoría — Turnos por Empleado</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/asistencia/eventos")}>Ver eventos</button>
          <button onClick={() => navigate("/auditor/asistencia/jornadas")}>Ver jornadas</button>
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
                <th>Hora inicio</th>
                <th>Hora fin</th>
                <th>Turno</th>
                <th>Días semana</th>
                <th>Rotativo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{r.hora_inicio}</td>
                  <td>{r.hora_fin}</td>
                  <td>{r.turno_nombre}</td>
                  <td>{r.dias_semana_label}</td>
                  <td>{r.es_rotativo_label}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="8">No hay asignaciones de turnos.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
