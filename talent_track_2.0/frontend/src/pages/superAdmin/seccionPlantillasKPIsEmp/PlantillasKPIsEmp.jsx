import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

const APLICA_A = {
  1: "Puesto",
  2: "Unidad",
  3: "Empleado",
};

export default function PlantillasKPIsEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // Datos
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState(""); 
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modales
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const authHeaders = useMemo(() => (token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
  ), [token]);

  // --- 1. FETCH EMPRESAS ---
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const loadEmpresas = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/listado-empresas/`, { headers: authHeaders });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(Array.isArray(data) ? data : []);
        }
      } catch (e) { console.error(e); }
    };
    loadEmpresas();
  }, [token, navigate, authHeaders]);

  // --- 2. FETCH PLANTILLAS ---
  const fetchPlantillas = useCallback(async (eid) => {
    if (!eid) {
        setRows([]);
        return;
    }
    setLoading(true);
    try {
        const res = await apiFetch(`${API_BASE}/plantillas-kpi/?empresa_id=${eid}`, { headers: authHeaders });
        if (!res.ok) throw new Error("Error cargando plantillas");
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
    } catch (e) {
        setRows([]);
    } finally {
        setLoading(false);
    }
  }, [authHeaders]);

  // --- HANDLER FILTRO ---
  const handleEmpresaChange = (e) => {
      const id = e.target.value;
      setEmpresaId(id);
      fetchPlantillas(id);
  };

  // --- BADGES ---
  const getAplicaBadge = (tipo) => {
      // 1: Puesto (Azul), 2: Unidad (Morado), 3: Empleado (Verde)
      const label = APLICA_A[tipo] || "N/A";
      let colorStyle = { background: '#f3f4f6', color: '#475569' }; // Default

      if (tipo === 1) colorStyle = { background: '#e0f2fe', color: '#0284c7' };
      if (tipo === 2) colorStyle = { background: '#f3e8ff', color: '#9333ea' };
      if (tipo === 3) colorStyle = { background: '#dcfce7', color: '#16a34a' };

      return <span style={{ ...colorStyle, padding:'4px 10px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:'bold', border:`1px solid ${colorStyle.background}` }}>{label}</span>;
  };

  // --- ELIMINACIÓN ---
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
      const res = await apiFetch(`${API_BASE}/plantillas-kpi/${itemToDelete.id}/`, {
        method: "DELETE",
        headers: authHeaders,
      });
      
      if (!res.ok) {
          alert("No se pudo eliminar la plantilla.");
          setShowConfirmModal(false);
          return;
      }

      setShowConfirmModal(false);
      setSuccessTitle("Plantilla Eliminada");
      setSuccessMessage(`La plantilla "${itemToDelete.nombre}" ha sido eliminada.`);
      setShowSuccessModal(true);
      fetchPlantillas(empresaId);
    } catch (e) {
      alert("Error eliminando.");
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div className="content-area" style={{ padding: '32px' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Plantillas de Evaluación</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Agrupa objetivos y KPIs para asignarlos masivamente.</p>
                </div>
                <button 
                    onClick={() => navigate(`/admin/plantillas-kpi/crear${empresaId ? `?empresa_id=${empresaId}` : ''}`)} 
                    className="btn-create" 
                    disabled={!empresaId}
                    style={{ 
                        backgroundColor: empresaId ? '#dc2626' : '#cbd5e1', 
                        color: 'white', padding: '10px 20px', 
                        borderRadius: '8px', border: 'none', cursor: empresaId ? 'pointer' : 'not-allowed', 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        fontWeight: 'bold',
                        boxShadow: empresaId ? '0 4px 6px -1px rgba(220, 38, 38, 0.2)' : 'none' 
                    }}>
                    <i className='bx bx-layer-plus' style={{fontSize: '1.2rem'}}></i> Nueva Plantilla
                </button>
            </div>

            {/* FILTROS */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Selecciona una Empresa:</label>
                    <div style={{ position: 'relative' }}>
                        <i className='bx bx-buildings' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                        <select 
                            value={empresaId} 
                            onChange={handleEmpresaChange} 
                            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b', appearance: 'none', backgroundColor: 'white', fontSize: '0.95rem' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            {empresas.map((e) => (
                                <option key={e.id} value={String(e.id)}>{e.razon_social}</option>
                            ))}
                        </select>
                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Nombre Plantilla</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Nivel Aplicación</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Resumen Objetivos</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Cargando plantillas...</td></tr>}
                            
                            {!loading && !empresaId && (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Selecciona una empresa para ver sus plantillas.</td></tr>
                            )}

                            {!loading && empresaId && rows.length === 0 && (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>No hay plantillas registradas para esta empresa.</td></tr>
                            )}

                            {!loading && empresaId && rows.map((r) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>
                                        {r.nombre}
                                    </td>
                                    
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {getAplicaBadge(r.aplica_a)}
                                    </td>
                                    
                                    {/* LISTADO DE OBJETIVOS (Chips) */}
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                                            {Array.isArray(r.objetivos_resumen) && r.objetivos_resumen.length > 0 ? (
                                                r.objetivos_resumen.map((o, idx) => (
                                                    <div key={idx} style={{ background: '#f8fafc', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'4px 8px', fontSize:'0.75rem', color:'#475569', display:'flex', alignItems:'center', gap:'4px' }}>
                                                        <span style={{ fontWeight:'bold', color:'#334155' }}>{o.kpi_label}</span>
                                                        <span style={{ fontSize:'0.7rem', color:'#94a3b8' }}>| Meta: {o.meta}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>Sin objetivos definidos</span>
                                            )}
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => navigate(`/admin/plantillas-kpi/editar/${r.id}`)} 
                                                title="Editar"
                                                style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
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
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción eliminará la plantilla y desvinculará sus objetivos.</p>
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