import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import Sidebar from "../../../components/SidebarEmpleado"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso + 'T00:00:00'); 
  return d.toLocaleDateString("es-EC", { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function SolicitudesAusenciasEmp() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // Estado para el Modal
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: '', 
    title: '',
    message: ''
  });
  
  const [selectedId, setSelectedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/empleado/ausencias/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Modales
  const requestCancel = (id) => {
      setSelectedId(id);
      setModalConfig({
          show: true,
          type: 'confirm',
          title: '¿Cancelar Solicitud?',
          message: 'Esta acción anulará tu petición de ausencia. ¿Estás seguro?'
      });
  };

  const executeCancellation = async () => {
    try {
        const res = await apiFetch(`/api/empleado/ausencias/${selectedId}/cancelar/`, { method: "PATCH" });
        if (!res.ok) throw new Error("Error al cancelar");
        
        setModalConfig({
            show: true,
            type: 'success',
            title: 'Solicitud Cancelada',
            message: 'La solicitud ha sido anulada exitosamente.'
        });
        load(); 
    } catch (e) {
        setModalConfig({
            show: true,
            type: 'error',
            title: 'Error',
            message: 'No se pudo cancelar la solicitud. Intenta nuevamente.'
        });
    }
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
      setSelectedId(null);
  };

  // --- CORRECCIÓN AQUÍ: Detección de texto más flexible ---
  const getStatusBadge = (label, estado) => {
      const l = (label || "").toLowerCase();
      
      let styles = { 
          bg: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' 
      }; // Default (Cancelado/Otro) - Gris

      // Usamos 'includes' con la raíz de la palabra para capturar "aprobado" y "aprobada"
      if (l.includes('pendient')) { 
          // Amarillo Ámbar (Espera)
          styles = { bg: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d' }; 
      } 
      else if (l.includes('aprob')) { 
          // Verde Esmeralda (Éxito)
          styles = { bg: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }; 
      } 
      else if (l.includes('rechaz')) { 
          // Rojo Corporativo (Alerta)
          styles = { bg: '#fef2f2', color: '#D51F36', border: '1px solid #fecaca' }; 
      } 
      
      return (
        <span style={{ 
            backgroundColor: styles.bg, 
            color: styles.color, 
            border: styles.border,
            padding: '5px 12px', 
            borderRadius: '20px', 
            fontSize: '0.7rem', 
            fontWeight: '800', 
            textTransform: 'uppercase',
            display: 'inline-block',
            minWidth: '90px', 
            textAlign: 'center'
        }}>
            {label || "Desconocido"}
        </span>
      );
  };

  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Mis Solicitudes</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Gestiona tus permisos y vacaciones.</p>
            </div>
            
            <button 
                onClick={() => nav("/empleado/ausencias/crear")}
                style={{ 
                    padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', 
                    border: 'none', borderRadius: '10px', fontWeight: '600', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
            >
                <i className='bx bx-plus-circle' style={{ fontSize:'1.2rem' }}></i> Nueva Solicitud
            </button>
        </div>

        {/* TABLA CARD */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tipo de Permiso</th>
                            <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Periodo</th>
                            <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Duración</th>
                            <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                            <th style={{ padding: '15px 25px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando solicitudes...</td></tr>}
                        
                        {!loading && rows.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No tienes solicitudes registradas.</td></tr>
                        )}

                        {!loading && rows.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#fcfcfc'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='white'}>
                                
                                <td style={{ padding: '15px 25px', fontWeight: '600', color: '#1e293b' }}>
                                    {r.tipo_ausencia_nombre}
                                </td>
                                
                                <td style={{ padding: '15px 25px', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span><strong>Desde:</strong> {fmtDate(r.fecha_inicio)}</span>
                                        <span><strong>Hasta:</strong> {fmtDate(r.fecha_fin || r.fecha_inicio)}</span>
                                    </div>
                                </td>
                                
                                <td style={{ padding: '15px 25px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                                    {r.dias_habiles} {r.dias_habiles === 1 ? 'día' : 'días'}
                                </td>
                                
                                <td style={{ padding: '15px 25px', textAlign: 'center' }}>
                                    {getStatusBadge(r.estado_label, r.estado)}
                                </td>
                                
                                <td style={{ padding: '15px 25px', textAlign: 'center' }}>
                                    {Number(r.estado) === 1 ? ( 
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => nav(`/empleado/ausencias/editar/${r.id}`)}
                                                style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#0ea5e9' }}
                                                title="Editar"
                                            >
                                                <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                            </button>
                                            <button 
                                                onClick={() => requestCancel(r.id)}
                                                style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
                                                title="Cancelar Solicitud"
                                            >
                                                <i className='bx bx-x' style={{ fontSize: '1.1rem' }}></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                            {Number(r.estado) === 4 ? "Cancelada" : "Cerrada"}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style={{ marginTop: '10px' }}>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px', fontSize:'0.9rem' }}>
                <i className='bx bx-left-arrow-alt'></i> Volver al inicio
            </Link>
        </div>

        {/* MODAL */}
        {modalConfig.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        backgroundColor: modalConfig.type === 'success' ? '#dcfce7' : modalConfig.type === 'error' ? '#fee2e2' : '#fef3c7', 
                        color: modalConfig.type === 'success' ? '#16a34a' : modalConfig.type === 'error' ? '#dc2626' : '#d97706', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <i className={`bx ${modalConfig.type === 'success' ? 'bx-check' : modalConfig.type === 'error' ? 'bx-x' : 'bx-question-mark'}`} style={{ fontSize: '48px' }}></i>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                        {modalConfig.title}
                    </h3>
                    
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5', fontSize:'0.95rem' }}>
                        {modalConfig.message}
                    </p>
                    
                    {modalConfig.type === 'confirm' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={closeModal} 
                                style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                No, Volver
                            </button>
                            <button 
                                onClick={executeCancellation} 
                                style={{ flex: 1, padding: '12px', backgroundColor: '#D51F36', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Sí, Cancelar
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={closeModal} 
                            style={{ 
                                width: '100%', padding: '12px', 
                                backgroundColor: modalConfig.type === 'success' ? '#16a34a' : '#374151', 
                                color: 'white', border: 'none', borderRadius: '8px', 
                                fontWeight: '600', cursor: 'pointer', fontSize: '1rem' 
                            }}
                        >
                            {modalConfig.type === 'success' ? 'Entendido' : 'Cerrar'}
                        </button>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}