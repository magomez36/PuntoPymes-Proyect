import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Sidebar correcto
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// Mapeos para visualización
const UNIDAD = { 1: "%", 2: "puntos", 3: "minutos", 4: "horas" };
const ORIGEN = { 1: "asistencia", 2: "evaluacion", 3: "mixto" };

export default function KPIs() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); // Buscador

  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: '', title: '', message: '', action: null });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/kpis/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      showModal('error', 'Error', e?.message || "Error cargando KPIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // --- FILTRO ---
  const filtered = useMemo(() => {
      const s = q.toLowerCase();
      if (!s) return rows;
      return rows.filter(r => 
          (r.codigo || "").toLowerCase().includes(s) ||
          (r.nombre || "").toLowerCase().includes(s)
      );
  }, [rows, q]);

  // --- MODALES ---
  const showModal = (type, title, message, action = null) => {
      setModalConfig({ show: true, type, title, message, action });
  };
  
  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  // --- ACCIONES ---
  const requestDelete = (id) => {
      showModal('confirm', '¿Eliminar KPI?', 'Esta acción es irreversible. ¿Estás seguro de eliminar este indicador?', () => executeDelete(id));
  };

  const executeDelete = async (id) => {
    try {
      const res = await apiFetch(`/api/rrhh/kpis/${id}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        showModal('error', 'No se puede eliminar', data?.detail || "Este KPI está siendo utilizado en evaluaciones o configuraciones activas.");
        return;
      }

      if (!res.ok) throw new Error("No se pudo eliminar.");
      
      await load();
      showModal('success', 'Eliminado', 'El KPI ha sido eliminado correctamente.');
    } catch (e) {
      showModal('error', 'Error', e?.message || "Error eliminando.");
    }
  };

  // --- BADGES VISUALES ---
  const getUnitBadge = (val, label) => {
      // 1: %, 2: Puntos, 3/4: Tiempo
      let styles = { bg: '#f1f5f9', color: '#64748b' };
      
      if (val === 1) styles = { bg: '#e0f2fe', color: '#0284c7' }; // Azul (%)
      else if (val === 2) styles = { bg: '#f3e8ff', color: '#9333ea' }; // Morado (Puntos)
      else if (val >= 3) styles = { bg: '#ffedd5', color: '#ea580c' }; // Naranja (Tiempo)

      return (
          <span style={{ backgroundColor: styles.bg, color: styles.color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
              {label}
          </span>
      );
  };

  const getOriginBadge = (val, label) => {
      // 1: Asistencia (System), 2: Evaluacion (Human), 3: Mixto
      let icon = '';
      if (val === 1) icon = 'bx-time-five';
      else if (val === 2) icon = 'bx-user-voice';
      else icon = 'bx-git-merge';

      return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
              <i className={`bx ${icon}`} style={{ fontSize: '1rem', color: '#94a3b8' }}></i>
              <span style={{ textTransform: 'capitalize' }}>{label}</span>
          </div>
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
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Catálogo de KPIs</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Define los indicadores clave de desempeño.</p>
            </div>
            
            <button 
                onClick={() => navigate("/rrhh/kpis/crear")}
                style={{ 
                    padding: '12px 24px', backgroundColor: '#D51F36', color: 'white', 
                    border: 'none', borderRadius: '10px', fontWeight: '600', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(213, 31, 54, 0.2)'
                }}
            >
                <i className='bx bx-plus-circle' style={{ fontSize:'1.2rem' }}></i> Crear Nuevo KPI
            </button>
        </div>

        {/* CARD PRINCIPAL */}
        <div style={cardStyle}>
            {/* Buscador */}
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                    <input 
                        placeholder="Buscar por código o nombre..." 
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
                            <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Código</th>
                            <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Nombre & Descripción</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Unidad</th>
                            <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Origen de Datos</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando KPIs...</td></tr>}
                        
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No se encontraron indicadores.</td></tr>
                        )}

                        {!loading && filtered.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#fcfcfc'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='white'}>
                                
                                <td style={{ padding: '15px 20px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    {r.codigo}
                                </td>

                                <td style={{ padding: '15px 20px', maxWidth: '300px' }}>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem', marginBottom: '4px' }}>{r.nombre}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>{r.descripcion || "Sin descripción"}</div>
                                </td>

                                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                    {getUnitBadge(r.unidad, UNIDAD[r.unidad] || r.unidad_label || "N/A")}
                                </td>

                                <td style={{ padding: '15px 20px' }}>
                                    {getOriginBadge(r.origen_datos, ORIGEN[r.origen_datos] || r.origen_datos_label || "N/A")}
                                </td>

                                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button 
                                            onClick={() => navigate(`/rrhh/kpis/editar/${r.id}`)}
                                            style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#0ea5e9' }}
                                            title="Editar"
                                        >
                                            <i className='bx bx-edit-alt' style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                        <button 
                                            onClick={() => requestDelete(r.id)}
                                            style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
                                            title="Eliminar"
                                        >
                                            <i className='bx bx-trash' style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MODAL */}
        {modalConfig.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        backgroundColor: modalConfig.type === 'confirm' ? '#fef3c7' : modalConfig.type === 'error' ? '#fee2e2' : '#dcfce7', 
                        color: modalConfig.type === 'confirm' ? '#d97706' : modalConfig.type === 'error' ? '#dc2626' : '#16a34a', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <i className={`bx ${modalConfig.type === 'confirm' ? 'bx-question-mark' : modalConfig.type === 'error' ? 'bx-block' : 'bx-check'}`} style={{ fontSize: '48px' }}></i>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{modalConfig.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>{modalConfig.message}</p>
                    
                    {modalConfig.type === 'confirm' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={closeModal} style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                            <button 
                                onClick={() => { modalConfig.action(); closeModal(); }} 
                                style={{ flex: 1, padding: '12px', backgroundColor: '#dc2626', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    ) : (
                        <button onClick={closeModal} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Entendido</button>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}