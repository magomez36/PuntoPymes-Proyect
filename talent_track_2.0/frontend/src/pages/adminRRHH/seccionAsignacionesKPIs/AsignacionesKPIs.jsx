import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function AsignacionesKPIs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/kpi/asignaciones/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "No se pudo cargar asignaciones.");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando asignaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    const ok = window.confirm("¿Eliminar esta asignación KPI?");
    if (!ok) return;

    try {
      const res = await apiFetch(`/api/rrhh/kpi/asignaciones/${id}/`, { method: "DELETE" });
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        throw new Error(out?.detail || "No se pudo eliminar.");
      }
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Asignaciones de KPIs</h2>

        <div style={{ marginBottom: 12 }}>
          <Link to="/rrhh/kpi/asignaciones/crear">
            <button>Crear Asignación KPI</button>
          </Link>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && !err && (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Plantilla KPI</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="7">No hay asignaciones registradas.</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.empleado_nombres}</td>
                    <td>{r.empleado_apellidos}</td>
                    <td>{r.empleado_email}</td>
                    <td>{r.plantilla_nombre}</td>
                    <td>{fmtDate(r.desde)}</td>
                    <td>{r.hasta ? fmtDate(r.hasta) : "Sin fecha límite"}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <Link to={`/rrhh/kpi/asignaciones/${r.id}/editar`}>
                        <button>Editar</button>
                      </Link>
                      <button onClick={() => eliminar(r.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
