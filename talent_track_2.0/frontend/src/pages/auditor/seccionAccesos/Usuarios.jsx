import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [resU, resR] = await Promise.all([
        apiFetch("/api/auditor/accesos/usuarios/"),
        apiFetch("/api/auditor/accesos/roles/"),
      ]);

      const dataU = await resU.json().catch(() => ({}));
      const dataR = await resR.json().catch(() => ({}));

      if (!resU.ok) throw new Error(dataU?.detail || JSON.stringify(dataU));
      if (!resR.ok) throw new Error(dataR?.detail || JSON.stringify(dataR));

      setUsuarios(Array.isArray(dataU?.results) ? dataU.results : []);
      setRoles(Array.isArray(dataR?.results) ? dataR.results : []);
    } catch (e) {
      setErr(e?.message || "Error cargando accesos.");
      setUsuarios([]);
      setRoles([]);
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
        <h2>Accesos — Usuarios (Auditor)</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/accesos/permisos")}>
            Ver Permisos
          </button>
          <Link to="/auditor/inicio">Volver al inicio</Link>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <>
            <h3>Usuarios de la empresa</h3>
            <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Empleado</th>
                  <th>Empresa</th>
                  <th>Rol asignado</th>
                  <th>Phone</th>
                  <th>MFA</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.empleado}</td>
                    <td>{u.empresa}</td>
                    <td>{u.roles_asignados}</td>
                    <td>{u.phone || "N/A"}</td>
                    <td>{u.mfa_habilitado_label}</td>
                    <td>{u.estado_label}</td>
                    <td>{fmtDT(u.ultimo_acceso)}</td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan="8">No existen usuarios registrados para esta empresa.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: 18 }}>
              <h3>Roles definidos (catálogo)</h3>
              <table border="1" cellPadding="6" style={{ width: "60%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td>{r.nombre}</td>
                      <td>{r.descripcion || "N/A"}</td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr>
                      <td colSpan="2">No existen roles registrados para esta empresa.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
