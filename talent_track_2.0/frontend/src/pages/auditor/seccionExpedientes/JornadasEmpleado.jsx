import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

// Formatea solo la hora (HH:mm)
const fmtTime = (iso) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Formatea fecha amigable (Lun, 20 Ene)
const fmtDateFriendly = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  // Capitalizamos la primera letra
  const s = d.toLocaleDateString("es-EC", { weekday: 'short', day: 'numeric', month: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function JornadasEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleado, setEmpleado] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/expedientes/empleados/${id}/jornadas/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));

      setEmpleado(d?.empleado || null);
      setRows(Array.isArray(d?.results) ? d.results : []);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas.");
      setEmpleado(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const getInitials = (name, surname) => {
    const n = name ? name.charAt(0).toUpperCase() : '';
    const s = surname ? surname.charAt(0).toUpperCase() : '';
    return n + s;
  };

  // --- Estilos ---
  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '20px',
    marginTop: '20px',
    overflowX: 'auto',
    maxWidth: '95%', 
    margin: '20px auto',
    position: 'relative', 
    zIndex: 1 
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

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : "DESCONOCIDO";
    let bg = '#f1f5f9'; let color = '#475569';

    if (s.includes('COMPLETA') || s === 'ASISTENCIA') { bg = '#dcfce7'; color = '#15803d'; }
    else if (s.includes('FALTA') || s.includes('AUSENCIA')) { bg = '#fee2e2'; color = '#b91c1c'; }
    else if (s.includes('TARDANZA') || s.includes('INCOMPLETA')) { bg = '#ffedd5'; color = '#c2410c'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '4px 10px', borderRadius: '20px', 
        fontSize: '0.75rem', fontWeight: '700', 
        textTransform: 'uppercase', letterSpacing: '0.5px'
      }}>
        {s}
      </span>
    );
  };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Cabecera */}
        <div style={{ maxWidth: '95%', margin: '0 auto 20px auto' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Expedientes &gt; Empleado &gt; Asistencia
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        Historial de Jornadas
                    </h2>
                    <p style={{ color: '#64748b', margin: '5px 0 0', fontSize: '0.95rem' }}>
                        Registro detallado de entradas, salidas y cumplimiento de horarios.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => navigate(`/auditor/expedientes/empleados/${id}`)}
                        style={{ 
                            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '8px 16px', cursor: 'pointer', fontWeight: '600', color: '#475569',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                    >
                        <i className='bx bx-arrow-back'></i> Volver
                    </button>
                    <button 
                        onClick={() => navigate(`/auditor/expedientes/empleados/${id}/contrato`)}
                        style={{ 
                            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '8px 16px', cursor: 'pointer', fontWeight: '600', color: '#475569',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d51e37'; e.currentTarget.style.color = '#d51e37'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                    >
                        <i className='bx bx-file'></i> Ver Contrato
                    </button>
                </div>
            </div>
        </div>

        {/* Resumen de Empleado (Mini Card) */}
        {empleado && (
             <div style={{ ...cardStyle, marginTop: 0, padding: '15px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    backgroundColor: '#e2e8f0', color: '#475569', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                }}>
                    {getInitials(empleado.nombres, empleado.apellidos)}
                </div>
                <div>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{empleado.nombres} {empleado.apellidos}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{empleado.email}</div>
                </div>
             </div>
        )}

        {loading && <p style={{ textAlign:'center', marginTop:'20px' }}>Cargando asistencia...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center', marginTop:'20px' }}>{err}</p>}

        {!loading && (
          <div style={cardStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Fecha</th>
                  <th style={tableHeaderStyle}>Entrada</th>
                  <th style={tableHeaderStyle}>Salida</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Trabajado</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Tardanza</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Extra</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                    
                    {/* Fecha con estilo amigable */}
                    <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <i className='bx bx-calendar' style={{ color: '#94a3b8' }}></i>
                            {fmtDateFriendly(r.fecha)}
                        </div>
                    </td>

                    {/* Hora Entrada */}
                    <td style={tableCellStyle}>
                        {r.hora_primera_entrada ? (
                            <span style={{ color: '#15803d', fontWeight: '500', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                {fmtTime(r.hora_primera_entrada)}
                            </span>
                        ) : (
                            <span style={{ color: '#94a3b8' }}>--:--</span>
                        )}
                    </td>

                    {/* Hora Salida */}
                    <td style={tableCellStyle}>
                        {r.hora_ultimo_salida ? (
                             <span style={{ color: '#b91c1c', fontWeight: '500', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                {fmtTime(r.hora_ultimo_salida)}
                             </span>
                        ) : (
                            <span style={{ color: '#94a3b8' }}>--:--</span>
                        )}
                    </td>

                    {/* Minutos Trabajados */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                            {r.minutos_trabajados} min
                        </span>
                    </td>

                    {/* Minutos Tardanza (Rojo si hay tardanza) */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                        {r.minutos_tardanza > 0 ? (
                            <span style={{ color: '#b91c1c', fontWeight: '700' }}>+{r.minutos_tardanza} m</span>
                        ) : (
                            <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                    </td>

                    {/* Minutos Extra (Verde si hay extra) */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                         {r.minutos_extra > 0 ? (
                            <span style={{ color: '#15803d', fontWeight: '700' }}>+{r.minutos_extra} m</span>
                        ) : (
                            <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                    </td>

                    {/* Estado Badge */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                        {getStatusBadge(r.estado_label)}
                    </td>

                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className='bx bx-calendar-x' style={{fontSize:'2rem', marginBottom:'10px'}}></i>
                        <p>No hay registros de asistencia para este empleado.</p>
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