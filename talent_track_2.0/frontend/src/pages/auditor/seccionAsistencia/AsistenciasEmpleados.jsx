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

export default function AsistenciasEmpleados() {
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
      const res = await apiFetch(`/api/auditor/asistencia/eventos/${qs}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando eventos de asistencia.");
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
    gap: '8px'
  };

  const activeTabItemStyle = {
    ...tabItemStyle,
    color: '#d51e37',
    borderBottom: '2px solid #d51e37'
  };

  const getTipoBadge = (label) => {
    const l = label ? label.toUpperCase() : "";
    let color = '#3b82f6';
    let bg = '#eff6ff';
    if (l.includes('SALIDA')) { color = '#f97316'; bg = '#fff7ed'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, padding: '4px 10px', 
        borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' 
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
        
        {/* Cabecera */}
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Auditoría &gt; Asistencia</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Control de Asistencia</h2>
        </div>

        {/* --- BARRA DE NAVEGACIÓN (TABS) --- */}
        <div style={tabsContainerStyle}>
            <div style={activeTabItemStyle}>
                <i className='bx bx-list-check'></i> Eventos
            </div>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/asistencia/jornadas")}>
                <i className='bx bx-history'></i> Jornadas
            </div>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/asistencia/turnos-empleados")}>
                <i className='bx bx-calendar-event'></i> Turnos
            </div>
        </div>

        <div style={cardBaseStyle}>
            {/* Toolbar de Filtros */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Registro de Eventos</h3>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <button onClick={() => load(fecha)} style={{ background: '#d51e37', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Filtrar</button>
                    <button onClick={() => { setFecha(""); load(""); }} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Limpiar</button>
                </div>
            </div>

            {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Cargando eventos...</p>}
            {err && <p style={{ color: "crimson", textAlign: 'center', padding: '40px' }}>{err}</p>}

            {!loading && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Empleado</th>
                            <th style={tableHeaderStyle}>Tipo</th>
                            <th style={tableHeaderStyle}>Fecha / Hora</th>
                            <th style={tableHeaderStyle}>Fuente</th>
                            <th style={tableHeaderStyle}>IP</th>
                            <th style={tableHeaderStyle}>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                                <td style={tableCellStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                            {getInitials(r.nombres, r.apellidos)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{r.nombres} {r.apellidos}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={tableCellStyle}>{getTipoBadge(r.tipo_label)}</td>
                                <td style={{ ...tableCellStyle, fontWeight: '600' }}>{fmtDT(r.registrado_el)}</td>
                                <td style={tableCellStyle}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        <i className='bx bx-devices' style={{ marginRight: '5px' }}></i>
                                        {r.fuente_label}
                                    </span>
                                </td>
                                <td style={{ ...tableCellStyle, fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>{r.ip || "N/A"}</td>
                                <td style={{ ...tableCellStyle, maxWidth: '200px', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                                    {r.observaciones || "—"}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <i className='bx bx-info-circle' style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                    <p>No se encontraron eventos registrados.</p>
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