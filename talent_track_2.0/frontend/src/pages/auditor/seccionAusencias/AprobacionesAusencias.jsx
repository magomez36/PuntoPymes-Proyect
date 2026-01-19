import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AprobacionesAusencias() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/ausencias/aprobaciones/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando aprobaciones.");
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

  const filteredRows = rows.filter(r => 
    r.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.aprobador_nombre.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getActionBadge = (label) => {
    const l = label ? label.toUpperCase() : "N/A";
    let bg = '#f1f5f9'; let color = '#475569';

    if (l.includes('APROBAR') || l.includes('APROBADO')) { bg = '#dcfce7'; color = '#15803d'; }
    else if (l.includes('RECHAZAR') || l.includes('RECHAZADO')) { bg = '#fee2e2'; color = '#b91c1c'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '4px 10px', borderRadius: '20px', 
        fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
      }}>
        {l}
      </span>
    );
  };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Auditoría &gt; Ausencias
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                Gestión de Ausencias
            </h2>
        </div>

        <div style={tabsContainerStyle}>
            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/ausencias/solicitudes")}
            >
                <i className='bx bx-file'></i> Solicitudes
            </div>
            <div style={activeTabItemStyle}>
                <i className='bx bx-check-shield'></i> Aprobaciones
            </div>
            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/ausencias/saldos-vacaciones")}
            >
                <i className='bx bx-wallet'></i> Saldos Vacaciones
            </div>
        </div>

        {!loading && (
            <div style={cardBaseStyle}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        Log de Aprobaciones
                    </h3>
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.85rem' }} 
                    />
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Solicitante</th>
                            <th style={tableHeaderStyle}>Ausencia</th>
                            <th style={tableHeaderStyle}>Periodo</th>
                            <th style={tableHeaderStyle}>Decisión</th>
                            <th style={tableHeaderStyle}>Aprobador</th>
                            <th style={tableHeaderStyle}>Comentarios</th>
                            <th style={{ ...tableHeaderStyle, textAlign:'right' }}>Fecha Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((r) => (
                            <tr key={r.id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #f8fafc' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                <td style={tableCellStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '35px', height: '35px', borderRadius: '50%', 
                                            backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
                                        }}>
                                            {getInitials(r.nombres, r.apellidos)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{r.nombres} {r.apellidos}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={tableCellStyle}>
                                    <div style={{ fontWeight: '600' }}>{r.tipo_ausencia}</div>
                                    <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{r.dias_habiles} días</div>
                                </td>
                                <td style={tableCellStyle}>
                                    <div style={{ fontSize:'0.85rem' }}>{fmtDate(r.fecha_inicio)} al {fmtDate(r.fecha_fin)}</div>
                                </td>
                                <td style={tableCellStyle}>{getActionBadge(r.accion_label)}</td>
                                <td style={tableCellStyle}>{r.aprobador_nombre}</td>
                                <td style={{ ...tableCellStyle, maxWidth:'200px', fontSize:'0.85rem', color:'#64748b', fontStyle:'italic' }}>
                                    {r.comentario || "Sin comentarios"}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign:'right', fontSize:'0.85rem', color:'#94a3b8' }}>
                                    {fmtDT(r.fecha)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
}