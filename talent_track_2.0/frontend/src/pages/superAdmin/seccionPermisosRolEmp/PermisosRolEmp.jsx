import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function PermisosRolEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // --- ESTADOS ---
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false); // Inicialmente false hasta que se carguen empresas
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // --- CARGA INICIAL (Empresas) ---
  const loadEmpresas = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/listado-empresas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando empresas:", e);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadEmpresas();
  }, [token, navigate]);

  // --- CARGA DE PERMISOS (Cuando cambia empresaId) ---
  const loadPermisos = async (eid) => {
    if (!eid) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/permisos-por-empresa/?empresa_id=${eid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermisos(empresaId);
  }, [empresaId]);

  // --- FILTRO CLIENT-SIDE ---
  const filteredRows = rows.filter(r => 
    (r.codigo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.rol_nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- DELETE HANDLERS ---
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
      const res = await apiFetch(`${API_BASE}/permisos/${itemToDelete.id}/`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || "Error al eliminar.");
        setShowConfirmModal(false);
        return;
      }

      setShowConfirmModal(false);
      setSuccessMessage(`El permiso "${itemToDelete.codigo}" ha sido eliminado.`);
      setShowSuccessModal(true);
      loadPermisos(empresaId); // Recargar la tabla actual
    } catch (e) {
      alert("Error de conexión.");
      setShowConfirmModal(false);
    }
  };

  // --- ESTILOS DE TABLA (16px padding) ---
  const tableHeaderStyle = { 
    padding: '16px', 
    textAlign: 'left', 
    fontSize: '0.75rem', 
    color: '#64748b', 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em',
    backgroundColor: '#fff', 
    borderBottom: '1px solid #e2e8f0'
  };

  const tableCellStyle = { 
    padding: '16px', 
    borderBottom: '1px solid #f8fafc',
    fontSize: '0.9rem',
    color: '#334155',
    verticalAlign: 'middle'
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Permisos por Rol</h1>
            <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.95rem' }}>Gestiona los accesos específicos dentro de cada empresa.</p>
        </div>

        {/* BARRA DE HERRAMIENTAS (Selector + Buscador + Botón) */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', flexWrap:'wrap', gap: '16px', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            
            {/* 1. Selector de Empresa */}
            <div style={{ position: 'relative', minWidth: '250px' }}>
                <i className='bx bxs-business' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                <select 
                    value={empresaId} 
                    onChange={(e) => setEmpresaId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', color: '#334155', backgroundColor: '#f8fafc', appearance:'none', cursor:'pointer' }}
                >
                    <option value="">-- Seleccionar Empresa --</option>
                    {empresas.map((e) => (
                        <option key={e.id} value={e.id}>{e.razon_social}</option>
                    ))}
                </select>
                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents:'none' }}></i>
            </div>

            {/* 2. Buscador */}
            <div style={{ flex: 1, position: 'relative' }}>
                <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                <input 
                    type="text" 
                    placeholder="Buscar permiso, código o rol..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!empresaId}
                    style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', color: '#334155', backgroundColor: !empresaId ? '#f1f5f9' : 'white' }}
                />
            </div>

            {/* 3. Botón Crear */}
            <button 
                onClick={() => navigate("/admin/permisos/crear")} 
                disabled={!empresaId}
                style={{ 
                    backgroundColor: !empresaId ? '#cbd5e1' : '#dc2626', 
                    color: 'white', 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    cursor: !empresaId ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    boxShadow: !empresaId ? 'none' : '0 4px 6px -1px rgba(220, 38, 38, 0.2)',
                    transition: '0.2s'
                }}
            >
                <i className='bx bx-plus-circle' style={{fontSize:'1.2rem'}}></i> Crear Permiso
            </button>
        </div>

        {/* TABLA */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ ...tableHeaderStyle, width: '15%' }}>Código</th>
                            <th style={{ ...tableHeaderStyle, width: '45%' }}>Descripción</th>
                            <th style={{ ...tableHeaderStyle, width: '25%' }}>Rol Asignado</th>
                            <th style={{ ...tableHeaderStyle, width: '15%', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Estado Inicial: No hay empresa seleccionada */}
                        {!empresaId && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'12px'}}>
                                        <i className='bx bx-buildings' style={{fontSize:'2.5rem', color:'#cbd5e1'}}></i>
                                        <span>Selecciona una empresa arriba para ver sus permisos.</span>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Cargando */}
                        {loading && empresaId && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando permisos...</td></tr>
                        )}
                        
                        {/* Sin resultados */}
                        {!loading && empresaId && filteredRows.length === 0 && (
                             <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No se encontraron permisos.</td></tr>
                        )}

                        {/* Datos */}
                        {!loading && empresaId && filteredRows.map((p) => (
                            <tr key={p.id} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#fcfcfc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                
                                <td style={tableCellStyle}>
                                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#0f172a', fontWeight: '600', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>
                                        {p.codigo}
                                    </code>
                                </td>
                                
                                <td style={tableCellStyle}>
                                    <div style={{ maxWidth: '450px', lineHeight: '1.5' }}>
                                        {p.descripcion || <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>Sin descripción</span>}
                                    </div>
                                </td>

                                <td style={tableCellStyle}>
                                    <span style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        background: '#eff6ff', color: '#1d4ed8', 
                                        padding: '4px 10px', borderRadius: '20px', 
                                        fontWeight: '600', fontSize: '0.8rem', border: '1px solid #dbeafe'
                                    }}>
                                        <i className='bx bx-user-badge'></i> {p.rol_nombre || "N/A"}
                                    </span>
                                </td>

                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button 
                                            onClick={() => navigate(`/admin/permisos/editar/${p.id}?empresa_id=${empresaId}`)}
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition:'0.2s' }} 
                                            onMouseOver={e => e.currentTarget.style.color = '#3b82f6'} 
                                            onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                                        >
                                            <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteClick(p)} 
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition:'0.2s' }} 
                                            onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} 
                                            onMouseOut={e => e.currentTarget.style.background = 'white'}
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

        {/* MODALES */}
        {showWarningModal && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize:'1.1rem' }}>¿Eliminar Permiso?</h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize:'0.9rem' }}>Se eliminará el permiso <strong>{itemToDelete?.codigo}</strong> permanentemente.</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowWarningModal(false)} style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Cancelar</button>
                        <button onClick={proceedToConfirm} style={{ flex: 1, padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Eliminar</button>
                    </div>
                </div>
            </div>
        )}
        
        {showConfirmModal && (
             <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-trash' style={{ fontSize: '24px' }}></i></div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize:'1.1rem' }}>Confirmar</h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize:'0.9rem' }}>¿Seguro que deseas eliminar este permiso?</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>No, volver</button>
                        <button onClick={executeDelete} style={{ flex: 1, padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Sí, eliminar</button>
                    </div>
                </div>
            </div>
        )}

        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
                    <div style={{ color: '#16a34a', fontSize: '3rem', marginBottom: '10px' }}><i className='bx bx-check-circle'></i></div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize:'1.1rem' }}>¡Éxito!</h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize:'0.9rem' }}>{successMessage}</p>
                    <button onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Entendido</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}