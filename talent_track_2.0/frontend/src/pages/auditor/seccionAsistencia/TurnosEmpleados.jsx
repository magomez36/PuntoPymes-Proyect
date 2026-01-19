import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

export default function TurnosEmpleados() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/asistencia/turnos-empleados/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando turnos por empleado.");
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
    minHeight: '400px'
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
    display: 'flex', gap: '30px', borderBottom: '1px solid #e2e8f0', marginBottom: '25px', marginTop: '25px'
  };

  const tabItemStyle = {
    padding: '10px 0 15px 0', fontSize: '0.95rem', fontWeight: '600', color: '#64748b', cursor: 'pointer',
    borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
  };

  const activeTabItemStyle = { ...tabItemStyle, color: '#d51e37', borderBottom: '2px solid #d51e37' };

  const getRotativoBadge = (label) => {
    const isRotativo = label?.toUpperCase() === "SÍ";
    return (
      <span style={{ 
        backgroundColor: isRotativo ? '#fef2f2' : '#f1f5f9', 
        color: isRotativo ? '#d51e37' : '#64748b', 
        padding: '4px 10px', borderRadius: '20px', 
        fontSize: '0.75rem', fontWeight: '700' 
      }}>
        {label}
      </span>
    );
  };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Cabecera */}
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Auditoría &gt; Asistencia</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Control de Asistencia</h2>
        </div>

        {/* --- BARRA DE PESTAÑAS (TABS) --- */}
        <div style={tabsContainerStyle}>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/asistencia/eventos")}>
                <i className='bx bx-list-check'></i> Eventos
            </div>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/asistencia/jornadas")}>
                <i className='bx bx-history'></i> Jornadas
            </div>
            <div style={activeTabItemStyle}>
                <i className='bx bx-calendar-event'></i> Turnos
            </div>
        </div>

        <div style={cardBaseStyle}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Planificación de Turnos</h3>
                
                <div style={{ position:'relative' }}>
                    <i className='bx bx-search' style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}></i>
                    <input 
                        type="text" 
                        placeholder="Buscar empleado..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding:'8px 10px 8px 30px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.85rem', width: '250px' }} 
                    />
                </div>
            </div>

            {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Cargando turnos...</p>}
            {err && <p style={{ color: "crimson", textAlign: 'center', padding: '40px' }}>{err}</p>}

            {!loading && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Empleado</th>
                            <th style={tableHeaderStyle}>Horario</th>
                            <th style={tableHeaderStyle}>Nombre del Turno</th>
                            <th style={tableHeaderStyle}>Días Asignados</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Rotativo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.filter(r => 
                            r.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.apellidos.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((r) => (
                            <tr key={r.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#15803d' }}>
                                        <i className='bx bx-time-five'></i>
                                        {r.hora_inicio} - {r.hora_fin}
                                    </div>
                                </td>
                                <td style={{ ...tableCellStyle, fontWeight: '500' }}>{r.turno_nombre}</td>
                                <td style={{ ...tableCellStyle, color: '#64748b', fontSize: '0.85rem' }}>
                                    {r.dias_semana_label}
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                    {getRotativoBadge(r.es_rotativo_label)}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <i className='bx bx-calendar-x' style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                    <p>No se encontraron turnos asignados.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </main>
    </div>
  );
}