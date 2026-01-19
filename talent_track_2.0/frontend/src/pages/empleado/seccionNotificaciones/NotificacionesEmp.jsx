import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

function fmtDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  // formato simple local
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function previewText(t, n = 80) {
  if (!t) return "";
  const s = String(t).replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n) + "..." : s;
}

export default function NotificacionesEmp() {
  const [tab, setTab] = useState("todas"); // "todas" | "no_leidas"
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const url = useMemo(() => {
    return tab === "no_leidas"
      ? "/api/empleado/notificaciones/?solo_no_leidas=1"
      : "/api/empleado/notificaciones/";
  }, [tab]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(url);
      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?._non_json ? "Backend devolvió HTML (revisa ruta/auth)." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      setRows(Array.isArray(data) ? data : []);
      // si la seleccionada ya no existe, limpiarla
      if (selected) {
        const still = Array.isArray(data) ? data.find((x) => x.id === selected.id) : null;
        setSelected(still || null);
      }
    } catch (e) {
      setErr(e?.message || "Error cargando notificaciones.");
      setRows([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [url]);

  const marcarLeida = async (id) => {
    try {
      const res = await apiFetch(`/api/empleado/notificaciones/${id}/leida/`, { method: "PATCH" });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || "No se pudo marcar como leída.");

      // actualizar en memoria (sin recargar)
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
      if (selected?.id === id) setSelected(data);
    } catch (e) {
      alert(e?.message || "Error.");
    }
  };

  const openNotif = async (n) => {
    setSelected(n);

    // comportamiento dinámico: al abrir, si no está leída, marcar automáticamente
    if (!n.leida_el) {
      await marcarLeida(n.id);
    }
  };

  const unreadCount = useMemo(() => rows.filter((r) => !r.leida_el).length, [rows]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Notificaciones</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <button onClick={() => setTab("todas")} disabled={tab === "todas"}>
            Todas
          </button>
          <button onClick={() => setTab("no_leidas")} disabled={tab === "no_leidas"}>
            No leídas
          </button>
          <button onClick={load}>Refrescar</button>

          <span style={{ marginLeft: "auto" }}>
            <strong>No leídas:</strong> {unreadCount}
          </span>
        </div>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {loading && <p>Cargando...</p>}

        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* LISTA tipo inbox */}
            <div>
              <h3 style={{ marginTop: 0 }}>Bandeja</h3>

              {rows.length === 0 ? (
                <p>No tienes notificaciones.</p>
              ) : (
                <div>
                  {rows.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => openNotif(n)}
                      style={{
                        border: "1px solid #ccc",
                        padding: 10,
                        marginBottom: 8,
                        cursor: "pointer",
                        background: selected?.id === n.id ? "#f3f3f3" : "white",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <strong>
                          {n.leida_el ? "" : "● "} {n.titulo || "(Sin título)"}
                        </strong>
                        <small>{fmtDateTime(n.enviada_el)}</small>
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <small>{previewText(n.mensaje)}</small>
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                        <small>Canal: {n.canal_label || n.canal}</small>

                        {!n.leida_el && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarLeida(n.id);
                            }}
                          >
                            Marcar leída
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DETALLE */}
            <div>
              <h3 style={{ marginTop: 0 }}>Detalle</h3>

              {!selected ? (
                <p>Selecciona una notificación para ver el detalle.</p>
              ) : (
                <div style={{ border: "1px solid #ccc", padding: 12 }}>
                  <p>
                    <strong>{selected.titulo || "(Sin título)"}</strong>
                  </p>

                  <p>
                    <small>
                      <strong>Enviada:</strong> {fmtDateTime(selected.enviada_el)} <br />
                      <strong>Leída:</strong> {selected.leida_el ? fmtDateTime(selected.leida_el) : "No"}
                      <br />
                      <strong>Canal:</strong> {selected.canal_label || selected.canal}
                    </small>
                  </p>

                  <hr />

                  <p style={{ whiteSpace: "pre-wrap" }}>{selected.mensaje || "—"}</p>

                  {selected.accion_url && (
                    <p>
                      <a href={selected.accion_url} target="_blank" rel="noreferrer">
                        Ir a acción
                      </a>
                    </p>
                  )}

                  {!selected.leida_el && (
                    <button onClick={() => marcarLeida(selected.id)}>Marcar como leída</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/empleado/inicio">Volver</Link>
        </div>
      </main>
    </div>
  );
}
