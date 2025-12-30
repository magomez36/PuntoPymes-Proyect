import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");
}

export default function TiposAusenciasEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/tipos-ausencias/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar Tipos de Ausencias");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este tipo de ausencia?")) return;
    try {
      const res = await fetch(`${API}/tipos-ausencias/${id}/`, {
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
      <h2>Tipos de Ausencias (SuperAdmin)</h2>

      <button onClick={() => navigate("/admin/tipos-ausencias/crear")}>
        + Crear Tipo de Ausencia
      </button>

      <div style={{ marginTop: 12 }}>
        <button onClick={fetchData}>Recargar</button>
      </div>

      {loading && <p>Cargando...</p>}
      {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

      {!loading && !errorMsg && (
        <table border="1" cellPadding="8" style={{ marginTop: 12, width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Empresa</th>
              <th>Afecta sueldo</th>
              <th>Requiere soporte</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td>{r.empresa_nombre || "N/A"}</td>
                <td>{r.afecta_sueldo_txt ?? (r.afecta_sueldo ? "Si" : "No")}</td>
                <td>{r.requiere_soporte_txt ?? (r.requiere_soporte ? "Si" : "No")}</td>
                <td>
                  <button onClick={() => navigate(`/admin/tipos-ausencias/editar/${r.id}`)}>
                    Editar
                  </button>{" "}
                  <button onClick={() => handleDelete(r.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5">No hay registros.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
