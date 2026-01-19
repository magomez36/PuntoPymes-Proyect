import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarAuditor from "../../../components/SidebarAuditor"; 
import { apiFetch } from "../../../services/api";

// Estilos globales
import "../../../assets/css/admin-empresas.css";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

const onlyDate = (isoDate) => isoDate || "N/A";
const onlyTime = (isoTime) => isoTime || "N/A";

// Helper para determinar el color de la acción
const getActionColor = (action) => {
    const act = (action || "").toLowerCase();
    if (act.includes("login") || act.includes("acceso")) return "#10b981"; // Verde
    if (act.includes("delete") || act.includes("eliminar")) return "#f59e0b"; // Naranja
    if (act.includes("error") || act.includes("fallo")) return "#ef4444"; // Rojo
    return "#3b82f6"; // Azul por defecto (Update, Create, etc.)
};

export default function LogsAuditoria() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState(""); 
  const [fecha, setFecha] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState({ open: false, log: null });

  // --- LOGICA ---
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
  }, [query]);

  const clearFilters = () => {
    setUsuarioId("");
    setFecha("");
  };

  const handleCopyJSON = () => {
      if (!modal.log) return;
      navigator.clipboard.writeText(JSON.stringify(modal.log.detalles ?? {}, null, 2));
      alert("JSON copiado.");
  };

  const handleDownloadLog = () => {
      if (!modal.log) return;
      const blob = new Blob([JSON.stringify(modal.log, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `log_${modal.log.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- ESTILOS VISUALES ---
  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const cardContainerStyle = {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  };

  const tableHeaderStyle = {
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#64748b',
      padding: '16px 24px',
      borderBottom: '1px solid #f1f5f9',
      textAlign: 'left'
  };

  const tableRowStyle = {
      borderBottom: '1px solid #f8fafc',
      transition: 'background 0.2s'
  };

  const tableCellStyle = {
      padding: '16px 24px',
      fontSize: '0.9rem',
      color: '#1e293b',
      verticalAlign: 'middle'
  };

  const badgeStyle = {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-block'
  };

  // Estilos del Modal (Mismos de la versión Premium)
  const modalInfoCardStyle = {
      border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#fff',
      display: 'flex', flexDirection: 'column', gap: '4px'
  };

  return (
    <div className="layout-wrapper">
      <SidebarAuditor />
      
      <main className="page-content-wrapper">
        
        {/* HEADER */}
        <div style={{ marginBottom: '30px' }}>
            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/auditor/inicio" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>Inicio</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem' }}></i>
                <span style={{ color: '#d51e37', fontWeight: '600', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px' }}>Trazabilidad</span>
            </div>
            <h1 className="page-header-title" style={{ fontWeight: '800', color: '#111827', marginBottom: '4px' }}>Logs de Auditoría</h1>
            <p className="page-header-desc" style={{marginBottom:0}}>Historial detallado de eventos y acciones realizadas en el sistema.</p>
        </div>

        {/* CONTENIDO CENTRADO */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            
            {/* --- SECCIÓN 1: FILTROS (DISEÑO CARD) --- */}
            <div style={cardContainerStyle}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                    <h3 style={{ margin:0, fontSize:'1.1rem', fontWeight:'700', color:'#1e293b' }}>Filtros de Búsqueda</h3>
                    {(usuarioId || fecha) && (
                        <button onClick={clearFilters} style={{ background:'#fee2e2', border:'none', color:'#dc2626', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem', fontWeight:'600', display:'flex', alignItems:'center', gap:'6px' }}>
                            <i className='bx bx-trash'></i> Limpiar Filtros
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    
                    {/* Filtro Usuario */}
                    <div>
                        <label style={{ display:'block', marginBottom:'8px', fontSize:'0.85rem', fontWeight:'600', color:'#64748b' }}>Usuario Responsable</label>
                        <div style={{ position:'relative' }}>
                            <i className='bx bx-user' style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                            <select 
                                value={usuarioId} 
                                onChange={(e) => setUsuarioId(e.target.value)}
                                style={{ width:'100%', padding:'10px 12px 10px 36px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'0.9rem', outline:'none', backgroundColor:'#fff' }}
                            >
                                <option value="">Todos los usuarios</option>
                                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Filtro Fecha */}
                    <div>
                        <label style={{ display:'block', marginBottom:'8px', fontSize:'0.85rem', fontWeight:'600', color:'#64748b' }}>Rango de Fecha</label>
                        <div style={{ position:'relative' }}>
                            <i className='bx bx-calendar' style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                style={{ width:'100%', padding:'10px 12px 10px 36px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'0.9rem', outline:'none', backgroundColor:'#fff', color:'#334155' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: TABLA DE DATOS --- */}
            {loading && <div className="loading-box">Cargando historial...</div>}
            {err && <div className="error-box"><i className='bx bx-error-circle'></i> {err}</div>}

            {!loading && !err && (
                <div style={{ ...cardContainerStyle, padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                            <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>Acción</th>
                                    <th style={tableHeaderStyle}>Usuario</th>
                                    <th style={tableHeaderStyle}>Entidad</th>
                                    <th style={tableHeaderStyle}>Fecha / Hora</th>
                                    <th style={tableHeaderStyle}>IP Origen</th>
                                    <th style={{...tableHeaderStyle, textAlign:'center'}}>Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((r) => {
                                        const actionColor = getActionColor(r.accion);
                                        return (
                                            <tr key={r.id} style={tableRowStyle} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                                
                                                {/* Acción con punto de color */}
                                                <td style={tableCellStyle}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor: actionColor }}></div>
                                                        <span style={{ fontWeight:'600', color:'#334155' }}>{r.accion}</span>
                                                    </div>
                                                </td>

                                                {/* Usuario con subtítulo */}
                                                <td style={tableCellStyle}>
                                                    <div style={{ display:'flex', flexDirection:'column' }}>
                                                        <span style={{ fontWeight:'600', color:'#1e293b' }}>{r.usuario_email ? r.usuario_email.split('@')[0] : "Sistema"}</span>
                                                        <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{r.usuario_email || "Proceso Automático"}</span>
                                                    </div>
                                                </td>

                                                {/* Entidad Badge */}
                                                <td style={tableCellStyle}>
                                                    <span style={badgeStyle}>{r.entidad}</span>
                                                    <span style={{ fontSize:'0.75rem', color:'#94a3b8', marginLeft:'8px' }}>#{r.entidad_id}</span>
                                                </td>

                                                {/* Fecha / Hora apilados */}
                                                <td style={tableCellStyle}>
                                                    <div style={{ display:'flex', flexDirection:'column' }}>
                                                        <span style={{ color:'#334155' }}>{onlyDate(r.fecha_solo)}</span>
                                                        <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{onlyTime(r.hora_solo)}</span>
                                                    </div>
                                                </td>

                                                {/* IP Pill */}
                                                <td style={tableCellStyle}>
                                                    <span style={{ backgroundColor:'#f1f5f9', color:'#64748b', padding:'2px 8px', borderRadius:'99px', fontSize:'0.75rem', border:'1px solid #e2e8f0' }}>
                                                        {r.ip_label}
                                                    </span>
                                                </td>

                                                {/* Botón Ver Detalle */}
                                                <td style={{...tableCellStyle, textAlign:'center'}}>
                                                  <button 
                                                      onClick={() => setModal({ open: true, log: r })}
                                                      style={{ 
                                                          border:'none', background:'transparent', cursor:'pointer', 
                                                          color:'#d51e37', fontSize:'1.2rem', padding:'8px', 
                                                          borderRadius:'50%', transition:'background 0.2s'
                                                      }}
                                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                      title="Ver Detalles"
                                                  >
                                                      <i className='bx bx-code-alt'></i>
                                                  </button>
                                              </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle:'italic' }}>
                                            No se encontraron registros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer de Paginación (Visual) */}
                    <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', color:'#64748b', fontSize:'0.85rem' }}>
                        <span>Mostrando {rows.length} resultados</span>
                        <div style={{ display:'flex', gap:'8px' }}>
                            <button disabled style={{ padding:'6px 12px', border:'1px solid #e2e8f0', background:'#fff', borderRadius:'6px', cursor:'not-allowed', color:'#cbd5e1' }}>Anterior</button>
                            <button disabled style={{ padding:'6px 12px', border:'1px solid #e2e8f0', background:'#fff', borderRadius:'6px', cursor:'not-allowed', color:'#cbd5e1' }}>Siguiente</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- MODAL DETALLE (PREMIUM) --- */}
        {modal.open && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", backdropFilter: 'blur(3px)', display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setModal({ open: false, log: null })}>
                <div style={{ background: "#fff", padding: "30px", borderRadius: "20px", width: "95%", maxWidth: "850px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", maxHeight: "95vh", display: 'flex', flexDirection: 'column', gap: '24px' }} onClick={(e) => e.stopPropagation()}>
                    
                    {/* Header Modal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff1f2', color: '#d51e37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className='bx bx-code-curly'></i></div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>Detalle del Evento #{modal.log?.id}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>ID Transacción: <span style={{fontFamily: 'monospace'}}>{modal.log?.id_transaccion || "N/A"}</span></p>
                            </div>
                        </div>
                        <button onClick={() => setModal({ open: false, log: null })} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}><i className='bx bx-x'></i></button>
                    </div>

                    {/* Grid Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={modalInfoCardStyle}><span style={{fontSize:'0.7rem', color:'#d51e37', fontWeight:'700'}}>USUARIO</span><div style={{fontWeight:'600', display:'flex', gap:'8px'}}><i className='bx bx-user' style={{color:'#64748b'}}></i> {modal.log?.usuario_email || "Sistema"}</div></div>
                        <div style={modalInfoCardStyle}><span style={{fontSize:'0.7rem', color:'#d51e37', fontWeight:'700'}}>FECHA</span><div style={{fontWeight:'600', display:'flex', gap:'8px'}}><i className='bx bx-time' style={{color:'#64748b'}}></i> {modal.log?.fecha_solo}, {modal.log?.hora_solo}</div></div>
                        <div style={modalInfoCardStyle}><span style={{fontSize:'0.7rem', color:'#d51e37', fontWeight:'700'}}>IP ORIGEN</span><div style={{fontWeight:'600', display:'flex', gap:'8px'}}><i className='bx bx-globe' style={{color:'#64748b'}}></i> {modal.log?.ip_label}</div></div>
                        <div style={modalInfoCardStyle}><span style={{fontSize:'0.7rem', color:'#d51e37', fontWeight:'700'}}>ACCIÓN</span><div style={{fontWeight:'600', display:'flex', gap:'8px'}}><i className='bx bx-edit' style={{color:'#64748b'}}></i> {modal.log?.accion}</div></div>
                    </div>

                    {/* JSON */}
                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #334155', borderRadius: '12px', backgroundColor: '#1e293b', padding:'20px' }}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                             <span style={{color:'#94a3b8', fontSize:'0.8rem', fontWeight:'700'}}>PAYLOAD JSON</span>
                             <button onClick={handleCopyJSON} style={{background:'none', border:'none', color:'#d51e37', fontWeight:'600', fontSize:'0.8rem', cursor:'pointer'}}>COPIAR</button>
                        </div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0' }}>{JSON.stringify(modal.log?.detalles ?? {}, null, 2)}</pre>
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                        <button onClick={() => setModal({ open: false, log: null })} className="btn-secondary-cancel" style={{ padding: '12px 24px', borderRadius: '8px' }}>Cerrar</button>
                        <button onClick={handleDownloadLog} className="btn-primary-save" style={{ padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className='bx bx-download'></i> Descargar Log</button>
                    </div>
                </div>
            </div>
        )}

      </main>

      <img src={logoWatermark} alt="Logo Fondo" style={watermarkStyle} />
    </div>
  );
}