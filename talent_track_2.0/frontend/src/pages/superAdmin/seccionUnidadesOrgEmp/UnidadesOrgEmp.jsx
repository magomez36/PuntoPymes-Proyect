import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";

import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function UnidadesOrgEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // --- ESTADOS DE DATOS ---
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTRO ÚNICO ---
  const [empresaId, setEmpresaId] = useState(""); 

  // --- MODALES ---
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [dependencies, setDependencies] = useState([]); 
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const authHeaders = useMemo(() => (token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
  ), [token]);

  // --- 1. CARGA DE EMPRESAS ---
  const fetchEmpresas = useCallback(async () => {
    try {
        const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, { headers: authHeaders });
        if (res.ok) setEmpresas(await res.json());
    } catch (error) { console.error("Error cargando empresas", error); }
  }, [authHeaders]);

  // --- 2. FETCH UNIDADES ---
  const fetchUnidades = useCallback(async (selectedEmpresaId = "") => {
    try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedEmpresaId) params.append("empresa_id", selectedEmpresaId);

        const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?${params.toString()}`, { headers: authHeaders });
        if (!res.ok) throw new Error("Err");
        setUnidades(await res.json());
    } catch (error) { 
        setUnidades([]);
    } finally {
        setLoading(false);
    }
  }, [authHeaders]);

  // --- EFECTOS ---
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    
    // Carga inicial
    (async () => {
        setLoading(true);
        await fetchEmpresas();
        await fetchUnidades(""); // Cargar todas al inicio
        setLoading(false);
    })();
  }, [token, navigate, fetchEmpresas, fetchUnidades]);

  // --- HANDLER FILTRO ---
  const handleEmpresaChange = (e) => {
      const id = e.target.value;
      setEmpresaId(id);
      fetchUnidades(id);
  };

  // --- ELIMINACIÓN ---
  const handleDeleteClick = (unit) => {
    setItemToDelete(unit);
    const childUnits = unidades.filter(u => u.unidad_padre === unit.id);
    setDependencies(childUnits);
    setShowWarningModal(true);
  };

  const proceedToConfirm = () => {
    setShowWarningModal(false);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
        const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${itemToDelete.id}/`, {
            method: "DELETE",
            headers: authHeaders,
        });

        if (!res.ok) {
            alert("No se pudo eliminar.");
            setShowConfirmModal(false);
            return;
        }

        setShowConfirmModal(false);
        setSuccessTitle("Eliminación Completada");
        setSuccessMessage(`La unidad "${itemToDelete.nombre}" ha sido eliminada correctamente.`);
        setShowSuccessModal(true);
        fetchUnidades(empresaId); // Recargar con el filtro actual
    } catch (error) {
        alert("Error de conexión");
        setShowConfirmModal(false);
    }
  };

  // --- ESTADO ---
  const onToggleEstado = async (id) => {
    try {
        const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/toggle-estado/`, {
            method: "PATCH",
            headers: authHeaders,
        });
        if (res.ok) {
            fetchUnidades(empresaId); // Recargar con el filtro actual
            setSuccessTitle("Estado Actualizado");
            setSuccessMessage("El estado de la unidad ha cambiado correctamente.");
            setShowSuccessModal(true);
        }
    } catch (error) { alert("Error al cambiar estado"); }
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div className="content-area" style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Unidades Organizacionales</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Gestiona departamentos y áreas por empresa.</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/unidades-organizacionales/crear")} 
                    className="btn-create" 
                    style={{ 
                        backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', 
                        borderRadius: '8px', border: 'none', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        fontWeight: 'bold', 
                        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' 
                    }}>
                    <i className='bx bx-plus-circle' style={{fontSize: '1.2rem'}}></i> Nueva Unidad
                </button>
            </div>

            {/* --- FILTRO DE EMPRESA (ÚNICO) --- */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Filtrar por Empresa:</label>
                    <div style={{ position: 'relative' }}>
                        <i className='bx bx-buildings' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                        <select 
                            value={empresaId} 
                            onChange={handleEmpresaChange} 
                            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b', appearance: 'none', backgroundColor: 'white', fontSize: '0.95rem' }}
                        >
                            <option value="">Todas las empresas</option>
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
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Nombre Unidad</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Unidad Padre</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empresa</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Tipo</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Ubicación</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && unidades.map((u) => {
                                const isActive = (u.estado === 1) || (String(u.estado_nombre || '').toLowerCase() === 'activo');
                                const badgeBg = isActive ? '#dcfce7' : '#fee2e2';
                                const badgeColor = isActive ? '#16a34a' : '#dc2626';
                                const label = u.estado_nombre || (isActive ? "ACTIVO" : "INACTIVO");

                                return (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>{u.nombre}</td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{u.unidad_padre_nombre || "-"}</td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{u.empresa_nombre}</td>
                                        
                                        {/* COLUMNA TIPO (Visible) */}
                                        <td style={{ padding: '16px', color: '#64748b' }}>
                                            <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                                {u.tipo_nombre || u.tipo || "General"}
                                            </span>
                                        </td>

                                        <td style={{ padding: '16px', color: '#64748b' }}>{u.ubicacion || "-"}</td>

                                        {/* COLUMNA ESTADO */}
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {label}
                                            </span>
                                        </td>

                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button onClick={() => navigate(`/admin/unidades-organizacionales/editar/${u.id}`)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}><i className='bx bx-edit-alt'></i></button>
                                                <button onClick={() => onToggleEstado(u.id)} style={{ background: '#f1f5f9', color: isActive ? '#16a34a' : '#475569', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}><i className='bx bx-power-off'></i></button>
                                                <button onClick={() => handleDeleteClick(u)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}><i className='bx bx-trash'></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!loading && unidades.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No se encontraron unidades con los filtros seleccionados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* MODALES REUTILIZABLES (Mismo código que antes) */}
        {showWarningModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-error-alt' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¡Advertencia!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción es irreversible.</p>
                    {dependencies.length > 0 && (
                        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px', padding: '12px', marginBottom: '24px', textAlign: 'left' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#c2410c', fontWeight: '600' }}><i className='bx bx-git-branch' style={{ marginRight: '6px' }}></i>Afectará también a:</p>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#9a3412', maxHeight: '100px', overflowY: 'auto' }}>{dependencies.map(dep => <li key={dep.id}>{dep.nombre}</li>)}</ul>
                        </div>
                    )}
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¿Confirmar Eliminación?</h3>
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