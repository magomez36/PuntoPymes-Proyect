import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Link ya no es necesario aquí si usamos navigate
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function RolesEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modales
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/roles-empresa/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if (!token) navigate("/login"); else loadRoles(); }, [token, navigate]);

  const filteredRows = rows.filter(r => 
    (r.nombre_texto || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.empresa_razon_social || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS ---
  const handleDeleteClick = (item) => { setItemToDelete(item); setShowWarningModal(true); };
  const proceedToConfirm = () => { setShowWarningModal(false); setShowConfirmModal(true); };
  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await apiFetch(`${API_BASE}/roles-empresa/${itemToDelete.id}/`, { 
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
      setSuccessMessage(`El rol "${itemToDelete.nombre_texto}" ha sido eliminado.`);
      setShowSuccessModal(true);
      loadRoles();
    } catch (e) {
      alert("Error de conexión.");
      setShowConfirmModal(false);
    }
  };

  // --- HELPERS VISUALES ---
  const renderAvatares = (id) => {
      const count = (id % 5) + 1; 
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', paddingLeft: '10px' }}>
                  {[...Array(Math.min(count, 3))].map((_, i) => (
                      <div key={i} style={{
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: colors[(id + i) % colors.length], color: 'white',
                          border: '2px solid white', marginLeft: '-10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 'bold'
                      }}>
                          {String.fromCharCode(65 + i + id)}
                      </div>
                  ))}
                  {count > 3 && (
                      <div style={{
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: '#f1f5f9', color: '#64748b', border: '2px solid white', marginLeft: '-10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight:'bold'
                      }}>
                          +{count - 3}
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderPermisos = (rol) => {
      const nombre = (rol || "").toLowerCase();
      let tags = [];
      if (nombre.includes('admin') || nombre.includes('manager')) tags = ['Usuarios', 'Reportes', 'Configuración', 'Auditoría'];
      else if (nombre.includes('rrhh')) tags = ['Asistencia', 'Personal', 'Nómina'];
      else if (nombre.includes('auditor')) tags = ['Lectura Global', 'Logs', 'Exportar'];
      else tags = ['Portal Empleado', 'Marcaje'];

      return (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {tags.map((t, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', background: '#f1f5f9', border:'1px solid #e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight:'500' }}>
                      {t}
                  </span>
              ))}
          </div>
      );
  };

  // ESTILOS
  const tableHeaderStyle = { 
    padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0'
  };
  const tableCellStyle = { padding: '16px', borderBottom: '1px solid #f8fafc', fontSize: '0.9rem', color: '#334155', verticalAlign: 'middle' };

  return (
    // AQUÍ SE AÑADIÓ LA CLASE 'layout-watermark'
    <div className="layout layout-watermark" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Roles por Empresa</h1>
            </div>
            <button onClick={() => navigate("/admin/roles/crear")} style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}>
                <i className='bx bx-plus-circle' style={{fontSize:'1.2rem'}}></i> Crear Rol
            </button>
        </div>

        {/* FILTRO */}
        <div style={{ backgroundColor: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <i className='bx bx-search' style={{ color: '#94a3b8', fontSize: '1.2rem' }}></i>
            <input type="text" placeholder="Buscar por rol o empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#334155' }} />
        </div>

        {/* TABLA */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ ...tableHeaderStyle, width: '25%' }}>Empresa</th>
                            <th style={{ ...tableHeaderStyle, width: '20%' }}>Rol</th>
                            <th style={{ ...tableHeaderStyle, width: '15%' }}>Usuarios</th> 
                            <th style={{ ...tableHeaderStyle, width: '30%' }}>Permisos (Acceso)</th>
                            <th style={{ ...tableHeaderStyle, width: '10%', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando roles...</td></tr>}
                        
                        {!loading && filteredRows.map((r) => (
                            <tr key={r.id} style={{ transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = '#fcfcfc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                
                                <td style={tableCellStyle}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <div style={{width:'32px', height:'32px', background:'#f1f5f9', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                                            <i className='bx bxs-building-house'></i>
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.empresa_razon_social || "N/A"}</div>
                                    </div>
                                </td>
                                
                                <td style={tableCellStyle}>
                                    <div style={{ fontWeight:'600', color:'#334155', marginBottom:'2px' }}>{r.nombre_texto}</div>
                                    <div style={{ fontSize:'0.75rem', color:'#94a3b8', maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                        {r.descripcion || "Sin descripción"}
                                    </div>
                                </td>

                                <td style={tableCellStyle}>
                                    {renderAvatares(r.id)}
                                </td>

                                <td style={tableCellStyle}>
                                    {renderPermisos(r.nombre_texto)}
                                </td>
                                
                                <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button 
                                            onClick={() => navigate(`/admin/roles/editar/${r.id}`)}
                                            style={{ 
                                                width: '32px', height: '32px', borderRadius: '6px', 
                                                border: '1px solid #e2e8f0', background: 'white', color: '#64748b', 
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                transition:'0.2s' 
                                            }} 
                                            onMouseOver={e => e.currentTarget.style.color = '#3b82f6'} 
                                            onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                                        >
                                            <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                        </button>

                                        <button 
                                            onClick={() => handleDeleteClick(r)} 
                                            style={{ 
                                                width: '32px', height: '32px', borderRadius: '6px', 
                                                border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', 
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                transition:'0.2s' 
                                            }} 
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
                    <h3 style={{ margin: '0 0 10px 0', fontSize:'1.1rem' }}>¿Estás seguro?</h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize:'0.9rem' }}>Esta acción eliminará el rol seleccionado.</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowWarningModal(false)} style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Cancelar</button>
                        <button onClick={proceedToConfirm} style={{ flex: 1, padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Continuar</button>
                    </div>
                </div>
            </div>
        )}
        
        {showConfirmModal && (
             <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize:'1.1rem' }}>Confirmar</h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize:'0.9rem' }}>Eliminando <strong>{itemToDelete?.nombre_texto}</strong>...</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Cancelar</button>
                        <button onClick={executeDelete} style={{ flex: 1, padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Eliminar</button>
                    </div>
                </div>
            </div>
        )}

        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
                    <div style={{ color: '#16a34a', fontSize: '2.5rem', marginBottom: '10px' }}><i className='bx bx-check-circle'></i></div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize:'1.1rem' }}>¡Listo!</h3>
                    <p style={{ color: '#64748b', marginBottom: '20px', fontSize:'0.9rem' }}>{successMessage}</p>
                    <button onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600' }}>Aceptar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}