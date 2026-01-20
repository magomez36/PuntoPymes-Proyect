import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/SidebarEmpleado";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// --- HELPERS ---
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
  
  // Formato: 24 ene 2025, 14:30
  return d.toLocaleDateString("es-EC", { day: 'numeric', month: 'short', year: 'numeric' }) + 
         ", " + 
         d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function previewText(t, n = 60) {
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
        const msg = data?._non_json ? "Error de conexión." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      setRows(Array.isArray(data) ? data : []);
      
      // Mantener selección si existe
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

      // Actualizar estado local
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
      if (selected?.id === id) setSelected(data);
    } catch (e) {
      alert(e?.message || "Error al actualizar estado.");
    }
  };

  const openNotif = async (n) => {
    setSelected(n);
    if (!n.leida_el) {
      await marcarLeida(n.id);
    }
  };

  const unreadCount = useMemo(() => rows.filter((r) => !r.leida_el).length, [rows]);

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px', height: '100vh', boxSizing: 'border-box' };
  
  const tabBtnStyle = (isActive) => ({
    padding: '8px 16px', borderRadius: '20px', border: isActive ? '1px solid #0f172a' : '1px solid transparent', 
    backgroundColor: isActive ? '#0f172a' : 'transparent', 
    color: isActive ? 'white' : '#64748b', 
    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem'
  });

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Notificaciones</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Bandeja de entrada y avisos.</p>
            </div>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* CONTROLS */}
        <div style={{ flexShrink: 0, display: "flex", gap: 10, alignItems: "center", backgroundColor: '#fff', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => setTab("todas")} style={tabBtnStyle(tab === "todas")}>Todas</button>
                <button onClick={() => setTab("no_leidas")} style={tabBtnStyle(tab === "no_leidas")}>No leídas</button>
            </div>
            
            <div style={{ height: '20px', width: '1px', backgroundColor: '#e2e8f0', margin: '0 10px' }}></div>

            <button onClick={load} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: '600' }}>
                <i className='bx bx-refresh' style={{fontSize: '1.2rem'}}></i> Actualizar
            </button>

            <span style={{ marginLeft: "auto", fontSize: '0.9rem', color: '#64748b' }}>
                <strong style={{ color: unreadCount > 0 ? '#d97706' : '#64748b' }}>{unreadCount}</strong> sin leer
            </span>
        </div>

        {err && <p style={{ color: "#dc2626", backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{err}</p>}

        {/* GRID CONTENT (INBOX STYLE) */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "350px 1fr", gap: 20, minHeight: 0 }}>
            
            {/* COL 1: LISTA (Scrollable) */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bandeja</h3>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading && <p style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Cargando...</p>}
                    
                    {!loading && rows.length === 0 && (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                            <i className='bx bx-inbox' style={{ fontSize: '3rem', marginBottom: '10px', display: 'block' }}></i>
                            No hay notificaciones.
                        </div>
                    )}

                    {!loading && rows.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => openNotif(n)}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                backgroundColor: selected?.id === n.id ? '#f0f9ff' : n.leida_el ? 'white' : '#fffbeb', // Azul si seleccionado, Amarillo si no leído
                                transition: 'background 0.2s',
                                borderLeft: selected?.id === n.id ? '4px solid #0f172a' : (!n.leida_el ? '4px solid #d97706' : '4px solid transparent')
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '5px' }}>
                                <span style={{ 
                                    fontSize: '0.75rem', fontWeight: '700', 
                                    color: n.canal === 'email' ? '#0ea5e9' : '#64748b',
                                    textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    <i className={`bx ${n.canal === 'email' ? 'bx-envelope' : 'bx-bell'}`}></i>
                                    {n.canal_label || n.canal}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                    {new Date(n.enviada_el).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                </span>
                            </div>
                            
                            <div style={{ fontWeight: n.leida_el ? '600' : '800', color: '#1e293b', marginBottom: '4px', fontSize: '0.95rem' }}>
                                {n.titulo || "(Sin título)"}
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                                {previewText(n.mensaje)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COL 2: DETALLE (Fixed) */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                
                {!selected ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                        <i className='bx bx-message-square-detail' style={{ fontSize: '5rem', marginBottom: '20px' }}></i>
                        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>Selecciona una notificación</p>
                        <p style={{ fontSize: '0.9rem' }}>Haz clic en un mensaje de la izquierda para ver los detalles.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#0f172a' }}>{selected.titulo || "(Sin título)"}</h2>
                                <span style={{ 
                                    backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', 
                                    fontSize: '0.8rem', fontWeight: '600' 
                                }}>
                                    {selected.canal_label || selected.canal}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#64748b' }}>
                                <span><i className='bx bx-calendar'></i> {fmtDateTime(selected.enviada_el)}</span>
                                {selected.leida_el && (
                                    <span style={{color: '#16a34a'}}><i className='bx bx-check-double'></i> Leída</span>
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1, fontSize: '1rem', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
                            {selected.mensaje || "—"}
                        </div>

                        {selected.accion_url && (
                            <div style={{ marginTop: '30px' }}>
                                <a 
                                    href={selected.accion_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        backgroundColor: '#0f172a', color: 'white', padding: '12px 24px', 
                                        borderRadius: '8px', textDecoration: 'none', fontWeight: '600' 
                                    }}
                                >
                                    Ver Acción Requerida <i className='bx bx-link-external'></i>
                                </a>
                            </div>
                        )}
                        
                        {/* Botón manual si por alguna razón no se marcó auto */}
                        {!selected.leida_el && (
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                <button 
                                    onClick={() => marcarLeida(selected.id)}
                                    style={{ 
                                        backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', 
                                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' 
                                    }}
                                >
                                    <i className='bx bx-check'></i> Marcar como leída manualmente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

      </main>
    </div>
  );
}