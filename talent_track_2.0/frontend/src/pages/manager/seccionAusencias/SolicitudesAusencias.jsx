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

export default function SolicitudesAusencias() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/manager/ausencias/solicitudes/");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setRows([]);
      setErr(e?.message || "Error cargando solicitudes.");
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
        <h2>Solicitudes de Ausencia Pendientes (Mi equipo)</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <Link to="/manager/ausencias/aprobaciones">Ver historial de aprobaciones</Link>
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
                <th>Estado</th>
                <th>Creada</th>
                <th>Acciones</th>
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
                  <td>{r.estado_label || r.estado}</td>
                  <td>{fmtDT(r.creada_el)}</td>
                  <td>
                    <Link to={`/manager/ausencias/solicitudes/${r.id}`}>Ver solicitud</Link>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="10">No existen solicitudes pendientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
