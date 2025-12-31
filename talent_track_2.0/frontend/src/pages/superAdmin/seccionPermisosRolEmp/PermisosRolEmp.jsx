import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function PermisosRolEmp() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadEmpresas = async () => {
    const res = await apiFetch("/api/listado-empresas/");
    const data = await res.json();
    setEmpresas(Array.isArray(data) ? data : []);
  };

  const loadPermisos = async (eid) => {
    setErr("");
    setLoading(true);
    try {
      if (!eid) {
        setRows([]);
        return;
      }
      const res = await apiFetch(`/api/permisos-por-empresa/?empresa_id=${eid}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadEmpresas();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    loadPermisos(empresaId);
  }, [empresaId]);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar permiso?")) return;
    try {
      const res = await apiFetch(`/api/permisos/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await loadPermisos(empresaId);
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Permisos por Rol (Empresa)</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div>
            <label>Empresa: </label>{" "}
            <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
              <option value="">-- Selecciona --</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.razon_social}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => navigate("/admin/permisos/crear")} disabled={!empresaId}>
            Crear Permiso
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && empresaId && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo}</td>
                  <td style={{ maxWidth: 300, wordBreak: "break-word" }}>{p.descripcion || "N/A"}</td>
                  <td>{p.rol_nombre || "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/permisos/editar/${p.id}?empresa_id=${empresaId}`)}>
                      Editar
                    </button>{" "}
                    <button onClick={() => eliminar(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="4">No hay permisos para esta empresa.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!empresaId && !loading && <p>Selecciona una empresa para listar sus permisos.</p>}

        <div style={{ marginTop: 12 }}>
          <Link to="/superadmin/inicio">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
