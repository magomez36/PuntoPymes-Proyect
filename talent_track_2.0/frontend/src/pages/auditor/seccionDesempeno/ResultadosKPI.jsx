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

export default function ResultadosKPI() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/desempeno/resultados-kpi/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando resultados KPI.");
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

  // Filtrado simple
  const filteredRows = rows.filter(r => 
    r.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.kpi_nombre.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Badge de Clasificación (Colores semánticos)
  const getClasificacionBadge = (label) => {
    const l = label ? label.toUpperCase() : "N/A";
    let bg = '#f1f5f9'; let color = '#64748b';

    if (l.includes('EXCELENTE') || l.includes('SOBRESALIENTE')) { bg = '#dcfce7'; color = '#15803d'; }
    else if (l.includes('BUENO') || l.includes('SATISFACTORIO')) { bg = '#dbeafe'; color = '#1e40af'; }
    else if (l.includes('REGULAR') || l.includes('MEJORABLE')) { bg = '#ffedd5'; color = '#c2410c'; }
    else if (l.includes('DEFICIENTE') || l.includes('BAJO')) { bg = '#fee2e2'; color = '#b91c1c'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '4px 10px', borderRadius: '20px', 
        fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase'
      }}>
        {l}
      </span>
    );
  };

  // Barra de progreso y color para cumplimiento
  const getCumplimientoVisual = (pct) => {
    const val = parseFloat(pct) || 0;
    let color = '#3b82f6'; // Azul por defecto
    if (val >= 100) color = '#15803d'; // Verde
    else if (val >= 80) color = '#1d4ed8'; // Azul fuerte
    else if (val >= 50) color = '#eab308'; // Amarillo
    else color = '#b91c1c'; // Rojo

    return (
        <div style={{ width: '100px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'2px', fontWeight:'700', color: color }}>
                <span>{val}%</span>
            </div>
            <div style={{ width:'100%', height:'6px', background:'#e2e8f0', borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ width: `${Math.min(val, 100)}%`, height:'100%', background: color, borderRadius:'3px' }}></div>
            </div>
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
                    <i className='bx bx-export'></i> Exportar Resultados
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

            {/* TAB ACTIVA */}
            <div style={activeTabItemStyle}>
                <i className='bx bx-line-chart'></i> Resultados KPI
            </div>
            
            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/desempeno/evaluaciones")}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
                <i className='bx bx-group'></i> Evaluaciones
            </div>
        </div>

        {loading && <p style={{ textAlign:'center', marginTop:'40px' }}>Cargando resultados...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center', marginTop:'40px' }}>{err}</p>}

        {!loading && (
            <div style={cardBaseStyle}>
                {/* Header de la Tabla */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        Registro de Mediciones
                    </h3>
                    <div style={{ position:'relative' }}>
                        <i className='bx bx-search' style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por empleado o KPI..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding:'8px 10px 8px 30px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.85rem', width: '280px' }} 
                        />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Empleado</th>
                            <th style={tableHeaderStyle}>Indicador KPI</th>
                            <th style={tableHeaderStyle}>Periodo / Fecha</th>
                            <th style={tableHeaderStyle}>Valor Registrado</th>
                            <th style={tableHeaderStyle}>Cumplimiento</th>
                            <th style={tableHeaderStyle}>Clasificación</th>
                            <th style={{ ...tableHeaderStyle, textAlign:'right' }}>Fuente</th>
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

                                {/* Columna KPI */}
                                <td style={tableCellStyle}>
                                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                                        <span style={{ fontSize:'0.7rem', fontWeight:'700', color:'#64748b', background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', width:'fit-content' }}>
                                            {r.kpi_codigo}
                                        </span>
                                        <span style={{ fontWeight:'600', color:'#334155' }}>{r.kpi_nombre}</span>
                                    </div>
                                </td>

                                {/* Columna Periodo */}
                                <td style={tableCellStyle}>
                                    <div style={{ fontSize:'0.9rem', color:'#1e293b', fontWeight:'500' }}>{r.periodo}</div>
                                    <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Calc: {fmtDT(r.calculado_el)}</div>
                                </td>

                                {/* Columna Valor */}
                                <td style={tableCellStyle}>
                                    <span style={{ fontWeight:'700', fontSize:'1rem', color:'#0f172a' }}>{r.valor}</span>
                                </td>

                                {/* Columna Cumplimiento (Barra visual) */}
                                <td style={tableCellStyle}>
                                    {getCumplimientoVisual(r.cumplimiento_pct)}
                                </td>

                                {/* Columna Clasificación */}
                                <td style={tableCellStyle}>
                                    {getClasificacionBadge(r.clasificacion_label)}
                                </td>

                                {/* Columna Fuente */}
                                <td style={{ ...tableCellStyle, textAlign:'right', fontSize:'0.85rem', color:'#64748b' }}>
                                    <i className='bx bx-data' style={{ marginRight:'5px' }}></i>
                                    {r.fuente}
                                </td>

                            </tr>
                        ))}
                        {filteredRows.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <i className='bx bx-pie-chart-alt-2' style={{ fontSize:'2rem', marginBottom:'10px' }}></i>
                                    <p>No se encontraron resultados de KPIs.</p>
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