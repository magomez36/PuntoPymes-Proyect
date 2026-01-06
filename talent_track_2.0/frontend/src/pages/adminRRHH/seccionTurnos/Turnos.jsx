import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function Turnos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/turnos/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando turnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar turno? (esto también elimina contratos relacionados)")) return;
    try {
      const res = await apiFetch(`/api/rrhh/turnos/${id}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: está siendo usado en otros registros.");
        return;
      }

      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  const siNo = (b) => (b ? "Sí" : "No");

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Turnos</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/rrhh/turnos/crear")}>Crear Turno</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Hora inicio</th>
                <th>Hora fin</th>
                <th>Días semana</th>
                <th>Tolerancia (min)</th>
                <th>Requiere GPS</th>
                <th>Requiere Foto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.hora_inicio}</td>
                  <td>{r.hora_fin}</td>
                  {/* SIN JSON: usamos label que ya viene listo */}
                  <td>{r.dias_semana_label || "N/A"}</td>
                  <td>{r.tolerancia_minutos}</td>
                  <td>{siNo(r.requiere_gps)}</td>
                  <td>{siNo(r.requiere_foto)}</td>
                  <td>
                    <button onClick={() => navigate(`/rrhh/turnos/editar/${r.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="8">No hay turnos registrados.</td>
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
