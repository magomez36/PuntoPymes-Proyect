import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function UnidadesOrg() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando unidades organizacionales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar unidad organizacional?")) return;
    try {
      const res = await apiFetch(`/api/rrhh/unidades-organizacionales/${id}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: está siendo usada en otros registros.");
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
        <h2>Unidades Organizacionales</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/rrhh/unidades-organizacionales/crear")}>
            Crear Unidad Organizacional
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Unidad Organizacional</th>
                <th>Unidad Organizacional Padre</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre || "N/A"}</td>
                  <td>{r.unidad_padre_nombre || "N/A"}</td>
                  <td>{r.tipo_label || "N/A"}</td>
                  <td>{r.ubicacion || "N/A"}</td>
                  <td>{r.estado_label || "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/rrhh/unidades-organizacionales/editar/${r.id}`)}>
                      Editar
                    </button>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6">No hay unidades organizacionales registradas.</td>
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
