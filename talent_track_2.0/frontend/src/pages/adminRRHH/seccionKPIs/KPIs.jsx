import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const UNIDAD = { 1: "%", 2: "puntos", 3: "minutos", 4: "horas" };
const ORIGEN = { 1: "asistencia", 2: "evaluacion", 3: "mixto" };

export default function KPIs() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/kpis/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando KPIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar KPI?")) return;
    try {
      const res = await apiFetch(`/api/rrhh/kpis/${id}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: está siendo usado.");
        return;
      }

      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>KPIs</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/rrhh/kpis/crear")}>Crear KPI</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Origen datos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.codigo}</td>
                  <td>{r.nombre}</td>
                  <td>{r.descripcion}</td>
                  <td>{UNIDAD[r.unidad] || r.unidad_label || "N/A"}</td>
                  <td>{ORIGEN[r.origen_datos] || r.origen_datos_label || "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/rrhh/kpis/editar/${r.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6">No hay KPIs registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/rrhh/inicio">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
