import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AsignacionesKPI() {
  const navigate = useNavigate();

  const [asignaciones, setAsignaciones] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [kpis, setKpis] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        apiFetch("/api/auditor/desempeno/asignaciones-kpi/"),
        apiFetch("/api/auditor/desempeno/plantillas-kpi/"),
        apiFetch("/api/auditor/desempeno/kpis/"),
      ]);

      const d1 = await r1.json().catch(() => []);
      const d2 = await r2.json().catch(() => []);
      const d3 = await r3.json().catch(() => []);

      if (!r1.ok) throw new Error(d1?.detail || JSON.stringify(d1));
      if (!r2.ok) throw new Error(d2?.detail || JSON.stringify(d2));
      if (!r3.ok) throw new Error(d3?.detail || JSON.stringify(d3));

      setAsignaciones(Array.isArray(d1) ? d1 : []);
      setPlantillas(Array.isArray(d2) ? d2 : []);
      setKpis(Array.isArray(d3) ? d3 : []);
    } catch (e) {
      setErr(e?.message || "Error cargando desempeño/KPI.");
      setAsignaciones([]);
      setPlantillas([]);
      setKpis([]);
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
    height: '100%', 
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

  // --- ESTILOS DE LA BARRA DE PESTAÑAS (TABS) ---
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
    color: '#64748b', // Color inactivo
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  };

  const activeTabItemStyle = {
    ...tabItemStyle,
    color: '#d51e37', // Color activo (Rojo marca)
    borderBottom: '2px solid #d51e37'
  };

  const getTypeBadge = (type) => {
    const t = type ? type.toUpperCase() : "GENERAL";
    let bg = '#f1f5f9'; let color = '#64748b';

    if (t.includes('PUESTO')) { bg = '#dbeafe'; color = '#1e40af'; }
    else if (t.includes('DEPARTAMENTO')) { bg = '#f3e8ff'; color = '#6b21a8'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '4px 10px', borderRadius: '20px', 
        fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase'
      }}>
        {t}
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
                
                {/* Botón de Exportar (Opcional, estilo imagen) */}
                <button style={{ 
                    background: '#d51e37', border: 'none', borderRadius: '6px',
                    padding: '8px 16px', cursor: 'pointer', fontWeight: '600', color: '#fff',
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                    boxShadow: '0 2px 5px rgba(213, 30, 55, 0.3)'
                }}>
                    <i className='bx bx-export'></i> Exportar
                </button>
            </div>
        </div>

        {/* --- BARRA DE NAVEGACIÓN (TABS) --- */}
        <div style={tabsContainerStyle}>
            {/* Tab Activa: Asignaciones */}
            <div style={activeTabItemStyle}>
                <i className='bx bx-check-square'></i> Asignaciones
            </div>

            {/* Tabs Inactivas (Navegación) */}
            <div 
                style={tabItemStyle} 
                onClick={() => navigate("/auditor/desempeno/resultados-kpi")}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
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


        {loading && <p style={{ textAlign:'center', marginTop:'40px' }}>Cargando configuración...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center', marginTop:'40px' }}>{err}</p>}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* SECCIÓN 1: ASIGNACIONES (Full Width) */}
            <div style={cardBaseStyle}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        Asignaciones Activas
                    </h3>
                    <div style={{ position:'relative' }}>
                        <i className='bx bx-search' style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                        <input type="text" placeholder="Buscar empleado..." style={{ padding:'8px 10px 8px 30px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.85rem', width: '250px' }} />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Empleado</th>
                      <th style={tableHeaderStyle}>Modelo de Evaluación</th>
                      <th style={tableHeaderStyle}>Vigencia</th>
                      <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Estado</th>
                      <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map((r) => (
                      <tr key={r.id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #f8fafc' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        
                        <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Avatar */}
                                <div style={{ 
                                    width: '35px', height: '35px', borderRadius: '50%', 
                                    backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontWeight: '700', fontSize: '0.85rem'
                                }}>
                                    {getInitials(r.nombres, r.apellidos)}
                                </div>
                                {/* Info */}
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.nombres} {r.apellidos}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.email}</div>
                                </div>
                            </div>
                        </td>

                        <td style={tableCellStyle}>
                            <div style={{ 
                                display:'inline-flex', alignItems:'center', gap:'6px', fontWeight:'600', 
                                color: '#4338ca', background: '#e0e7ff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem'
                            }}>
                                {r.plantilla_nombre}
                            </div>
                        </td>

                        <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.85rem', color:'#64748b' }}>
                                <i className='bx bx-calendar' style={{ marginRight:'5px' }}></i>
                                {fmtDate(r.desde)} - {r.hasta ? fmtDate(r.hasta) : 'Indefinido'}
                            </div>
                        </td>

                        <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                            <span style={{ 
                                background:'#dcfce7', color:'#15803d', padding:'4px 12px', 
                                borderRadius:'20px', fontSize:'0.75rem', fontWeight:'700', textTransform:'uppercase',
                                display: 'inline-flex', alignItems: 'center', gap: '5px'
                            }}>
                                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#15803d' }}></span>
                                Vigente
                            </span>
                        </td>

                         <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <button style={{ border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:'1.2rem' }}>
                                <i className='bx bx-dots-vertical-rounded'></i>
                            </button>
                        </td>
                      </tr>
                    ))}
                    {asignaciones.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay asignaciones registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Footer simple de la tabla */}
                {asignaciones.length > 0 && (
                    <div style={{ textAlign:'center', marginTop:'15px', paddingTop:'15px', borderTop:'1px solid #f1f5f9' }}>
                        <span style={{ fontSize:'0.85rem', color:'#d51e37', fontWeight:'600', cursor:'pointer' }}>
                            Ver todas las asignaciones <i className='bx bx-chevron-down'></i>
                        </span>
                    </div>
                )}
            </div>

            {/* SECCIÓN 2: GRID DE CONFIGURACIÓN (2 COLUMNAS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
                
                {/* 2.1 PLANTILLAS */}
                <div style={cardBaseStyle}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0, display:'flex', alignItems:'center', gap:'10px' }}>
                            <i className='bx bx-copy-alt' style={{ color:'#94a3b8' }}></i> Plantillas de Objetivos
                        </h3>
                        <i className='bx bx-plus-circle' style={{ fontSize:'1.4rem', color:'#94a3b8', cursor:'pointer' }}></i>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                        {plantillas.map((p) => (
                          <div key={p.id} style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '15px', background: '#f8fafc' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                <span style={{ fontWeight:'700', color:'#334155' }}>{p.nombre}</span>
                                <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Rev. 1.0</span>
                            </div>
                            
                            {Array.isArray(p.objetivos_humanos) && p.objetivos_humanos.length > 0 ? (
                                <ul style={{ paddingLeft:'20px', margin:0, color:'#64748b', fontSize:'0.85rem' }}>
                                    {p.objetivos_humanos.slice(0, 3).map((o, idx) => (
                                        <li key={idx} style={{ marginBottom:'4px' }}>
                                            {o.kpi} <span style={{ color:'#cbd5e1' }}>|</span> {o.meta}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize:'0.8rem' }}>Sin objetivos</span>
                            )}
                          </div>
                        ))}
                    </div>
                </div>

                {/* 2.2 DICCIONARIO KPIS */}
                <div style={cardBaseStyle}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0, display:'flex', alignItems:'center', gap:'10px' }}>
                            <i className='bx bx-book-content' style={{ color:'#94a3b8' }}></i> Diccionario de KPIs
                        </h3>
                        <span style={{ fontSize:'0.8rem', color:'#d51e37', cursor:'pointer', fontWeight:'600' }}>Ver catálogo completo</span>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ ...tableHeaderStyle, paddingLeft:0 }}>Código</th>
                          <th style={tableHeaderStyle}>Indicador</th>
                          <th style={{ ...tableHeaderStyle, textAlign:'right', paddingRight:0 }}>Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpis.slice(0, 6).map((k) => (
                          <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ ...tableCellStyle, paddingLeft:0, fontWeight:'700', fontSize:'0.8rem', color:'#334155' }}>
                                {k.codigo}
                            </td>
                            <td style={{ ...tableCellStyle, color:'#64748b' }}>
                                {k.nombre}
                            </td>
                            <td style={{ ...tableCellStyle, textAlign:'right', paddingRight:0 }}>
                                <span style={{ background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'600', color:'#475569' }}>
                                    {k.unidad_label}
                                </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}