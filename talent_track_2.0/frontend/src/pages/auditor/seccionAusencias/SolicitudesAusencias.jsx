import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Sidebar correcto
import Sidebar from "../../../components/SidebarAuditor"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC", { dateStyle: 'medium', timeStyle: 'short' });
};

export default function SolicitudesAusencias() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/ausencias/solicitudes/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando solicitudes.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getInitials = (name, surname) => {
    const n = name ? name.charAt(0).toUpperCase() : '';
    const s = surname ? surname.charAt(0).toUpperCase() : '';
    return n + s;
  };

  // Filtrado
  const filteredRows = rows.filter(r => 
    r.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tipo_ausencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Estilos ---
  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const cardBaseStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '25px',
    overflowX: 'auto',
    position: 'relative', 
    zIndex: 1,
    minHeight: '400px',
    display: 'flex', 
    flexDirection: 'column'
  };

  const tableHeaderStyle = {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #f1f5f9',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tableCellStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    fontSize: '0.9rem',
    verticalAlign: 'middle'
  };

  // --- TABS STYLES ---
  const tabsContainerStyle = {
    display: 'flex',
    gap: '30px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '25px',
    marginTop: '25px'
  };

  const tabItemStyle = {
    padding: '10px 0 15px 0',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  };

  const activeTabItemStyle = {
    ...tabItemStyle,
    color: '#d51e37',
    borderBottom: '2px solid #d51e37'
  };

  // Badge de Estado
  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : "DESCONOCIDO";
    let bg = '#f1f5f9'; let color = '#64748b';

    if (s === 'APROBADO' || s === 'FINALIZADO') { bg = '#dcfce7'; color = '#15803d'; }
    else if (s === 'RECHAZADO' || s === 'CANCELADO') { bg = '#fee2e2'; color = '#b91c1c'; }
    else if (s === 'PENDIENTE' || s === 'EN PROCESO') { bg = '#fff7ed'; color = '#c2410c'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '4px 10px', borderRadius: '20px', 
        fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase'
      }}>
        {s}
      </span>
    );
  };

  // Badge de Tipo de Ausencia
  const getTypeBadge = (type) => {
    const t = type ? type.toUpperCase() : "";
    let color = '#475569';
    let icon = 'bx-calendar';

    if (t.includes('VACACIONES')) { color = '#0ea5e9'; icon = 'bx-sun'; } // Azul
    else if (t.includes('ENFERMEDAD') || t.includes('SALUD')) { color = '#ef4444'; icon = 'bx-plus-medical'; } // Rojo
    else if (t.includes('MATERNIDAD') || t.includes('PATERNIDAD')) { color = '#8b5cf6'; icon = 'bx-baby-carriage'; } // Morado
    else if (t.includes('PERMISO')) { color = '#f59e0b'; icon = 'bx-briefcase'; } // Naranja

    return (
        <div style={{ display:'flex', alignItems:'center', gap:'6px', color: color, fontWeight:'600', fontSize:'0.85rem' }}>
            <i className={`bx ${icon}`}></i> {type}
        </div>
    );
  };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Cabecera Principal */}
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Auditoría &gt; Ausencias
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        Gestión de Ausencias
                    </h2>
                    <div style={{ color: '#64748b', marginTop: '5px', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'5px' }}>
                        <i className='bx bx-calendar-event'></i> Auditoría de solicitudes, aprobaciones y saldos
                    </div>
                </div>
                
                <button style={{ 
                    background: '#d51e37', border: 'none', borderRadius: '6px',
                    padding: '8px 16px', cursor: 'pointer', fontWeight: '600', color: '#fff',
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                    boxShadow: '0 2px 5px rgba(213, 30, 55, 0.3)'
                }}>
                    <i className='bx bx-download'></i> Reporte General
                </button>
            </div>
        </div>

        {/* --- BARRA DE NAVEGACIÓN (TABS) --- */}
        <div style={tabsContainerStyle}>
            {/* TAB ACTIVA */}
            <div style={activeTabItemStyle}>
                <i className='bx bx-file'></i> Solicitudes
            </div>

            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/ausencias/aprobaciones")}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
                <i className='bx bx-check-shield'></i> Aprobaciones
            </div>
            
            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/ausencias/saldos-vacaciones")}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
                <i className='bx bx-wallet'></i> Saldos Vacaciones
            </div>
        </div>

        {loading && <p style={{ textAlign:'center', marginTop:'40px' }}>Cargando solicitudes...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center', marginTop:'40px' }}>{err}</p>}

        {!loading && (
            <div style={cardBaseStyle}>
                
                {/* Header de la Tabla */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        Historial de Solicitudes
                    </h3>
                    <div style={{ position:'relative' }}>
                        <i className='bx bx-search' style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por empleado o tipo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding:'8px 10px 8px 30px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.85rem', width: '280px' }} 
                        />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Solicitante</th>
                            <th style={tableHeaderStyle}>Tipo y Motivo</th>
                            <th style={tableHeaderStyle}>Fechas Solicitadas</th>
                            <th style={tableHeaderStyle}>Duración</th>
                            <th style={tableHeaderStyle}>Estado</th>
                            <th style={tableHeaderStyle}>Nivel Actual</th>
                            <th style={tableHeaderStyle}>Fecha Solicitud</th>
                            <th style={{ ...tableHeaderStyle, textAlign:'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((r) => (
                            <tr key={r.id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #f8fafc' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                
                                {/* Columna Solicitante */}
                                <td style={tableCellStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '35px', height: '35px', borderRadius: '50%', 
                                            backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: '700', fontSize: '0.85rem'
                                        }}>
                                            {getInitials(r.nombres, r.apellidos)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.nombres} {r.apellidos}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Columna Tipo y Motivo */}
                                <td style={tableCellStyle}>
                                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                                        {getTypeBadge(r.tipo_ausencia)}
                                        <span style={{ fontSize:'0.8rem', color:'#64748b', maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                            {r.motivo || "Sin motivo detallado"}
                                        </span>
                                    </div>
                                </td>

                                {/* Columna Fechas */}
                                <td style={tableCellStyle}>
                                    <div style={{ fontSize:'0.9rem', color:'#334155', fontWeight:'500' }}>
                                        {fmtDate(r.fecha_inicio)} 
                                        <span style={{ margin:'0 5px', color:'#94a3b8' }}>➔</span> 
                                        {fmtDate(r.fecha_fin)}
                                    </div>
                                </td>

                                {/* Columna Duración */}
                                <td style={tableCellStyle}>
                                    <span style={{ fontWeight:'700', color:'#475569', background:'#f1f5f9', padding:'2px 8px', borderRadius:'6px', fontSize:'0.85rem' }}>
                                        {r.dias_habiles} días
                                    </span>
                                </td>

                                {/* Columna Estado */}
                                <td style={tableCellStyle}>
                                    {getStatusBadge(r.estado_label)}
                                </td>

                                {/* Columna Nivel */}
                                <td style={{ ...tableCellStyle, fontSize:'0.85rem', color:'#64748b' }}>
                                    <i className='bx bx-git-branch'></i> {r.flujo_actual}
                                </td>

                                {/* Columna Fecha Solicitud */}
                                <td style={{ ...tableCellStyle, fontSize:'0.85rem', color:'#94a3b8' }}>
                                    {fmtDT(r.creada_el)}
                                </td>

                                {/* Columna Acciones */}
                                <td style={{ ...tableCellStyle, textAlign:'right' }}>
                                    <button 
                                        style={{ 
                                            border:'none', background:'transparent', color:'#d51e37', cursor:'pointer', 
                                            fontSize:'1.2rem', padding:'6px', borderRadius:'50%', transition:'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        title="Ver detalle"
                                    >
                                        <i className='bx bx-show'></i>
                                    </button>
                                </td>

                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <i className='bx bx-calendar-x' style={{ fontSize:'2rem', marginBottom:'10px' }}></i>
                                    <p>No se encontraron solicitudes.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
}