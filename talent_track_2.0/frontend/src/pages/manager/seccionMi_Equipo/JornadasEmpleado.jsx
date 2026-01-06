import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function JornadasEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/mi-equipo/empleados/${id}/jornadas/`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar jornadas.");
      setPayload(d);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const empleado = payload?.empleado;
  const contrato = payload?.contrato;
  const rows = Array.isArray(payload?.jornadas) ? payload.jornadas : [];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Jornadas Calculadas del Empleado</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && payload && (
          <>
            <div style={{ marginBottom: 12 }}>
              <p>
                <strong>Empleado:</strong>{" "}
                {empleado ? `${empleado.nombres} ${empleado.apellidos} (${empleado.email})` : "N/A"}
              </p>

              <h3>Contrato (resumen)</h3>
              {contrato?.existe ? (
                <>
                  <p><strong>Turno base:</strong> {contrato.turno_base || "N/A"}</p>
                  <p><strong>Fecha inicio:</strong> {fmtDate(contrato.fecha_inicio)}</p>
                  <p><strong>Fecha fin:</strong> {contrato.fecha_fin ? fmtDate(contrato.fecha_fin) : "Sin fecha fin"}</p>
                  <p><strong>Salario base:</strong> {contrato.salario_base || "N/A"}</p>
                  <p><strong>Jornada semanal (horas):</strong> {contrato.jornada_semanal_horas ?? "N/A"}</p>
                </>
              ) : (
                <p>No existe contrato registrado para este empleado.</p>
              )}
            </div>

            <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Primera entrada</th>
                  <th>Última salida</th>
                  <th>Min. trabajados</th>
                  <th>Min. tardanza</th>
                  <th>Min. extra</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.fecha)}</td>
                    <td>{fmtDT(r.hora_primera_entrada)}</td>
                    <td>{fmtDT(r.hora_ultimo_salida)}</td>
                    <td>{r.minutos_trabajados}</td>
                    <td>{r.minutos_tardanza}</td>
                    <td>{r.minutos_extra}</td>
                    <td>{r.estado_label || "N/A"}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="7">No hay jornadas calculadas para este empleado.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button onClick={() => navigate(`/manager/mi-equipo/empleados/${id}`)}>Volver a detalle</button>
              <button onClick={() => navigate("/manager/mi-equipo/empleados")}>Volver a lista</button>
            </div>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/manager/mi-equipo/empleados">Volver</Link>
        </div>
      </main>
    </div>
  );
}
