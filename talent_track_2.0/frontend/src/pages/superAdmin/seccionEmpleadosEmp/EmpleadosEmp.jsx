import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function EmpleadosEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // --- ESTADOS DE DATOS ---
  const [empresas, setEmpresas] = useState([]);
  const [puestos, setPuestos] = useState([]); 
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADO DE RECARGA (La solución al problema de refresco)
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // --- FILTROS ---
  const [filters, setFilters] = useState({
    empresa_id: "",
    puesto_id: "",
    search: "",
  });

  // --- MODALES ---
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const [itemToChangeStatus, setItemToChangeStatus] = useState(null);
  const [newStatus, setNewStatus] = useState(1); 
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const authHeaders = useMemo(() => (token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
  ), [token]);

  // --- HELPERS PARA AVATARES ---
  const getInitials = (firstName = "", lastName = "") => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || "?";
  };

  const getAvatarColor = (name) => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (status) => {
      switch (status) {
          case 1: return <span style={{background: '#dcfce7', color: '#16a34a', padding:'4px 10px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'}}>ACTIVO</span>;
          case 2: return <span style={{background: '#fef9c3', color: '#ca8a04', padding:'4px 10px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'}}>SUSPENDIDO</span>;
          case 3: return <span style={{background: '#fee2e2', color: '#dc2626', padding:'4px 10px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'}}>BAJA</span>;
          default: return <span style={{background: '#f1f5f9', color: '#64748b', padding:'4px 10px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:'bold'}}>N/A</span>;
      }
  };

  // 1. CARGAR EMPRESAS
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/listado-empresas/`, { headers: authHeaders });
        if (res.ok) setEmpresas(await res.json());
      } catch (e) { console.error(e); }
    };
    if (token) fetchEmpresas();
  }, [token, authHeaders]);

  // 2. CARGAR PUESTOS
  useEffect(() => {
    const fetchPuestos = async () => {
      if (!filters.empresa_id) {
        setPuestos([]);
        return;
      }
      try {
        const res = await apiFetch(`${API_BASE}/helpers/puestos-por-empresa/?empresa_id=${filters.empresa_id}`, { headers: authHeaders });
        if (res.ok) setPuestos(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchPuestos();
  }, [filters.empresa_id, authHeaders]);

  // 3. FETCH EMPLEADOS (Con gatillo de recarga)
  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.empresa_id) params.append("empresa_id", filters.empresa_id);
            if (filters.puesto_id) params.append("puesto_id", filters.puesto_id);
            if (filters.search) params.append("search", filters.search);

            // console.log("Cargando empleados..."); // Debug

            const res = await apiFetch(`${API_BASE}/empleados-empresa/?${params.toString()}`, { headers: authHeaders });
            
            if (res.ok) {
                const data = await res.json();
                setRows(Array.isArray(data) ? data : []);
            } else {
                setRows([]);
            }
        } catch (e) {
            console.error(e);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, 300);

    return () => clearTimeout(timer);

  }, [filters, token, authHeaders, reloadTrigger]); // <--- AÑADIDO reloadTrigger AQUÍ

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
        const newFilters = { ...prev, [name]: value };
        if (name === "empresa_id") newFilters.puesto_id = "";
        return newFilters;
    });
  };

  // --- ACCIONES (CAMBIO DE ESTADO) ---
  const openStatusModal = (emp) => {
      setItemToChangeStatus(emp);
      // Aseguramos que sea un número válido, si no, defecto a 1
      setNewStatus(emp.estado ? emp.estado : 1); 
      setShowStatusModal(true);
  };

  const executeStatusChange = async () => {
      if (!itemToChangeStatus) return;
      try {
          const res = await apiFetch(`${API_BASE}/empleados-empresa/${itemToChangeStatus.id}/`, {
              method: "PATCH",
              headers: authHeaders,
              body: JSON.stringify({ estado: parseInt(newStatus) })
          });

          if (!res.ok) throw new Error("Error al actualizar");

          setShowStatusModal(false);
          setSuccessTitle("Estado Actualizado");
          setSuccessMessage(`El estado de ${itemToChangeStatus.nombres} ha sido modificado correctamente.`);
          setShowSuccessModal(true);
          
          // FORZAMOS RECARGA AUMENTANDO EL CONTADOR
          setReloadTrigger(prev => prev + 1);

      } catch (error) {
          alert("Error al actualizar el estado.");
      }
  };

  // --- ELIMINACIÓN ---
  const handleDeleteClick = (emp) => { setItemToDelete(emp); setShowWarningModal(true); };
  const proceedToConfirm = () => { setShowWarningModal(false); setShowConfirmModal(true); };
  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await apiFetch(`${API_BASE}/empleados-empresa/${itemToDelete.id}/`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) { alert("No se pudo eliminar."); setShowConfirmModal(false); return; }
      
      setShowConfirmModal(false);
      setSuccessTitle("Empleado Eliminado");
      setSuccessMessage(`El registro ha sido eliminado.`);
      setShowSuccessModal(true);
      
      // FORZAMOS RECARGA
      setReloadTrigger(prev => prev + 1);

    } catch (e) { alert("Error eliminando."); setShowConfirmModal(false); }
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div className="content-area" style={{ padding: '32px' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Gestión de Empleados</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Directorio de personal y control de estados.</p>
                </div>
                <button onClick={() => navigate("/admin/empleados/crear")} className="btn-create" style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                    <i className='bx bx-user-plus' style={{fontSize: '1.2rem'}}></i> Nuevo Empleado
                </button>
            </div>

            {/* FILTROS */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Empresa:</label>
                    <div style={{ position: 'relative' }}>
                        <i className='bx bx-buildings' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                        <select name="empresa_id" value={filters.empresa_id} onChange={handleFilterChange} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b', appearance: 'none', backgroundColor: 'white', fontSize: '0.9rem' }}>
                            <option value="">Todas las empresas</option>
                            {empresas.map((e) => <option key={e.id} value={String(e.id)}>{e.razon_social}</option>)}
                        </select>
                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Puesto / Cargo:</label>
                    <div style={{ position: 'relative' }}>
                        <i className='bx bx-briefcase' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                        <select name="puesto_id" value={filters.puesto_id} onChange={handleFilterChange} disabled={!filters.empresa_id} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b', appearance: 'none', backgroundColor: filters.empresa_id ? 'white' : '#f3f4f6', fontSize: '0.9rem' }}>
                            <option value="">Todos los puestos</option>
                            {puestos.map((p) => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
                        </select>
                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Buscar:</label>
                    <div style={{ position: 'relative' }}>
                        <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                        <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Nombre, email..." style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b', fontSize: '0.9rem' }} />
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empleado</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Empresa / Unidad</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Puesto</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Contacto</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>Cargando datos...</td></tr>}
                            {!loading && rows.length === 0 && (<tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color: '#64748b'}}>No se encontraron empleados con estos filtros.</td></tr>)}

                            {!loading && rows.map((e) => (
                                <tr key={e.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '40px', height: '40px', borderRadius: '50%', 
                                            backgroundColor: getAvatarColor(e.nombres), 
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0
                                        }}>
                                            {getInitials(e.nombres, e.apellidos)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{e.nombres} {e.apellidos}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ingreso: {e.fecha_ingreso || "-"}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '500', color: '#334155' }}>{e.empresa_razon_social}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display:'flex', alignItems:'center', gap:'4px' }}><i className='bx bx-sitemap'></i> {e.unidad_nombre || "Sin Unidad"}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ color: '#0f172a' }}>{e.puesto_nombre || "N/A"}</div>
                                        {e.manager_nombre && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Jefe: {e.manager_nombre}</div>}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>{e.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.telefono}</div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>{getStatusBadge(e.estado)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button onClick={() => navigate(`/admin/empleados/editar/${e.id}`)} title="Editar" style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}><i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i></button>
                                            <button onClick={() => openStatusModal(e)} title="Cambiar Estado" style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}><i className='bx bx-refresh' style={{ fontSize: '1.1rem' }}></i></button>
                                            <button onClick={() => handleDeleteClick(e)} title="Eliminar" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s' }}><i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* MODAL ESTADO */}
        {showStatusModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <i className='bx bx-user-check' style={{ fontSize: '32px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Actualizar Estado</h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
                        Selecciona el nuevo estado para <strong>{itemToChangeStatus?.nombres}</strong>:
                    </p>
                    
                    <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.9rem' }}>Nuevo Estado:</label>
                        <select 
                            value={newStatus} 
                            onChange={(e) => setNewStatus(e.target.value)} 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1f2937' }}
                        >
                            <option value="1">Activo</option>
                            <option value="2">Suspendido</option>
                            <option value="3">Baja</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setShowStatusModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={executeStatusChange} style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL ADVERTENCIA Y ÉXITO */}
        {showWarningModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><i className='bx bx-error-alt' style={{ fontSize: '32px' }}></i></div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¡Advertencia!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.95rem' }}>Esta acción eliminará permanentemente al empleado y su historial.</p>
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
                    <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '0.95rem' }}>¿Seguro que deseas eliminar a <strong>"{itemToDelete?.nombres}"</strong>?</p>
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