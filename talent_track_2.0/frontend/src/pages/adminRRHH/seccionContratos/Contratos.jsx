import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPO = { 1: "indefinido", 2: "plazo", 3: "temporal", 4: "practicante" };
const ESTADO = { 1: "activo", 2: "inactivo" };

function fmtDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
}

export default function Contratos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/contratos/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando contratos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleEstado = async (id) => {
    try {
      const res = await apiFetch(`/api/rrhh/contratos/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({}), // toggle automático en backend
      });
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
        <h2>Contratos</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/rrhh/contratos/crear")}>Crear Contrato</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Salario base</th>
                <th>Jornada semanal (h)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.empleado_nombres}</td>
                  <td>{r.empleado_apellidos}</td>
                  <td>{r.empleado_email}</td>
                  <td>{TIPO[r.tipo] || r.tipo_label || "N/A"}</td>
                  <td>{fmtDate(r.fecha_inicio)}</td>
                  <td>{r.fecha_fin ? fmtDate(r.fecha_fin) : "Sin fecha fin"}</td>
                  <td>{r.salario_base}</td>
                  <td>{r.jornada_semanal_horas}</td>
                  <td>{ESTADO[r.estado] || r.estado_label || "N/A"}</td>
                  <td>
                    <button onClick={() => navigate(`/rrhh/contratos/editar/${r.id}`)}>Editar</button>{" "}
                    <button onClick={() => toggleEstado(r.id)}>Cambiar estado</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="10">No hay contratos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/rrhh/inicio">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
