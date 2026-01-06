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
      const res = await apiFetch(`/api/manager/ausencias/solicitudes/${id}/`);
      const d = await res.json();
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
    return buildDateRange(data.fecha_inicio, data.fecha_fin);
  }, [data]);

  const decidir = async (accion) => {
    if (!data) return;

    const comentario = window.prompt(
      accion === 1
        ? "Comentario (opcional) para aprobación:"
        : "Comentario (opcional) para rechazo:"
    );

    if (comentario === null) return; // cancelado

    try {
      const res = await apiFetch(`/api/manager/ausencias/solicitudes/${id}/decidir/`, {
        method: "PATCH",
        body: JSON.stringify({
          accion,
          comentario: comentario.trim() ? comentario.trim() : null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      alert(`Solicitud ${out.estado_label || "actualizada"}.`);
      navigate("/manager/ausencias/solicitudes");
    } catch (e) {
      alert(e?.message || "Error al decidir solicitud.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Detalle Solicitud de Ausencia (Mi equipo)</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && data && (
          <>
            <div style={{ marginBottom: 12 }}>
              <p><strong>Nombres:</strong> {data.nombres}</p>
              <p><strong>Apellidos:</strong> {data.apellidos}</p>
              <p><strong>Email:</strong> {data.email}</p>
              <p><strong>Unidad Organizacional:</strong> {data.unidad_organizacional}</p>
              <p><strong>Puesto:</strong> {data.puesto}</p>

              <hr />

              <p><strong>Tipo Ausencia:</strong> {data.tipo_ausencia}</p>
              <p><strong>Fecha inicio:</strong> {fmtDate(data.fecha_inicio)}</p>
              <p><strong>Fecha fin:</strong> {fmtDate(data.fecha_fin)}</p>
              <p><strong>Días hábiles:</strong> {data.dias_habiles}</p>
              <p><strong>Motivo:</strong> {data.motivo || "N/A"}</p>
              <p><strong>Nivel de Aprobación:</strong> {data.flujo_actual}</p>
              <p><strong>Creada:</strong> {fmtDT(data.creada_el)}</p>
              <p><strong>Estado:</strong> {data.estado_label}</p>
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
                          <td><strong>Ausente</strong></td>
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
              <button onClick={() => decidir(1)}>Aprobar Solicitud</button>
              <button onClick={() => decidir(2)}>Rechazar Solicitud</button>
              <button onClick={() => navigate("/manager/ausencias/solicitudes")}>Cancelar</button>
            </div>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/manager/ausencias/solicitudes">Volver</Link>
        </div>
      </main>
    </div>
  );
}
