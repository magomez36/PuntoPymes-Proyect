import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC", { dateStyle: 'medium', timeStyle: 'short' });
};

export default function EvaluacionesDesempeno() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/desempeno/evaluaciones/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando evaluaciones.");
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
    r.evaluador_nombre.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Badge Puntaje
  const getScoreBadge = (score) => {
    const s = parseFloat(score) || 0;
    let color = '#475569';
    let bg = '#f1f5f9';

    if (s >= 90) { color = '#15803d'; bg = '#dcfce7'; } // Excelente
    else if (s >= 80) { color = '#1e40af'; bg = '#dbeafe'; } // Bueno
    else if (s >= 70) { color = '#a16207'; bg = '#fef9c3'; } // Regular
    else { color = '#b91c1c'; bg = '#fee2e2'; } // Deficiente

    return (
        <span style={{ 
            backgroundColor: bg, color: color, fontWeight: '800', 
            padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem'
        }}>
            {s}/100
        </span>
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
                Auditoría &gt; Desempeño
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        Gestión de Desempeño
                    </h2>
                    <div style={{ color: '#64748b', marginTop: '5px', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'5px' }}>
                        <i className='bx bx-bar-chart-alt-2'></i> Auditoría de KPIs, Asignaciones y Resultados
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
            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/desempeno/asignaciones-kpi")}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
                <i className='bx bx-check-square'></i> Asignaciones
            </div>

            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/desempeno/resultados-kpi")}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
                <i className='bx bx-line-chart'></i> Resultados KPI
            </div>
            
            {/* TAB ACTIVA */}
            <div style={activeTabItemStyle}>
                <i className='bx bx-group'></i> Evaluaciones
            </div>
        </div>

        {loading && <p style={{ textAlign:'center', marginTop:'40px' }}>Cargando evaluaciones...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center', marginTop:'40px' }}>{err}</p>}

        {!loading && (
            <div style={cardBaseStyle}>
                {/* Header de la Tabla */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        Historial de Evaluaciones
                    </h3>
                    <div style={{ position:'relative' }}>
                        <i className='bx bx-search' style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por evaluado o evaluador..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding:'8px 10px 8px 30px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.85rem', width: '280px' }} 
                        />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Empleado Evaluado</th>
                            <th style={tableHeaderStyle}>Detalles de Evaluación</th>
                            <th style={tableHeaderStyle}>Competencias Evaluadas</th>
                            <th style={tableHeaderStyle}>Resultado</th>
                            <th style={tableHeaderStyle}>Fecha</th>
                            <th style={{ ...tableHeaderStyle, textAlign:'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((r) => (
                            <tr key={r.id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #f8fafc' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                
                                {/* Columna Empleado */}
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

                                {/* Columna Detalles (Tipo/Evaluador) */}
                                <td style={tableCellStyle}>
                                    <div style={{ fontSize:'0.9rem', fontWeight:'600', color:'#334155' }}>{r.tipo_label}</div>
                                    <div style={{ fontSize:'0.8rem', color:'#64748b', display:'flex', alignItems:'center', gap:'4px' }}>
                                        <i className='bx bx-user-voice'></i> Por: {r.evaluador_nombre}
                                    </div>
                                    <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'2px' }}>Periodo: {r.periodo}</div>
                                </td>

                                {/* Columna Competencias (Resumen) */}
                                <td style={tableCellStyle}>
                                    {Array.isArray(r.instrumento_items) && r.instrumento_items.length > 0 ? (
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', maxWidth:'300px' }}>
                                            {r.instrumento_items.slice(0, 3).map((it, idx) => (
                                                <span key={idx} style={{ 
                                                    background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'4px', 
                                                    padding:'2px 6px', fontSize:'0.75rem', color:'#475569'
                                                }}>
                                                    {it.competencia}
                                                </span>
                                            ))}
                                            {r.instrumento_items.length > 3 && (
                                                <span style={{ fontSize:'0.75rem', color:'#64748b', alignSelf:'center' }}>
                                                    +{r.instrumento_items.length - 3} más
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color:'#94a3b8', fontStyle:'italic' }}>Sin competencias</span>
                                    )}
                                </td>

                                {/* Columna Puntaje */}
                                <td style={tableCellStyle}>
                                    {getScoreBadge(r.puntaje_total)}
                                </td>

                                {/* Columna Fecha */}
                                <td style={{ ...tableCellStyle, color:'#64748b', fontSize:'0.85rem' }}>
                                    {fmtDT(r.fecha)}
                                </td>

                                {/* Columna Acciones */}
                                <td style={{ ...tableCellStyle, textAlign:'right' }}>
                                    <button 
                                        style={{ 
                                            border:'none', background:'transparent', color:'#64748b', cursor:'pointer', 
                                            fontSize:'1.2rem', padding:'6px', borderRadius:'50%', transition:'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        title="Ver detalles"
                                    >
                                        <i className='bx bx-show'></i>
                                    </button>
                                </td>

                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <i className='bx bx-clipboard' style={{ fontSize:'2rem', marginBottom:'10px' }}></i>
                                    <p>No se encontraron evaluaciones.</p>
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