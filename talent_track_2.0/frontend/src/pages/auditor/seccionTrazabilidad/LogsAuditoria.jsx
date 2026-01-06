import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const onlyDate = (isoDate) => isoDate || "N/A";
const onlyTime = (isoTime) => isoTime || "N/A";

export default function LogsAuditoria() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [usuarioId, setUsuarioId] = useState(""); // string para control
  const [fecha, setFecha] = useState(""); // YYYY-MM-DD

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modal, setModal] = useState({ open: false, log: null });

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (usuarioId) p.set("usuario_id", usuarioId);
    if (fecha) p.set("fecha", fecha);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [usuarioId, fecha]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/trazabilidad/logs/${query}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));

      setRows(Array.isArray(data?.results) ? data.results : []);
      setUsuarios(Array.isArray(data?.filtros?.usuarios) ? data.filtros.usuarios : []);
    } catch (e) {
      setErr(e?.message || "Error cargando logs.");
      setRows([]);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [query]);

  const clearFilters = () => {
    setUsuarioId("");
    setFecha("");
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Trazabilidad — Logs de Auditoría</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <Link to="/auditor/inicio">Volver al inicio</Link>
          <button onClick={clearFilters}>Limpiar filtros</button>
        </div>

        {/* FILTROS */}
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>Filtros</h3>

          {/* Toggle de usuarios */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 6 }}>
              <strong>Filtrar por usuario:</strong>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button
                onClick={() => setUsuarioId("")}
                style={{ fontWeight: usuarioId === "" ? "bold" : "normal" }}
              >
                Todos
              </button>

              {usuarios.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUsuarioId(String(u.id))}
                  style={{
                    fontWeight: usuarioId === String(u.id) ? "bold" : "normal",
                  }}
                  title={u.email}
                >
                  {u.email}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <strong>Filtrar por fecha:</strong>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.8 }}>
            Puedes aplicar ambos filtros al mismo tiempo (usuario + fecha).
          </p>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <>
            <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Entidad</th>
                  <th>Entidad ID</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>IP</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.accion}</td>
                    <td>{r.usuario_email || "N/A"}</td>
                    <td>{r.entidad}</td>
                    <td>{r.entidad_id}</td>
                    <td>{onlyDate(r.fecha_solo)}</td>
                    <td>{onlyTime(r.hora_solo)}</td>
                    <td>{r.ip_label}</td>
                    <td>
                      <button onClick={() => setModal({ open: true, log: r })}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan="8">No hay logs con los filtros actuales.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Modal simple */}
            {modal.open && (
              <div
                style={{
                  position: "fixed",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                }}
                onClick={() => setModal({ open: false, log: null })}
              >
                <div
                  style={{ background: "#fff", padding: 16, borderRadius: 10, width: "min(900px, 95vw)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3>Detalle del evento</h3>
                  <p><strong>Acción:</strong> {modal.log?.accion}</p>
                  <p><strong>Usuario:</strong> {modal.log?.usuario_email || "N/A"}</p>
                  <p><strong>Entidad:</strong> {modal.log?.entidad}</p>
                  <p><strong>Entidad ID:</strong> {modal.log?.entidad_id}</p>
                  <p><strong>Fecha:</strong> {modal.log?.fecha_solo || "N/A"} {modal.log?.hora_solo || ""}</p>
                  <p><strong>IP:</strong> {modal.log?.ip_label}</p>

                  <hr />

                  <p style={{ marginBottom: 6 }}><strong>Detalles (JSON):</strong></p>
                  <pre style={{ maxHeight: 320, overflow: "auto", background: "#f6f6f6", padding: 10 }}>
{JSON.stringify(modal.log?.detalles ?? {}, null, 2)}
                  </pre>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={() => setModal({ open: false, log: null })}>Cerrar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate("/auditor/inicio")}>Ir a Inicio</button>
        </div>
      </main>
    </div>
  );
}
