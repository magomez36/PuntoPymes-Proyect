import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Asegúrate de que sea el Sidebar de RRHH/Admin
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// --- HELPERS ---
const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDateTime = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function AprobacionesSolicitudes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/ausencias/aprobaciones/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando aprobaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Función para los badges de acción
  const getActionBadge = (label) => {
      const l = (label || "").toLowerCase();
      let style = { bg: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }; // Default

      if (l.includes('aprob')) {
          style = { bg: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
      } else if (l.includes('rechaz') || l.includes('cancel')) {
          style = { bg: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      }

      return (
          <span style={{ 
              backgroundColor: style.bg, color: style.color, border: style.border,
              padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' 
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
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Historial de Aprobaciones</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Registro de auditoría de solicitudes procesadas.</p>
            </div>
            <Link to="/rrhh/ausencias/solicitudes" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px', fontSize:'0.9rem' }}>
                <i className='bx bx-arrow-back'></i> Volver a Pendientes
            </Link>
        </div>

        {err && <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontWeight: '600' }}>{err}</div>}

        {loading ? (
             <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando historial...</p>
        ) : (
            <div style={cardStyle}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Solicitante</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Detalle Permiso</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fechas</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Auditoría</th>
                                <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No hay registros de aprobaciones.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#fcfcfc'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='white'}>
                                        
                                        {/* Columna: Solicitante (Combinada) */}
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                                                    {r.nombres.charAt(0)}{r.apellidos.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{r.nombres} {r.apellidos}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Columna: Detalle (Tipo + Motivo) */}
                                        <td style={{ padding: '15px 20px', maxWidth: '250px' }}>
                                            <div style={{ marginBottom: '4px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                                                {r.tipo_ausencia}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.motivo}>
                                                {r.motivo || "Sin motivo"}
                                            </div>
                                        </td>

                                        {/* Columna: Fechas */}
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#334155' }}><strong>Del:</strong> {fmtDate(r.fecha_inicio)}</span>
                                                <span style={{ color: '#334155' }}><strong>Al:</strong> {fmtDate(r.fecha_fin)}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>({r.dias_habiles} días)</span>
                                            </div>
                                        </td>

                                        {/* Columna: Auditoría (Aprobador + Comentario) */}
                                        <td style={{ padding: '15px 20px', fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.aprobador}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{fmtDateTime(r.fecha)}</div>
                                            {r.comentario && (
                                                <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#64748b', fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '4px', borderLeft: '2px solid #cbd5e1' }}>
                                                    "{r.comentario}"
                                                </div>
                                            )}
                                        </td>

                                        {/* Columna: Resultado */}
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            {getActionBadge(r.accion_label)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}