import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; 

// --- HELPERS ---
const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const fmtTime = (iso) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function JornadasEmpleados() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); 

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/jornadas-calculadas/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
      const s = q.toLowerCase();
      if (!s) return rows;
      return rows.filter(r => 
          (r.nombres + " " + r.apellidos).toLowerCase().includes(s) ||
          (r.email || "").toLowerCase().includes(s)
      );
  }, [rows, q]);

  const getStatusBadge = (label) => {
      const l = (label || "").toLowerCase();
      let style = { bg: '#f3f4f6', color: '#64748b' }; 

      if (l.includes('normal') || l.includes('ok')) {
          style = { bg: '#dcfce7', color: '#166534' }; 
      } else if (l.includes('tardanza') || l.includes('incompleto')) {
          style = { bg: '#fef3c7', color: '#d97706' }; 
      } else if (l.includes('falta') || l.includes('ausencia')) {
          style = { bg: '#fee2e2', color: '#991b1b' }; 
      } else if (l.includes('extra')) {
          style = { bg: '#e0f2fe', color: '#0284c7' }; 
      }

      return (
          <span style={{ 
              backgroundColor: style.bg, color: style.color,
              padding: '4px 10px', borderRadius: '12px', 
              fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' 
          }}>
              {label}
          </span>
      );
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' };
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Jornadas Calculadas</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Resumen de asistencia procesada y tiempos.</p>
            </div>
            <Link to="/rrhh/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px', fontSize:'0.9rem' }}>
                <i className='bx bx-arrow-back'></i> Volver al inicio
            </Link>
        </div>

        <div style={cardStyle}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                    <input 
                        placeholder="Buscar por empleado..." 
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Empleado</th>
                            <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fecha</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Horario (E/S)</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tiempo Total</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Novedades</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Procesando jornadas...</td></tr>}
                        
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No se encontraron registros.</td></tr>
                        )}

                        {!loading && filtered.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#fcfcfc'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='white'}>
                                
                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                                            {r.nombres?.charAt(0)}{r.apellidos?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{r.nombres} {r.apellidos}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email}</div>
                                        </div>
                                    </div>
                                </td>

                                <td style={{ padding: '15px 20px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                                    {fmtDate(r.fecha)}
                                </td>

                                {/* CAMBIO DE ICONOS AQUÍ */}
                                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', gap: '4px', alignItems: 'center' }}>
                                        {/* Icono Play (Verde) para Entrada */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '600' }}>
                                            <i className='bx bx-play' style={{ fontSize: '1.1rem' }}></i> {fmtTime(r.hora_primera_entrada)}
                                        </div>
                                        {/* Icono Stop (Rojo) para Salida */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991b1b', fontWeight: '600' }}>
                                            <i className='bx bx-stop' style={{ fontSize: '1.1rem' }}></i> {fmtTime(r.hora_ultimo_salida)}
                                        </div>
                                    </div>
                                </td>

                                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                                        {formatDuration(r.minutos_trabajados)}
                                    </div>
                                </td>

                                <td style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        {r.minutos_tardanza > 0 && (
                                            <span style={{ color: '#d97706', backgroundColor: '#fffbeb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                                Late: {formatDuration(r.minutos_tardanza)}
                                            </span>
                                        )}
                                        {r.minutos_extra > 0 && (
                                            <span style={{ color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                                Extra: {formatDuration(r.minutos_extra)}
                                            </span>
                                        )}
                                        {r.minutos_tardanza === 0 && r.minutos_extra === 0 && (
                                            <span style={{ color: '#cbd5e1' }}>-</span>
                                        )}
                                    </div>
                                </td>

                                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                    {getStatusBadge(r.estado_label)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </main>
    </div>
  );
}