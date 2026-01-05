import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";

import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000";

// Helper para formatear días
function formatDias(dias) {
  if (!Array.isArray(dias) || dias.length === 0) return "-";
  const names = dias
    .map((d) => (d && typeof d === "object" ? d.nombre : d)) 
    .filter(Boolean)
    .map((n) => String(n).charAt(0).toUpperCase() + String(n).slice(1));
  return names.join(", ");
}

// Helper robusto para validar booleanos (acepta 1, "1", true, "true")
const isActive = (val) => {
    if (val === true) return true;
    if (val === 1) return true;
    if (val === "true") return true;
    if (val === "1") return true;
    return false;
};

export default function TurnosEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchEmpresas = useCallback(async () => {
    try {
        const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, { headers: authHeaders });
        if (!res.ok) throw new Error("Err");
        return await res.json();
    } catch (error) { return []; }
  }, [authHeaders]);

  const fetchTurnos = useCallback(async (empresaIdParam = "") => {
    try {
        setLoading(true);
        const q = empresaIdParam ? `?empresa_id=${empresaIdParam}` : "";
        const res = await apiFetch(`${API_BASE}/api/turnos/${q}`, { headers: authHeaders });
        
        if (!res.ok) throw new Error("Err");
        const data = await res.json();
        
        // DEBUG: Mira en la consola del navegador qué llega realmente
        console.log("Datos de Turnos recibidos:", data); 

        setTurnos(Array.isArray(data) ? data : []);
    } catch (e) {
        setTurnos([]);
    } finally {
        setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    (async () => {
        setLoading(true);
        const emps = await fetchEmpresas();
        setEmpresas(emps);
        setEmpresaId(""); 
        await fetchTurnos(""); 
        setLoading(false);
    })();
  }, [token, navigate, fetchEmpresas, fetchTurnos]);

  const handleEmpresaChange = (e) => {
      const id = e.target.value;
      setEmpresaId(id);
      fetchTurnos(id);
  };

  const handleDeleteClick = (turno) => {
    setItemToDelete(turno);
    setShowWarningModal(true);
  };

  const proceedToConfirm = () => {
    setShowWarningModal(false);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await apiFetch(`${API_BASE}/api/turnos/${itemToDelete.id}/`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
          alert("No se pudo eliminar.");
          setShowConfirmModal(false);
          return;
      }
      setShowConfirmModal(false);
      setSuccessTitle("Turno Eliminado");
      setSuccessMessage(`El turno "${itemToDelete.nombre}" ha sido eliminado.`);
      setShowSuccessModal(true);
      fetchTurnos(empresaId);
    } catch (e) {
      alert("Error eliminando.");
      setShowConfirmModal(false);
    }
  };

  const sortedTurnos = useMemo(() => {
    return [...turnos].sort((a, b) => {
      const ea = (a.empresa_razon_social || "").toLowerCase();
      const eb = (b.empresa_razon_social || "").toLowerCase();
      if (ea !== eb) return ea.localeCompare(eb);
      return (a.hora_inicio || "").localeCompare(b.hora_inicio || "");
    });
  }, [turnos]);

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div className="content-area" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Gestión de Turnos</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Configura horarios laborales y reglas de asistencia.</p>
                </div>
                <button onClick={() => navigate("/admin/turnos/crear")} className="btn-create" style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                    <i className='bx bx-time-five' style={{fontSize: '1.2rem'}}></i> Nuevo Turno
                </button>
            </div>

            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Filtrar por Empresa:</label>
                    <div style={{ position: 'relative' }}>
                        <i className='bx bx-buildings' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                        <select value={empresaId} onChange={handleEmpresaChange} style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b', appearance: 'none', backgroundColor: 'white', fontSize: '0.95rem' }}>
                            <option value="">Todas las empresas</option>
                            {empresas.map((e) => <option key={e.id} value={String(e.id)}>{e.razon_social}</option>)}
                        </select>
                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                    </div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Nombre Turno</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empresa</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Horario</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Días</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Tolerancia</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Reglas</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Cargando datos...</td></tr>}
                            {!loading && sortedTurnos.length === 0 && (<tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>No hay turnos registrados.</td></tr>)}

                            {!loading && sortedTurnos.map((t) => {
                                // Aplicamos la verificación robusta
                                const gps = isActive(t.requiere_gps);
                                const foto = isActive(t.requiere_foto);

                                return (
                                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>{t.nombre}</td>
                                    <td style={{ padding: '16px', color: '#64748b', fontWeight: '500' }}>{t.empresa_razon_social || t.empresa}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#0f172a', fontWeight: '500' }}>{t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}</td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>{t.dias_semana_texto || formatDias(t.dias_semana)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: '#f59e0b', fontWeight: '600' }}>{t.tolerancia_minutos} min</td>
                                    
                                    {/* COLUMNA REGLAS */}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                            {gps && <span title="Requiere GPS" style={{ background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>GPS</span>}
                                            {foto && <span title="Requiere Foto" style={{ background: '#fce7f3', color: '#db2777', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>FOTO</span>}
                                            {!gps && !foto && <span style={{ color: '#cbd5e1' }}>-</span>}
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button onClick={() => navigate(`/admin/turnos/editar/${t.id}`)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}><i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i></button>
                                            <button onClick={() => handleDeleteClick(t)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}><i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* MODALES (Código igual a las versiones anteriores) */}
        {showWarningModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-error-alt' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¡Advertencia!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción es irreversible.</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowWarningModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={proceedToConfirm} style={{ flex: 1, padding: '10px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Continuar</button>
                    </div>
                </div>
            </div>
        )}
        {showConfirmModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-trash' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¿Eliminar Turno?</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={executeDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Eliminar</button>
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