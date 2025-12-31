import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function EmpleadosEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/empleados-empresa/");
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
    if (!window.confirm("¿Eliminar empleado?")) return;
    try {
      const res = await apiFetch(`/api/empleados-empresa/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  const toggleEstado = async (id) => {
    try {
      const res = await apiFetch(`/api/empleados-empresa/${id}/toggle-estado/`, { method: "PATCH" });
      if (!res.ok) throw new Error("No se pudo cambiar estado.");
      await load();
    } catch (e) {
      alert(e?.message || "Error cambiando estado.");
    }
  };

  const estadoLabel = (v) => {
    if (v === 1) return "activo";
    if (v === 2) return "suspendido";
    if (v === 3) return "baja";
    return "N/A";
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Empleados por Empresa</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/admin/empleados/crear")}>Crear Empleado</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Empresa</th>
                <th>Unidad</th>
                <th>Manager</th>
                <th>Puesto</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha nacimiento</th>
                <th>Fecha ingreso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombres}</td>
                  <td>{e.apellidos}</td>
                  <td>{e.empresa_razon_social || "N/A"}</td>
                  <td>{e.unidad_nombre || "N/A"}</td>
                  <td>{e.manager_nombre || "N/A"}</td>
                  <td>{e.puesto_nombre || "N/A"}</td>
                  <td>{e.email}</td>
                  <td>{e.telefono}</td>
                  <td style={{ maxWidth: 220, wordBreak: "break-word" }}>{e.direccion}</td>
                  <td>{e.fecha_nacimiento ? String(e.fecha_nacimiento) : "N/A"}</td>
                  <td>{e.fecha_ingreso ? String(e.fecha_ingreso) : "N/A"}</td>
                  <td>{estadoLabel(e.estado)}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/empleados/editar/${e.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(e.id)}>Eliminar</button>{" "}
                    <button onClick={() => toggleEstado(e.id)}>Cambiar estado</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="13">No hay empleados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/superadmin/inicio">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
