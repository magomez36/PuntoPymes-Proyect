import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API_BASE = "http://127.0.0.1:8000";

export default function PuestosEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const access =
    localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await apiFetch(`${API_BASE}/api/listado-puestos/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar puestos.");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e.message || "Error cargando.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este puesto?")) return;

    try {
      const res = await apiFetch(`${API_BASE}/api/puestos/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert(e.message || "Error eliminando.");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Puestos</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/admin/puestos/crear")}>
          + Crear Puesto
        </button>
        <span style={{ marginLeft: 12 }}>
          <Link to="/superadmin/inicio">← Volver al inicio</Link>
        </span>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: 12, color: "crimson" }}>{errorMsg}</div>
      )}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Unidad Organizacional</th>
            <th>Empresa</th>
            <th>Descripción</th>
            <th>Nivel</th>
            <th>Salario referencial</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.nombre}</td>
              <td>{r.unidad_nombre || "N/A"}</td>
              <td>{r.empresa_razon_social || "N/A"}</td>
              <td>{r.descripcion || ""}</td>
              <td>{r.nivel ?? ""}</td>
              <td>{r.salario_referencial ?? ""}</td>
              <td>
                <button onClick={() => navigate(`/admin/puestos/editar/${r.id}`)}>
                  Editar
                </button>{" "}
                <button onClick={() => eliminar(r.id)}>Eliminar</button>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No hay puestos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
