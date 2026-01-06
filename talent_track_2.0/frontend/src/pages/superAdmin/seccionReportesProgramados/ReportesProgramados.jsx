import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

const TIPOS = { 1: "Asistencia", 2: "KPI", 3: "Ausencias" };
const FORMATOS = { 1: "CSV", 2: "XLS", 3: "PDF" };

// --- HELPER: TRADUCTOR DE CRON A LENGUAJE HUMANO ---
const interpretarCron = (cronExpression) => {
    if (!cronExpression) return "No definido";
    const parts = cronExpression.split(' ');
    
    // Validación simple
    if (parts.length < 5) return cronExpression;

    const [min, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Caso 1: Diario (ej: 0 8 * * *)
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        return `Diario a las ${hour}:${min.toString().padStart(2, '0')}`;
    }

    // Caso 2: Semanal (ej: 0 9 * * 1) -> 1 suele ser Lunes
    if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
        const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const diaNombre = dias[parseInt(dayOfWeek)] || "Día " + dayOfWeek;
        return `Cada ${diaNombre} a las ${hour}:${min.toString().padStart(2, '0')}`;
    }

    // Caso 3: Mensual (ej: 0 8 1 * *)
    if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
        return `El día ${dayOfMonth} de cada mes, ${hour}:${min.toString().padStart(2, '0')}`;
    }

    // Caso por defecto
    return "Personalizado";
};

