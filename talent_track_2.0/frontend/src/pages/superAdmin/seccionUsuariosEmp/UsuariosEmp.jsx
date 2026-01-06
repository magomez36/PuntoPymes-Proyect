import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function UsuariosEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // Estados
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState(""); // Filtro
  const [rows, setRows] = useState([]);
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

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    const initData = async () => {
        try {
            setLoading(true);
            // 1. Cargar Empresas
            const resEmp = await apiFetch(`${API_BASE}/listado-empresas/`, { headers: authHeaders });
            if (resEmp.ok) {
                const dataEmp = await resEmp.json();
                setEmpresas(Array.isArray(dataEmp) ? dataEmp : []);
            }

            // 2. Cargar Todos los Usuarios
            await fetchUsuarios("");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    initData();
  }, [token, navigate, authHeaders]); // fetchUsuarios se define abajo, pero para evitar deps circulares lo llamamos directo o lo envolvemos.

  // --- FETCH USUARIOS ---
  const fetchUsuarios = useCallback(async (eid) => {
    setLoading(true);
    try {
        const url = eid 
            ? `${API_BASE}/usuarios-empresa/?empresa_id=${eid}`
            : `${API_BASE}/usuarios-empresa/`;

        const res = await apiFetch(url, { headers: authHeaders });
        if (!res.ok) throw new Error("Error cargando usuarios");
        
        const data = await res.json();
        // Manejo robusto paginación
        let lista = [];
        if (Array.isArray(data)) lista = data;
        else if (data.results) lista = data.results;

        setRows(lista);
    } catch (e) {
        setRows([]);
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [authHeaders]);

  // --- HANDLER FILTRO ---
  const handleEmpresaChange = (e) => {
      const id = e.target.value;
      setEmpresaId(id);
      fetchUsuarios(id);
  };

  // --- HELPERS VISUALES ---
  const getRolBadge = (rol) => {
      let color = '#64748b'; // Default gris
      let bg = '#f1f5f9';
      
      if (!rol) return <span style={{color:'#94a3b8'}}>Sin Rol</span>;
      
      const r = rol.toLowerCase();
      if (r.includes('admin') || r.includes('super')) { color = '#7c3aed'; bg = '#f5f3ff'; } // Morado
      else if (r.includes('jefe') || r.includes('manager')) { color = '#0284c7'; bg = '#e0f2fe'; } // Azul
      else if (r.includes('empleado')) { color = '#059669'; bg = '#d1fae5'; } // Verde

      return <span style={{ background: bg, color: color, padding:'4px 8px', borderRadius:'6px', fontSize:'0.75rem', fontWeight:'bold', textTransform:'capitalize' }}>{rol}</span>;
  };

  const getEstadoBadge = (estado) => {
      // 1: Activo, 2: Bloqueado/Suspendido
      const isActivo = estado === 1;
      return (
        <span style={{ 
            backgroundColor: isActivo ? '#dcfce7' : '#fee2e2', 
            color: isActivo ? '#16a34a' : '#dc2626', 
            padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' 
        }}>
            {isActivo ? "Activo" : "Bloqueado"}
        </span>
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
      const res = await apiFetch(`${API_BASE}/usuarios-empresa/${itemToDelete.id}/`, {
        method: "DELETE",
        headers: authHeaders,
      });
      
      if (!res.ok) {
          alert("No se pudo eliminar el usuario.");
          setShowConfirmModal(false);
          return;
      }

      setShowConfirmModal(false);
      setSuccessTitle("Usuario Eliminado");
      setSuccessMessage(`El usuario "${itemToDelete.email}" ha sido eliminado permanentemente.`);
      setShowSuccessModal(true);
      fetchUsuarios(empresaId);
    } catch (e) {
      alert("Error eliminando.");
      setShowConfirmModal(false);
    }
  };

  const toggleEstado = async (id) => {
    try {
      const res = await apiFetch(`${API_BASE}/usuarios-empresa/${id}/toggle-estado/`, {
        method: "PATCH",
        headers: authHeaders,
      });
      if (res.ok) {
          fetchUsuarios(empresaId);
          setSuccessTitle("Estado Actualizado");
          setSuccessMessage("El acceso del usuario ha sido modificado.");
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Gestión de Usuarios</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Administra las cuentas de acceso al sistema.</p>
                </div>
                <button 
                    onClick={() => navigate("/admin/usuarios/crear")} 
                    className="btn-create" 
                    style={{ 
                        backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', 
                        borderRadius: '8px', border: 'none', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' 
                    }}>
                    <i className='bx bx-user-plus' style={{fontSize: '1.2rem'}}></i> Nuevo Usuario
                </button>
            </div>

            {/* FILTROS */}
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
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Usuario</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empresa</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Rol</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>MFA</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Cargando usuarios...</td></tr>}
                            
                            {!loading && rows.length === 0 && (
                                <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>No se encontraron usuarios.</td></tr>
                            )}

                            {!loading && rows.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    {/* USUARIO (Nombre + Email) */}
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                            {u.empleado_nombres} {u.empleado_apellidos}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', display:'flex', alignItems:'center', gap:'4px' }}>
                                            <i className='bx bx-envelope'></i> {u.email}
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px', color: '#334155', fontSize: '0.9rem' }}>
                                        {u.empresa_razon_social || "—"}
                                    </td>
                                    
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {getRolBadge(u.rol_nombre)}
                                    </td>

                                    {/* MFA (Icono) */}
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {u.mfa_habilitado ? (
                                            <i className='bx bxs-check-shield' style={{ color:'#16a34a', fontSize:'1.2rem' }} title="Habilitado"></i>
                                        ) : (
                                            <i className='bx bx-shield-x' style={{ color:'#cbd5e1', fontSize:'1.2rem' }} title="Deshabilitado"></i>
                                        )}
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {getEstadoBadge(u.estado)}
                                    </td>

                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => navigate(`/admin/usuarios/editar/${u.id}`)} 
                                                title="Editar"
                                                style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                            </button>

                                            <button 
                                                onClick={() => toggleEstado(u.id)} 
                                                title={u.estado === 1 ? "Bloquear" : "Desbloquear"}
                                                style={{ background: '#f1f5f9', color: u.estado === 1 ? '#16a34a' : '#94a3b8', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <i className={`bx ${u.estado === 1 ? 'bx-lock-open-alt' : 'bx-lock-alt'}`} style={{ fontSize: '1.1rem' }}></i>
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteClick(u)} 
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
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción eliminará el usuario y su acceso al sistema (auth_user).</p>
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
                    <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>¿Seguro que deseas eliminar a <strong>"{itemToDelete?.email}"</strong>?</p>
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