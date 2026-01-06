import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const ESTADOS = {
  1: "activo",
  2: "suspendido",
  3: "baja",
};

export default function EmpleadosMi_Equipo() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/manager/mi-equipo/empleados/");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "No se pudo cargar empleados.");
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

  const cambiarEstado = async (empId, actual) => {
    const val = window.prompt(
      `Nuevo estado (1=activo, 2=suspendido, 3=baja). Actual: ${actual} (${ESTADOS[actual] || "N/A"})`,
      String(actual || 1)
    );
    if (val === null) return;

    const estado = Number(val);
    if (![1, 2, 3].includes(estado)) {
      alert("Estado inválido. Use 1, 2 o 3.");
      return;
    }

    try {
      const res = await apiFetch(`/api/manager/mi-equipo/empleados/${empId}/estado/`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));
      await load();
      alert(`Estado actualizado a: ${out.estado_label}`);
    } catch (e) {
      alert(e?.message || "Error cambiando estado.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Mi Equipo - Empleados</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Unidad Organizacional</th>
                <th>Puesto</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.unidad_organizacional || "N/A"}</td>
                  <td>{r.puesto || "N/A"}</td>
                  <td>{r.email}</td>
                  <td>{r.direccion || "N/A"}</td>
                  <td>{r.estado_label || ESTADOS[r.estado] || "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/manager/mi-equipo/empleados/${r.id}`)}>Detalle</button>{" "}
                    <button onClick={() => navigate(`/manager/mi-equipo/empleados/${r.id}/jornadas`)}>Jornadas</button>{" "}
                    <button onClick={() => cambiarEstado(r.id, r.estado)}>Cambiar estado</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="8">No tienes empleados asignados a tu equipo.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/manager/inicio">Volver</Link>
        </div>
      </main>
    </div>
  );
}
