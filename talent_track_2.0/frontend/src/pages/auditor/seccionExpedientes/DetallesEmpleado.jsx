import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function DetallesEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/expedientes/empleados/${id}/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando detalle.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Detalle de Empleado</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/expedientes/empleados")}>Volver</button>
          <button onClick={() => navigate(`/auditor/expedientes/empleados/${id}/contrato`)}>
            Ver contrato
          </button>
          <button onClick={() => navigate(`/auditor/expedientes/empleados/${id}/jornadas`)}>
            Ver jornadas
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && data && (
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <p><strong>Nombres:</strong> {data.nombres}</p>
            <p><strong>Apellidos:</strong> {data.apellidos}</p>
            <p><strong>Unidad Organizacional:</strong> {data.unidad_nombre || "N/A"}</p>
            <p><strong>Manager:</strong> {data.manager_nombre || "N/A"}</p>
            <p><strong>Puesto:</strong> {data.puesto_nombre || "N/A"}</p>

            <hr />

            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Teléfono:</strong> {data.telefono || "N/A"}</p>
            <p><strong>Dirección:</strong> {data.direccion || "N/A"}</p>
            <p><strong>Fecha nacimiento:</strong> {fmtDate(data.fecha_nacimiento)}</p>
            <p><strong>Fecha ingreso:</strong> {fmtDate(data.fecha_ingreso)}</p>

            <hr />

            <p><strong>Estado:</strong> {data.estado_label}</p>
          </div>
        )}
      </main>
    </div>
  );
}
