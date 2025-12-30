import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");
}

export default function KPIsEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await apiFetch(`${API}/kpis/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar KPIs");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este KPI?")) return;
    try {
      const res = await apiFetch(`${API}/kpis/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      await fetchData();
    } catch (e) {
      alert(e.message || "Error al eliminar");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>KPIs por Empresa (SuperAdmin)</h2>

      <button onClick={() => navigate("/admin/kpis/crear")}>+ Crear KPI</button>
      <div style={{ marginTop: 12 }}>
        <button onClick={fetchData}>Recargar</button>
      </div>

      {loading && <p>Cargando...</p>}
      {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

      {!loading && !errorMsg && (
        <table border="1" cellPadding="8" style={{ marginTop: 12, width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Empresa</th>
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
                <td>{r.empresa_nombre || "N/A"}</td>
                <td>{r.descripcion}</td>
                <td>{r.unidad_txt || r.unidad}</td>
                <td>{r.origen_datos_txt || r.origen_datos}</td>
                <td>
                  <button onClick={() => navigate(`/admin/kpis/editar/${r.id}`)}>Editar</button>{" "}
                  <button onClick={() => handleDelete(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="7">No hay registros.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
