import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";
import "../../../assets/css/manager-table.css";

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
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SidebarManager />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '80px', padding: '32px' }}>
        <div className="manager-table-title-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <span className="manager-table-title" style={{ marginBottom: 0 }}>Mi Equipo - Empleados</span>
          <p style={{ margin: '0 0 0 24px', color: '#64748b', fontSize: '1.05rem' }}>Gestione los perfiles, asistencia y estados de los colaboradores a su cargo.</p>
        </div>
        <div className="manager-table-container">
          {loading && <p>Cargando...</p>}
          {err && <p style={{ color: "crimson" }}>{err}</p>}
          {!loading && (
            <table className="manager-table">
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
                    <td>
                      <span className="email-cell">{r.email}</span>
                    </td>
                    <td>{r.direccion || "N/A"}</td>
                    <td>
                      <span className={
                        "estado-badge " + (
                          r.estado_label === "activo"
                            ? "estado-activo"
                            : r.estado_label === "suspendido"
                              ? "estado-suspendido"
                              : r.estado_label === "baja"
                                ? "estado-baja"
                                : ""
                        )
                      }>
                        {r.estado_label ? r.estado_label.toUpperCase() : (ESTADOS[r.estado] || "N/A").toUpperCase()}
                      </span>
                    </td>
                    <td className="manager-table-actions">
                      <button className="manager-action-btn manager-action-view" title="Detalle" onClick={() => navigate(`/manager/mi-equipo/empleados/${r.id}`)}>
                        <i className="bx bx-show"></i>
                      </button>
                      <button className="manager-action-btn manager-action-edit" title="Jornadas" onClick={() => navigate(`/manager/mi-equipo/empleados/${r.id}/jornadas`)}>
                        <i className="bx bx-edit"></i>
                      </button>
                      <button className="manager-action-btn manager-action-status" title="Cambiar estado" onClick={() => cambiarEstado(r.id, r.estado)}>
                        <i className="bx bx-power-off"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="8" className="manager-table-empty">No tienes empleados asignados a tu equipo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* ...el resto del contenido... */}
      </main>
    </div>
  );
}
