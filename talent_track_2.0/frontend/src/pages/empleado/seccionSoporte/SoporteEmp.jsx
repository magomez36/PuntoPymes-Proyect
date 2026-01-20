import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/SidebarEmpleado";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// --- HELPERS ---
async function safeJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; }
  catch { return { _non_json: true, raw: text }; }
}

export default function SoporteEmp() {
  const [loading, setLoading] = useState(true);
  
  const [admins, setAdmins] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState({}); // empleado_id -> true/false

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });

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

  const showModal = (type, title, message) => {
      setModalConfig({ show: true, type, title, message });
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/empleado/soporte/rrhh-admins/");
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || "Error cargando Admin RRHH.");
      setAdmins(Array.isArray(data) ? data : []);
      setSelected({});
    } catch (e) {
      showModal('error', 'Error', e?.message || "No se pudo cargar la lista de soporte.");
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

    if (selectedIds.length === 0) return showModal('error', 'Destinatario faltante', "Selecciona al menos 1 administrador de RRHH.");
    if (!titulo.trim()) return showModal('error', 'Faltan datos', "El asunto es obligatorio.");
    if (!mensaje.trim()) return showModal('error', 'Faltan datos', "El mensaje no puede estar vacío.");

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

      showModal('success', 'Mensaje Enviado', `Se ha notificado a ${data?.creadas ?? 0} administrador(es) de RRHH.`);
      
      setTitulo("");
      setMensaje("");
      clearAll();
    } catch (e2) {
      showModal('error', 'Error de envío', e2?.message || "No se pudo enviar el mensaje.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1e293b' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Soporte RRHH</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Contacta con administración o resuelve tus dudas.</p>
            </div>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {loading ? (
             <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando directorio...</p>
        ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 30, alignItems: 'start' }}>
                
                {/* --- PANEL IZQUIERDO: SELECCIÓN DE RRHH --- */}
                <div style={cardStyle}>
                    <div style={{ paddingBottom: '15px', borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Directorio RRHH</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Selecciona a quién deseas contactar.</p>
                    </div>

                    {/* Buscador */}
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                        <input
                            placeholder="Buscar por nombre..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '40px' }}
                        />
                    </div>

                    {/* Botones de Selección */}
                    <div style={{ display: "flex", gap: 10, marginBottom: '15px' }}>
                        <button type="button" onClick={selectAll} style={{ fontSize: '0.8rem', color: '#0f172a', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600' }}>Todos</button>
                        <button type="button" onClick={clearAll} style={{ fontSize: '0.8rem', color: '#64748b', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>Ninguno</button>
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>{selectedIds.length} seleccionados</span>
                    </div>

                    {/* Lista de Admins */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filtered.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No se encontraron contactos.</p>
                        ) : (
                            filtered.map((a) => (
                                <div
                                    key={a.empleado_id}
                                    onClick={() => toggleOne(a.empleado_id)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 12, padding: "10px",
                                        borderRadius: '10px', cursor: "pointer",
                                        backgroundColor: selected[a.empleado_id] ? '#f0f9ff' : 'white',
                                        border: selected[a.empleado_id] ? '1px solid #bae6fd' : '1px solid #f1f5f9',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Checkbox Visual */}
                                    <div style={{ 
                                        width: '20px', height: '20px', borderRadius: '6px', 
                                        border: selected[a.empleado_id] ? 'none' : '2px solid #cbd5e1',
                                        backgroundColor: selected[a.empleado_id] ? '#0284c7' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        {selected[a.empleado_id] && <i className='bx bx-check'></i>}
                                    </div>

                                    {/* Avatar Initials */}
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: '700', fontSize: '0.9rem' }}>
                                        {a.nombres.charAt(0)}{a.apellidos.charAt(0)}
                                    </div>

                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.nombres} {a.apellidos}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.email}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- PANEL DERECHO: FORMULARIO Y FAQ --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Formulario */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#1e293b' }}>Redactar Mensaje</h3>
                        
                        <form onSubmit={enviar}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Asunto <span style={{color:'#ef4444'}}>*</span></label>
                                <input
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Solicitud de información..."
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Mensaje <span style={{color:'#ef4444'}}>*</span></label>
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Describe tu consulta detalladamente..."
                                    rows={6}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => { setTitulo(""); setMensaje(""); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                                    Limpiar
                                </button>
                                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className='bx bx-send'></i> Enviar Mensaje
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* FAQ Accordion */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className='bx bx-help-circle' style={{color:'#0f172a'}}></i> Preguntas Frecuentes
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            
                            <details style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#334155', outline: 'none' }}>¿Por qué no puedo registrar asistencia?</summary>
                                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                                    Revisa tu conexión a internet y asegúrate de que tu turno esté activo. Si el problema persiste, contacta a RRHH para verificar tus permisos.
                                </p>
                            </details>

                            <details style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#334155', outline: 'none' }}>¿Cómo solicito vacaciones?</summary>
                                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                                    Dirígete a la sección de <strong>"Permisos / Ausencias"</strong> en el menú lateral, haz clic en "Nueva Solicitud" y selecciona "Vacaciones".
                                </p>
                            </details>

                            <details style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: '#334155', outline: 'none' }}>Error en mis datos personales</summary>
                                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                                    Puedes editar tu teléfono y dirección en <strong>"Mi Perfil"</strong>. Para cambios de nombre o identificación, debes contactar a RRHH adjuntando soporte legal.
                                </p>
                            </details>

                        </div>
                    </div>

                </div>
            </div>
        )}

        {/* --- MODAL --- */}
        {modalConfig.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        backgroundColor: modalConfig.type === 'success' ? '#dcfce7' : '#fee2e2', 
                        color: modalConfig.type === 'success' ? '#16a34a' : '#dc2626', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <i className={`bx ${modalConfig.type === 'success' ? 'bx-check' : 'bx-x'}`} style={{ fontSize: '48px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{modalConfig.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>{modalConfig.message}</p>
                    <button onClick={closeModal} style={{ width: '100%', padding: '12px', backgroundColor: modalConfig.type === 'success' ? '#16a34a' : '#374151', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        {modalConfig.type === 'success' ? 'Continuar' : 'Cerrar'}
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}