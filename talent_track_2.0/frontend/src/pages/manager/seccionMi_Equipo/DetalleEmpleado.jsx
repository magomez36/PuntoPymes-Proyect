import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function DetalleEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/mi-equipo/empleados/${id}/`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar el detalle.");
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando detalle.");
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
        <h2>Detalle del Empleado</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && data && (
          <>
            <div style={{ marginBottom: 12 }}>
              <p><strong>Nombres:</strong> {data.nombres}</p>
              <p><strong>Apellidos:</strong> {data.apellidos}</p>
              <p><strong>Email:</strong> {data.email}</p>

              <hr />

              <p><strong>Unidad Organizacional:</strong> {data.unidad_organizacional || "N/A"}</p>
              <p><strong>Puesto:</strong> {data.puesto || "N/A"}</p>
              <p><strong>Manager:</strong> {data.manager || "N/A"}</p>

              <hr />

              <p><strong>Teléfono:</strong> {data.telefono || "N/A"}</p>
              <p><strong>Dirección:</strong> {data.direccion || "N/A"}</p>

              <hr />

              <p><strong>Fecha nacimiento:</strong> {fmtDate(data.fecha_nacimiento)}</p>
              <p><strong>Fecha ingreso:</strong> {fmtDate(data.fecha_ingreso)}</p>

              <hr />

              <p><strong>Estado:</strong> {data.estado_label || "N/A"}</p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate(`/manager/mi-equipo/empleados/${id}/jornadas`)}>Ver Jornadas</button>
              <button onClick={() => navigate("/manager/mi-equipo/empleados")}>Volver</button>
            </div>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/manager/mi-equipo/empleados">Volver a lista</Link>
        </div>
      </main>
    </div>
  );
}