export default function ReportesProgramados() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // Estados
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para minimizar/maximizar los tips
  const [showTips, setShowTips] = useState(true);

  // Modales
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- CARGA DE DATOS ---
  const loadReportes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/reportes-programados/`, { 
          headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Error cargando reportes");
      
      const data = await res.json();
      let lista = [];
      if (Array.isArray(data)) lista = data;
      else if (data.results) lista = data.results;

      setRows(lista);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadReportes();
  }, [token, navigate]);

  // --- HELPERS VISUALES ---
  const showJson = (obj) => {
    if (!obj) return <span style={{color:'#94a3b8', fontStyle:'italic'}}>Sin parámetros</span>;
    try {
      const str = JSON.stringify(obj).replace(/[{"}]/g, '').replace(/,/g, ', ');
      return <span style={{fontFamily:'monospace', fontSize:'0.8rem', color:'#475569'}}>{str.substring(0, 30)}{str.length > 30 ? '...' : ''}</span>;
    } catch { return "Error formato"; }
  };

  const showDestinatarios = (value) => {
    if (!value) return <span style={{color:'#94a3b8'}}>Sin destinatarios</span>;
    const lista = Array.isArray(value) ? value : String(value).split(',');
    return (
        <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
            {lista.slice(0, 2).map((d, i) => (
                <span key={i} style={{fontSize:'0.75rem', color:'#334155'}}><i className='bx bx-envelope'></i> {d.trim()}</span>
            ))}
            {lista.length > 2 && <span style={{fontSize:'0.7rem', color:'#64748b'}}>+{lista.length - 2} más...</span>}
        </div>
    );
  };

  // --- ACCIONES ---
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowWarningModal(true);
  };

  const proceedToConfirm = () => {
    setShowWarningModal(false);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await apiFetch(`${API_BASE}/reportes-programados/${itemToDelete.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
          alert("No se pudo eliminar.");
          setShowConfirmModal(false);
          return;
      }

      setShowConfirmModal(false);
      setSuccessTitle("Reporte Eliminado");
      setSuccessMessage(`La programación "${itemToDelete.nombre}" ha sido eliminada.`);
      setShowSuccessModal(true);
      loadReportes();
    } catch (e) {
      alert("Error eliminando.");
      setShowConfirmModal(false);
    }
  };

  const toggleActivo = async (id) => {
    try {
      const res = await apiFetch(`${API_BASE}/reportes-programados/${id}/toggle-activo/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
          loadReportes();
          setSuccessTitle("Estado Actualizado");
          setSuccessMessage("La programación del reporte ha cambiado de estado.");
          setShowSuccessModal(true);
      }
    } catch (e) { alert("Error cambiando estado."); }
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div className="content-area" style={{ padding: '32px' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Reportes Programados</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Gestiona el envío automático de informes por correo.</p>
                </div>
                <Link to="/admin/reportes-programados/crear" style={{ textDecoration: 'none' }}>
                    <button className="btn-create" style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                        <i className='bx bx-time-five' style={{fontSize: '1.2rem'}}></i> Programar Reporte
                    </button>
                </Link>
            </div>

            {/* --- SECCIÓN DE TIPS (COLLAPSIBLE) --- */}
            <div style={{ 
                backgroundColor: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                padding: '16px 20px', 
                borderRadius: '12px', 
                marginBottom: '24px', 
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.05)',
                transition: 'all 0.3s ease'
            }}>
                {/* Cabecera del Tip (Siempre visible) */}
                <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setShowTips(!showTips)}
                >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <i className='bx bx-bulb' style={{ fontSize: '1.2rem' }}></i>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e3a8a', fontWeight: '700' }}>
                            ¿Cómo interpretar la Frecuencia de Envío?
                        </h4>
                    </div>
                    
                    {/* Botón Toggle */}
                    <button style={{
                        background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600'
                    }}>
                        {showTips ? 'Minimizar' : 'Ver guía'}
                        <i className={`bx ${showTips ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.2rem' }}></i>
                    </button>
                </div>

                {/* Contenido (Condicional) */}
                {showTips && (
                    <div style={{ marginLeft: '48px', marginTop: '12px', animation: 'fadeIn 0.3s' }}>
                        <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                            El sistema traduce automáticamente el código técnico (Cron) a un lenguaje humano en la tabla.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            {/* Ejemplo 1 */}
                            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform:'uppercase', fontWeight:'bold', display:'block', marginBottom:'4px' }}>Ejemplo Semanal:</span>
                                <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>Cada Lunes a las 08:00</div>
                                <code style={{ fontSize: '0.75rem', color: '#94a3b8', background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', marginTop:'4px', display:'inline-block' }}>0 8 * * 1</code>
                            </div>

                            {/* Ejemplo 2 */}
                            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform:'uppercase', fontWeight:'bold', display:'block', marginBottom:'4px' }}>Ejemplo Mensual:</span>
                                <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>El día 1 de cada mes, 09:00</div>
                                <code style={{ fontSize: '0.75rem', color: '#94a3b8', background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', marginTop:'4px', display:'inline-block' }}>0 9 1 * *</code>
                            </div>

                            {/* Nota */}
                            <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fcd34d', display:'flex', alignItems:'center', gap:'10px' }}>
                                <i className='bx bx-error-circle' style={{color:'#d97706', fontSize:'1.5rem'}}></i>
                                <p style={{ margin:0, fontSize: '0.8rem', color: '#92400e', lineHeight:'1.3' }}>
                                    Si ves <strong>"Personalizado"</strong>, la configuración es compleja; guíate por el código.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TABLA */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Nombre Tarea</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empresa / Tipo</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Frecuencia</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Formato</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Destinatarios</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Cargando programaciones...</td></tr>}
                            
                            {!loading && rows.length === 0 && (
                                <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>No hay reportes programados.</td></tr>
                            )}

                            {!loading && rows.map((r) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>
                                        {r.nombre}
                                        <div style={{marginTop:'4px'}}>{showJson(r.parametros)}</div>
                                    </td>

                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                                        <div style={{fontWeight:'600', color:'#334155'}}>{r.empresa_razon_social || "—"}</div>
                                        <span style={{fontSize:'0.75rem', background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px'}}>{r.tipo_nombre || TIPOS[r.tipo] || r.tipo}</span>
                                    </td>
                                    
                                    {/* --- COLUMNA DE FRECUENCIA --- */}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>
                                                {interpretarCron(r.frecuencia_cron)}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                fontFamily: 'monospace', 
                                                background: '#f1f5f9', 
                                                color: '#94a3b8', 
                                                padding: '2px 6px', 
                                                borderRadius: '4px',
                                                marginTop: '4px'
                                            }}>
                                                {r.frecuencia_cron}
                                            </span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{ 
                                            background: r.formato === 3 ? '#fee2e2' : '#dbeafe', 
                                            color: r.formato === 3 ? '#dc2626' : '#2563eb',
                                            padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold' 
                                        }}>
                                            {r.formato_nombre || FORMATOS[r.formato] || r.formato}
                                        </span>
                                    </td>

                                    <td style={{ padding: '16px' }}>
                                        {showDestinatarios(r.destinatarios)}
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{ 
                                            backgroundColor: r.activo ? '#dcfce7' : '#f3f4f6', 
                                            color: r.activo ? '#16a34a' : '#94a3b8', 
                                            padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' 
                                        }}>
                                            {r.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => navigate(`/admin/reportes-programados/editar/${r.id}`)} 
                                                title="Editar"
                                                style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                            </button>

                                            <button 
                                                onClick={() => toggleActivo(r.id)} 
                                                title={r.activo ? "Desactivar" : "Activar"}
                                                style={{ background: '#f1f5f9', color: r.activo ? '#16a34a' : '#94a3b8', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <i className={`bx ${r.activo ? 'bx-toggle-right' : 'bx-toggle-left'}`} style={{ fontSize: '1.2rem' }}></i>
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteClick(r)} 
                                                title="Eliminar"
                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

        {/* MODALES */}
        {showWarningModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-error-alt' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¡Advertencia!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción eliminará la programación del reporte.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowWarningModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={proceedToConfirm} style={{ flex: 1, padding: '10px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Entendido, Continuar</button>
                    </div>
                </div>
            </div>
        )}
        
        {showConfirmModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-trash' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¿Confirmar Eliminación?</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>¿Seguro que deseas eliminar <strong>"{itemToDelete?.nombre}"</strong>?</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>No, Cancelar</button>
                        <button onClick={executeDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sí, Eliminar</button>
                    </div>
                </div>
            </div>
        )}

        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{successTitle}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>{successMessage}</p>
                    <button onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Aceptar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}