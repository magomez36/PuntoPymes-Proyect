import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/SidebarEmpleado"; 
import { apiFetch } from "../../../services/api";
// Importamos los estilos globales donde está la marca de agua
import "../../../assets/css/admin-empresas.css"; 

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function fmtMinToH(min) {
  const m = Number(min || 0);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r}m`;
}

export default function HistorialJornadas() {
  const [month, setMonth] = useState(currentMonthStr());
  const [rows, setRows] = useState([]);
  const [resumen, setResumen] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (m) => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/empleado/jornadas/?month=${m}`);
      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?._non_json ? "Error de conexión." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      setResumen(data?.resumen || null);
      setRows(Array.isArray(data?.jornadas) ? data.jornadas : []);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas.");
      setResumen(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(month);
    // eslint-disable-next-line
  }, []);

  const onBuscar = async (e) => {
    e.preventDefault();
    await load(month);
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = {
    display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%',
  };

  const mainAreaStyle = {
    flex: 1,
    padding: '30px 30px 30px 110px', // Margen de seguridad para el Sidebar
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: '25px'
  };

  // Estilo para las tarjetas de resumen (KPIs)
  const kpiCardStyle = (borderColor) => ({
    flex: 1,
    backgroundColor: '#fff',
    border: `1px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
    minWidth: '180px'
  });

  return (
    // Clase layout-watermark para el fondo automático
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Historial de Jornadas</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Resumen mensual de horas y puntualidad.</p>
            </div>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* BARRA DE FILTRO */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <form onSubmit={onBuscar} style={{ display: "flex", gap: 15, alignItems: "end", flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '5px' }}>Seleccionar Mes</label>
                    <input 
                        type="month" 
                        value={month} 
                        onChange={(e) => setMonth(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', color: '#1f2937', fontFamily: 'inherit' }}
                    />
                </div>
                <button 
                    type="submit"
                    style={{ 
                        padding: '10px 30px', 
                        backgroundColor: '#0f172a', // Azul Corporativo para acción principal de consulta
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: '600', 
                        cursor: 'pointer', 
                        height: '42px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <i className='bx bx-search'></i> Consultar
                </button>
            </form>
        </div>

        {err && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: '600' }}>{err}</div>}

        {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                <i className='bx bx-loader-alt bx-spin' style={{ marginRight:'8px' }}></i> Cargando información...
            </p>
        ) : (
            <>
                {/* TARJETAS DE RESUMEN (KPIs con colores de marca) */}
                {resumen && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        
                        {/* Horas Trabajadas - Azul */}
                        <div style={kpiCardStyle('#e2e8f0')}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Horas Trabajadas</span>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '5px' }}>
                                {fmtMinToH(resumen.total_minutos_trabajados)}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total acumulado</span>
                        </div>

                        {/* Tardanzas - Rojo Talentrack */}
                        <div style={kpiCardStyle('#fee2e2')}>
                            <span style={{ fontSize: '0.8rem', color: '#D51F36', fontWeight: '700', textTransform: 'uppercase' }}>Tardanzas</span>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#D51F36', marginTop: '5px' }}>
                                {fmtMinToH(resumen.total_minutos_tardanza)}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#f87171' }}>Tiempo de retraso</span>
                        </div>

                        {/* Horas Extra - Verde (Positivo) */}
                        <div style={kpiCardStyle('#dcfce7')}>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>Horas Extra</span>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16a34a', marginTop: '5px' }}>
                                {fmtMinToH(resumen.total_minutos_extra)}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Tiempo adicional</span>
                        </div>
                        
                        {/* Días Laborados - Neutro */}
                        <div style={{ ...kpiCardStyle('#e2e8f0'), flex: '0 0 150px' }}>
                             <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Días Laborados</span>
                             <div style={{ fontSize: '2rem', fontWeight: '800', color: '#334155', marginTop: '5px' }}>
                                {resumen.dias}
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA DETALLADA */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Fecha</th>
                                    <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Entrada</th>
                                    <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Salida</th>
                                    <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Trabajado</th>
                                    <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Tardanza</th>
                                    <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Extras</th>
                                    <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#fcfcfc'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='white'}>
                                        <td style={{ padding: '15px 25px', color: '#1e293b', fontWeight: '600' }}>{r.fecha}</td>
                                        <td style={{ padding: '15px 25px', textAlign: 'center', color: '#475569' }}>{r.hora_primera_entrada || "—"}</td>
                                        <td style={{ padding: '15px 25px', textAlign: 'center', color: '#475569' }}>{r.hora_ultimo_salida || "—"}</td>
                                        
                                        <td style={{ padding: '15px 25px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                                            {r.minutos_trabajados ? fmtMinToH(r.minutos_trabajados) : "0"}
                                        </td>
                                        
                                        <td style={{ padding: '15px 25px', textAlign: 'center', fontWeight: '600', color: r.minutos_tardanza > 0 ? '#D51F36' : '#cbd5e1' }}>
                                            {r.minutos_tardanza ? `${r.minutos_tardanza} min` : "-"}
                                        </td>
                                        
                                        <td style={{ padding: '15px 25px', textAlign: 'center', fontWeight: '600', color: r.minutos_extra > 0 ? '#16a34a' : '#cbd5e1' }}>
                                            {r.minutos_extra ? fmtMinToH(r.minutos_extra) : "-"}
                                        </td>
                                        
                                        <td style={{ padding: '15px 25px', textAlign: 'center' }}>
                                            <span style={{ 
                                                backgroundColor: '#f1f5f9', color: '#475569', 
                                                padding: '4px 12px', borderRadius: '20px', 
                                                fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' 
                                            }}>
                                                {r.estado_label || r.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            No se encontraron registros para este mes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )}
      </main>
    </div>
  );
}