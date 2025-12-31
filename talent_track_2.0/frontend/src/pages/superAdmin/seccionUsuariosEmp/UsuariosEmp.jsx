import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function UsuariosEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/usuarios-empresa/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar usuario? (también se eliminará auth_user_tt)")) return;
    try {
      const res = await apiFetch(`/api/usuarios-empresa/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  const toggleEstado = async (id) => {
    try {
      const res = await apiFetch(`/api/usuarios-empresa/${id}/toggle-estado/`, { method: "PATCH" });
      if (!res.ok) throw new Error("No se pudo cambiar estado.");
      await load();
    } catch (e) {
      alert(e?.message || "Error cambiando estado.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Usuarios por Empresa</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/admin/usuarios/crear")}>Crear Usuario</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Rol</th>
                <th>Empresa</th>
                <th>Phone</th>
                <th>MFA</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.empleado_nombres || "N/A"}</td>
                  <td>{u.empleado_apellidos || "N/A"}</td>
                  <td>{u.rol_nombre || "N/A"}</td>
                  <td>{u.empresa_razon_social || "N/A"}</td>
                  <td>{u.phone || "N/A"}</td>
                  <td>{u.mfa_habilitado ? "Si" : "No"}</td>
                  <td>{u.estado === 1 ? "activo" : u.estado === 2 ? "bloqueado" : "N/A"}</td>
                  <td>{u.ultimo_acceso ? String(u.ultimo_acceso) : "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/usuarios/editar/${u.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(u.id)}>Eliminar</button>{" "}
                    <button onClick={() => toggleEstado(u.id)}>Cambiar estado</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="10">No hay usuarios.</td>
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
