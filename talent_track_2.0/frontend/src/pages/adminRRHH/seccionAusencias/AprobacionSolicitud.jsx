// src/pages/adminRRHH/seccionAusencias/AprobacionSolicitud.jsx
import React, { useEffect, useMemo, useState } from "react";
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

function buildDateRange(startIso, endIso) {
  if (!startIso || !endIso) return [];
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (end < start) return [];

  const out = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export default function AprobacionSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/rrhh/ausencias/solicitudes/${id}/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar la solicitud.");
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando solicitud.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const rango = useMemo(() => {
    if (!data) return [];
    const fin = data.fecha_fin || data.fecha_inicio; // si viene null, usamos inicio
    return buildDateRange(data.fecha_inicio, fin);
  }, [data]);

  const decidir = async (decision) => {
    if (!data) return;

    const comentario = window.prompt(
      decision === "aprobar"
        ? "Comentario (opcional) para aprobación:"
        : "Comentario (opcional) para rechazo:"
    );

    if (comentario === null) {
      // cancelado por usuario
      return;
    }

    try {
      const res = await apiFetch(`/api/rrhh/ausencias/solicitudes/${id}/decidir/`, {
        method: "PATCH",
        body: JSON.stringify({
          // ✅ el backend espera "accion" (1/2 o aprobar/rechazar)
          accion: decision, // "aprobar" | "rechazar"
          comentario: comentario.trim() ? comentario.trim() : null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(out?.detail || JSON.stringify(out));
      }

      alert(`Solicitud ${out.estado_label || "actualizada"}.`);
      navigate("/rrhh/ausencias/solicitudes");
    } catch (e) {
      alert(e?.message || "Error al decidir solicitud.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Detalle Solicitud de Ausencia</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && data && (
          <>
            <div style={{ marginBottom: 12 }}>
              <p>
                <strong>Nombres:</strong> {data.nombres}
              </p>
              <p>
                <strong>Apellidos:</strong> {data.apellidos}
              </p>
              <p>
                <strong>Email:</strong> {data.email}
              </p>

              {/* ✅ Ajustado a la respuesta del backend: "unidad" */}
              <p>
                <strong>Unidad Organizacional:</strong> {data.unidad || "N/A"}
              </p>

              <p>
                <strong>Manager:</strong> {data.manager || "N/A"}
              </p>
              <p>
                <strong>Puesto:</strong> {data.puesto || "N/A"}
              </p>

              <hr />

              <p>
                <strong>Tipo Ausencia:</strong> {data.tipo_ausencia}
              </p>
              <p>
                <strong>Fecha inicio:</strong> {fmtDate(data.fecha_inicio)}
              </p>
              <p>
                <strong>Fecha fin:</strong> {fmtDate(data.fecha_fin || data.fecha_inicio)}
              </p>
              <p>
                <strong>Días hábiles:</strong> {data.dias_habiles}
              </p>
              <p>
                <strong>Motivo:</strong> {data.motivo || "N/A"}
              </p>
              <p>
                <strong>Nivel de Aprobación:</strong> {data.flujo_actual}
              </p>
              <p>
                <strong>Creada:</strong> {fmtDT(data.creada_el)}
              </p>
              <p>
                <strong>Estado:</strong> {data.estado_label || "N/A"}
              </p>
            </div>

            {/* Calendario simple */}
            <div style={{ marginTop: 10, marginBottom: 14 }}>
              <h3>Calendario (días solicitados)</h3>
              {rango.length ? (
                <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rango.map((d) => {
                      const iso = d.toISOString().slice(0, 10);
                      return (
                        <tr key={iso}>
                          <td>{d.toLocaleDateString("es-EC")}</td>
                          <td>
                            <strong>Ausente</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No se pudo generar el calendario (rango inválido).</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => decidir("aprobar")}>Aprobar Solicitud</button>
              <button onClick={() => decidir("rechazar")}>Rechazar Solicitud</button>
              <button onClick={() => navigate("/rrhh/ausencias/solicitudes")}>Cancelar</button>
            </div>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/rrhh/ausencias/solicitudes">Volver</Link>
        </div>
      </main>
    </div>
  );
}
