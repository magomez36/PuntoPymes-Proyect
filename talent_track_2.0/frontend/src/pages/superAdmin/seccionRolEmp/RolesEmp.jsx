import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function RolesEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/roles-empresa/");
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar rol?")) return;
    try {
      const res = await apiFetch(`/api/roles-empresa/${id}/`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }
      load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Roles por Empresa</h2>

        <button onClick={() => navigate("/admin/roles/crear")}>Crear Rol</button>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Rol</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.empresa_razon_social || "N/A"}</td>
                  <td>{r.nombre_texto || "N/A"}</td>
                  <td>{r.descripcion || ""}</td>
                  <td>
                    <Link to={`/admin/roles/editar/${r.id}`}>Editar</Link>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
