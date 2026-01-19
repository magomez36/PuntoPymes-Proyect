import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";

async function safeJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; }
  catch { return { _non_json: true, raw: text }; }
}

export default function SoporteEmp() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [admins, setAdmins] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState({}); // empleado_id -> true/false

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const selectedIds = useMemo(() => {
    return Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
  }, [selected]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return admins;
    return admins.filter((a) =>
      `${a.nombres} ${a.apellidos} ${a.email}`.toLowerCase().includes(s)
    );
  }, [admins, q]);

  const loadAdmins = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/empleado/soporte/rrhh-admins/");
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || "Error cargando Admin RRHH.");
      setAdmins(Array.isArray(data) ? data : []);
      setSelected({});
    } catch (e) {
      setErr(e?.message || "Error cargando Admin RRHH.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const toggleOne = (empleado_id) => {
    setSelected((p) => ({ ...p, [empleado_id]: !p[empleado_id] }));
  };

  const selectAll = () => {
    const map = {};
    filtered.forEach((a) => { map[a.empleado_id] = true; });
    setSelected((p) => ({ ...p, ...map }));
  };

  const clearAll = () => setSelected({});

  const enviar = async (e) => {
    e.preventDefault();
    setErr("");

    if (selectedIds.length === 0) return setErr("Selecciona al menos 1 Admin RRHH.");
    if (!titulo.trim()) return setErr("El título/asunto es obligatorio.");
    if (!mensaje.trim()) return setErr("El mensaje es obligatorio.");

    try {
      const res = await apiFetch("/api/empleado/soporte/enviar/", {
        method: "POST",
        body: JSON.stringify({
          destinatarios_empleado_ids: selectedIds,
          titulo: titulo.trim(),
          mensaje: mensaje.trim(),
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data || {}));

      alert(`Mensaje enviado. Notificaciones creadas: ${data?.creadas ?? 0}`);
      setTitulo("");
      setMensaje("");
      clearAll();
    } catch (e2) {
      setErr(e2?.message || "Error enviando mensaje.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Ayuda y soporte</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={loadAdmins}>Refrescar</button>
          <Link to="/empleado/inicio">Volver</Link>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 16 }}>
            {/* Panel Izquierdo: seleccionar RRHH */}
            <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <h3>1) Elige a quién notificar (Admin RRHH)</h3>

              <input
                placeholder="Buscar por nombre o email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ width: "100%", marginTop: 8, padding: 8 }}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" onClick={selectAll}>Seleccionar visibles</button>
                <button type="button" onClick={clearAll}>Limpiar</button>
              </div>

              <p style={{ marginTop: 10 }}>
                Seleccionados: <strong>{selectedIds.length}</strong>
              </p>

              <div style={{ marginTop: 10, maxHeight: 320, overflow: "auto" }}>
                {filtered.length === 0 ? (
                  <p>No hay Admin RRHH disponibles.</p>
                ) : (
                  filtered.map((a) => (
                    <label
                      key={a.empleado_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 6px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!selected[a.empleado_id]}
                        onChange={() => toggleOne(a.empleado_id)}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {a.nombres} {a.apellidos}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{a.email}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </section>

            {/* Panel Derecho: mensaje + FAQ */}
            <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <h3>2) Escribe tu mensaje</h3>

              <form onSubmit={enviar}>
                <div style={{ marginTop: 8 }}>
                  <label>Asunto / título *</label>
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Solicitud de permiso, duda de asistencia..."
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Mensaje *</label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Describe tu situación con claridad..."
                    rows={6}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                  <button type="submit">Enviar</button>
                  <button type="button" onClick={() => { setTitulo(""); setMensaje(""); }}>
                    Limpiar texto
                  </button>
                </div>
              </form>

              <hr style={{ marginTop: 16 }} />

              <h3>3) Preguntas frecuentes</h3>

              <details style={{ marginTop: 8 }}>
                <summary><strong>¿Por qué no puedo registrar asistencia?</strong></summary>
                <p>Revisa tu conexión, permisos y si tu sesión está activa. Si persiste, envía un mensaje a RRHH.</p>
              </details>

              <details style={{ marginTop: 8 }}>
                <summary><strong>¿Cómo solicito una ausencia o permiso?</strong></summary>
                <p>Ve a la sección de Ausencias, crea una solicitud, selecciona tipo y fechas. Luego espera aprobación.</p>
              </details>

              <details style={{ marginTop: 8 }}>
                <summary><strong>¿Qué hago si mis datos personales están mal?</strong></summary>
                <p>En “Mi Perfil”, edita tus datos. Si algún campo está bloqueado, contacta a RRHH desde aquí.</p>
              </details>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
