import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function ReglasAsistenciaEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // Datos
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales (Flujo de 3 pasos)
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

  // --- Cargar Datos ---
  const loadReglas = useCallback(async () => {
    try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/`, { headers: authHeaders });
        
        if (!res.ok) throw new Error("No se pudo cargar reglas");
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
    } catch (e) {
        console.error(e.message);
        setRows([]);
    } finally {
        setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadReglas();
  }, [token, navigate, loadReglas]);

  // --- Flujo de Eliminación ---
  
  // Paso 1: Advertencia
  const handleDeleteClick = (regla) => {
    setItemToDelete(regla);
    setShowWarningModal(true);
  };

  // Paso 2: Confirmación
  const proceedToConfirm = () => {
    setShowWarningModal(false);
    setShowConfirmModal(true);
  };

  // Paso 3: Ejecución
  const executeDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/${itemToDelete.id}/`, {
        method: "DELETE",
        headers: authHeaders,
      });
      
      if (!res.ok) {
          alert("No se pudo eliminar la regla.");
          setShowConfirmModal(false);
          return;
      }

      setShowConfirmModal(false);
      setSuccessTitle("Regla Eliminada");
      setSuccessMessage("La configuración de asistencia ha sido eliminada correctamente.");
      setShowSuccessModal(true);

      loadReglas(); // Recargar tabla
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Reglas de Asistencia</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Define políticas de puntualidad y cálculo de horas extra.</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/reglas-asistencia/crear")} 
                    className="btn-create" 
                    style={{ 
                        backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', 
                        borderRadius: '8px', border: 'none', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        fontWeight: 'bold', // Negrita
                        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' 
                    }}>
                    <i className='bx bx-cog' style={{fontSize: '1.2rem'}}></i> Nueva Regla
                </button>
            </div>

            {/* TABLA */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empresa</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Tardanza (Min)</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Cálculo Horas Extra</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Cargando datos...</td></tr>}
                            
                            {!loading && rows.length === 0 && (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>No hay reglas configuradas.</td></tr>
                            )}

                            {!loading && rows.map((r) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>
                                        {r.empresa_razon_social}
                                    </td>
                                    
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem' }}>
                                            &gt; {r.considera_tardanza_desde_min} min
                                        </span>
                                    </td>
                                    
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <i className='bx bx-time-five' style={{ fontSize: '1.1rem', color: '#3b82f6' }}></i>
                                            {r.calculo_horas_extra_nombre}
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => navigate(`/admin/reglas-asistencia/editar/${r.id}`)} 
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

        {/* --- MODAL 1: ADVERTENCIA --- */}
        {showWarningModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-error-alt' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¡Advertencia!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción eliminará la configuración de reglas para la empresa seleccionada.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowWarningModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={proceedToConfirm} style={{ flex: 1, padding: '10px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Entendido, Continuar</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL 2: CONFIRMACIÓN --- */}
        {showConfirmModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-trash' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¿Confirmar Eliminación?</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>¿Seguro que deseas eliminar esta regla de asistencia?</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>No, Cancelar</button>
                        <button onClick={executeDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sí, Eliminar</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL 3: ÉXITO --- */}
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