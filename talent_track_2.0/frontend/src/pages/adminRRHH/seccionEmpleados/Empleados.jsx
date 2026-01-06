import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const ESTADO = { 1: "activo", 2: "suspendido", 3: "baja" };

function fmtDate(iso) {
  if (!iso) return "N/A";
  // evita desfases de zona horaria
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
}

export default function Empleados() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/empleados/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando empleados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar empleado? (esto también elimina el contrato relacionado)")) return;
    try {
      const res = await apiFetch(`/api/rrhh/empleados/${id}/`, { method: "DELETE" });

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

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Empleados</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/rrhh/empleados/crear")}>Crear Empleado</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Unidad Organizacional</th>
                <th>Manager</th>
                <th>Puesto</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha Nacimiento</th>
                <th>Fecha Ingreso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.unidad_nombre || "N/A"}</td>
                  <td>{r.manager_nombre || "N/A"}</td>
                  <td>{r.puesto_nombre || "N/A"}</td>
                  <td>{r.email}</td>
                  <td>{r.telefono}</td>
                  <td>{r.direccion || "N/A"}</td>
                  <td>{fmtDate(r.fecha_nacimiento)}</td>
                  <td>{fmtDate(r.fecha_ingreso)}</td>
                  <td>{ESTADO[r.estado] || r.estado_label || "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/rrhh/empleados/editar/${r.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="12">No hay empleados registrados.</td>
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
