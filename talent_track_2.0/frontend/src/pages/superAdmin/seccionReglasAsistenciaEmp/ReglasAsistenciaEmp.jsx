import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  return (
    localStorage.getItem("tt_access") ||
    sessionStorage.getItem("tt_access") ||
    ""
  );
}

export default function ReglasAsistenciaEmp() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reglas-asistencia/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar reglas");
      const data = await res.json();
      setRows(data);
    } catch (e) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar regla?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/reglas-asistencia/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      await load();
    } catch (e) {
      alert(e.message || "Error eliminando");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Reglas de Asistencia</h2>

      <button onClick={() => navigate("/admin/reglas-asistencia/crear")}>
        Crear Regla
      </button>

      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <table border="1" cellPadding="8" style={{ marginTop: 12, width: "100%" }}>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>considera_tardanza_desde_min</th>
              <th>calculo_horas_extra</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.empresa_razon_social}</td>
                <td>{r.considera_tardanza_desde_min}</td>
                <td>{r.calculo_horas_extra_nombre}</td>
                <td>
                  <button onClick={() => navigate(`/admin/reglas-asistencia/editar/${r.id}`)}>
                    Editar
                  </button>{" "}
                  <button onClick={() => onDelete(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4">Sin registros</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
