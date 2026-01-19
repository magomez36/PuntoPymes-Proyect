import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

// Formatea fecha y hora a solo hora HH:mm
const fmtTime = (iso) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Formatea fecha amigable (Ej: Lun, 19 Ene)
const fmtDateFriendly = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  const s = d.toLocaleDateString("es-EC", { weekday: 'short', day: 'numeric', month: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function JornadasEmpleados() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (f = "") => {
    setErr("");
    setLoading(true);
    try {
      const qs = f ? `?fecha=${encodeURIComponent(f)}` : "";
      const res = await apiFetch(`/api/auditor/asistencia/jornadas/${qs}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas calculadas.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
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
    textTransform: 'uppercase'
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
    borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px'
  };

  const activeTabItemStyle = { ...tabItemStyle, color: '#d51e37', borderBottom: '2px solid #d51e37' };

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : "N/A";
    let bg = '#f1f5f9'; let color = '#475569';
    if (s.includes('COMPLETA')) { bg = '#dcfce7'; color = '#15803d'; }
    else if (s.includes('FALTA')) { bg = '#fee2e2'; color = '#b91c1c'; }
    else if (s.includes('TARDANZA')) { bg = '#ffedd5'; color = '#c2410c'; }

    return (
      <span style={{ backgroundColor: bg, color: color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
        {s}
      </span>
    );
  };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Auditoría &gt; Asistencia</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Control de Asistencia</h2>
        </div>

        {/* --- BARRA DE PESTAÑAS (TABS) --- */}
        <div style={tabsContainerStyle}>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/asistencia/eventos")}>
                <i className='bx bx-list-check'></i> Eventos
            </div>
            <div style={activeTabItemStyle}>
                <i className='bx bx-history'></i> Jornadas
            </div>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/asistencia/turnos-empleados")}>
                <i className='bx bx-calendar-event'></i> Turnos
            </div>
        </div>

        <div style={cardBaseStyle}>
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Jornadas Calculadas</h3>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                    <button onClick={() => load(fecha)} style={{ background: '#d51e37', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Aplicar</button>
                    <button onClick={() => { setFecha(""); load(""); }} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Limpiar</button>
                </div>
            </div>

            {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Cargando jornadas...</p>}
            {err && <p style={{ color: "crimson", textAlign: 'center', padding: '40px' }}>{err}</p>}

            {!loading && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Empleado</th>
                            <th style={tableHeaderStyle}>Fecha</th>
                            <th style={tableHeaderStyle}>Entrada</th>
                            <th style={tableHeaderStyle}>Salida</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Min. Trabajados</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Tardanza</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Extra</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                <td style={tableCellStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b' }}>
                                            {getInitials(r.nombres, r.apellidos)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{r.nombres} {r.apellidos}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ ...tableCellStyle, fontWeight: '600' }}>{fmtDateFriendly(r.fecha)}</td>
                                <td style={tableCellStyle}>{fmtTime(r.hora_primera_entrada)}</td>
                                <td style={tableCellStyle}>{fmtTime(r.hora_ultimo_salida)}</td>
                                <td style={{ ...tableCellStyle, textAlign: 'center', fontWeight: '700' }}>{r.minutos_trabajados} m</td>
                                <td style={{ ...tableCellStyle, textAlign: 'center', color: r.minutos_tardanza > 0 ? '#b91c1c' : '#94a3b8', fontWeight: '700' }}>
                                    {r.minutos_tardanza > 0 ? `+${r.minutos_tardanza}` : '0'} m
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'center', color: r.minutos_extra > 0 ? '#15803d' : '#94a3b8', fontWeight: '700' }}>
                                    {r.minutos_extra > 0 ? `+${r.minutos_extra}` : '0'} m
                                </td>
                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>{getStatusBadge(r.estado_label)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </main>
    </div>
  );
}