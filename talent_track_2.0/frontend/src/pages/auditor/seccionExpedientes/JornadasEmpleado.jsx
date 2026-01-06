import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

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

export default function JornadasEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleado, setEmpleado] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/expedientes/empleados/${id}/jornadas/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));

      setEmpleado(d?.empleado || null);
      setRows(Array.isArray(d?.results) ? d.results : []);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas.");
      setEmpleado(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Jornadas calculadas</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate(`/auditor/expedientes/empleados/${id}`)}>Volver al detalle</button>
          <button onClick={() => navigate(`/auditor/expedientes/empleados/${id}/contrato`)}>Ver contrato</button>
        </div>

        {empleado && (
          <div style={{ marginBottom: 10, opacity: 0.9 }}>
            <strong>Empleado:</strong>{" "}
            {empleado.nombres} {empleado.apellidos} — {empleado.email}
            <div style={{ marginTop: 6 }}>
              <h3 style={{ marginBottom: 4 }}>Descripción</h3>
              <p style={{ marginTop: 0 }}>
                En esta sección se visualizan las jornadas calculadas del empleado, incluyendo horas trabajadas,
                tardanzas y minutos extra, según los eventos de asistencia registrados.
              </p>
            </div>
          </div>
        )}

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
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
                  <td colSpan="7">No hay jornadas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
