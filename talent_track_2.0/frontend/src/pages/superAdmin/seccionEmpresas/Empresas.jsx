import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// --- COMPONENTES Y ESTILOS ---
import Sidebar from "../../../components/Sidebar"; 
import '../../../assets/css/admin-empresas.css'; 
import '../../../assets/css/modal.css';

const Empresas = () => {
  const navigate = useNavigate();
  const API_BASE = "http://127.0.0.1:8000/api";

  // --- ESTADOS ---
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [modalAction, setModalAction] = useState(null); 
  const [modalStep, setModalStep] = useState(1); 

  // --- 1. CARGA DE DATOS ---
  const fetchEmpresas = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/listado-empresas/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al conectar con el servidor');
      
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setEmpresas(lista);
      setFilteredEmpresas(lista); 
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // --- 2. FILTRADO ---
  const handleFilter = () => {
    let resultado = empresas;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(emp => 
        (emp.nombre_comercial || "").toLowerCase().includes(term) ||
        (emp.razon_social || "").toLowerCase().includes(term) ||
        (emp.ruc_nit || "").toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'todos') {
      resultado = resultado.filter(emp => 
        (emp.estado_nombre || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredEmpresas(resultado);
  };

  // --- 3. MODALES ---
  const iniciarAccion = (empresa, accion) => {
    setEmpresaSeleccionada(empresa);
    setModalAction(accion);
    setModalStep(1);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEmpresaSeleccionada(null);
    setModalStep(1);
    setModalAction(null);
  };

  const confirmarAccion = async () => {
    if (!empresaSeleccionada) return;

    if (modalAction === 'delete' && modalStep === 1) {
      setModalStep(2);
      return;
    }

    const { id } = empresaSeleccionada;
    const token = getAccessToken();
    let url = modalAction === 'delete' ? `${API_BASE}/empresas/${id}/` : `${API_BASE}/empresas/${id}/toggle-estado/`;
    let method = modalAction === 'delete' ? "DELETE" : "PATCH";

    try {
      const res = await apiFetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchEmpresas(); 
        cerrarModal();
      } else {
        alert("No se pudo completar la acción.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  // Helper para iniciales
  const getInitials = (name) => {
     if(!name) return "EM";
     return name.substring(0, 2).toUpperCase();
  };

  // --- RENDERIZADO DEL MODAL ---
  const renderModalContent = () => {
    if (!empresaSeleccionada) return null;

    // A) CAMBIO DE ESTADO
    if (modalAction === 'toggle') {
      const isActivating = empresaSeleccionada.estado_nombre !== 'activo';
      return (
        <>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: isActivating ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <i className={`bx ${isActivating ? 'bx-check-circle' : 'bx-power-off'}`} style={{ fontSize: '40px', color: isActivating ? '#16a34a' : '#dc2626' }}></i>
          </div>
          <h3 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Confirmar cambio de estado</h3>
          <p className="modal-text" style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
            ¿Deseas <strong>{isActivating ? 'ACTIVAR' : 'DESACTIVAR'}</strong> la empresa <span style={{ fontWeight: '600', color: '#111827' }}>"{empresaSeleccionada.nombre_comercial}"</span>?
          </p>
          <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn-modal" onClick={cerrarModal} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button className="btn-modal" onClick={confirmarAccion} style={{ padding: '10px 20px', backgroundColor: isActivating ? '#16a34a' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Confirmar</button>
          </div>
        </>
      );
    }

    // B) ELIMINAR (2 PASOS)
    if (modalAction === 'delete') {
       if (modalStep === 1) {
            return (
                <div style={{ padding: '10px 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <i className='bx bxs-trash' style={{ fontSize: '40px', color: '#dc2626' }}></i>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Advertencia de Eliminación</h3>
                  <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '24px' }}>
                      Vas a eliminar a <strong style={{ color: '#111827' }}>{empresaSeleccionada.nombre_comercial}</strong>.
                  </p>
                  
                  {/* LISTA DE ADVERTENCIA */}
                  <div style={{ backgroundColor: '#fff1f2', borderLeft: '4px solid #dc2626', padding: '15px', borderRadius: '6px', marginBottom: '24px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: '#991b1b', fontWeight: '700', fontSize: '0.9rem' }}>
                        <i className='bx bx-error-circle' style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                        <span>Se eliminará permanentemente:</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b', fontSize: '0.85rem', lineHeight: '1.5' }}>
                          <li>Cuentas de usuarios y administradores.</li>
                          <li>Historiales de actividad y registros.</li>
                          <li>Configuraciones y sucursales.</li>
                      </ul>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={cerrarModal} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                      <button onClick={confirmarAccion} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Entendido, Continuar</button>
                  </div>
                </div>
            );
       }
       if (modalStep === 2) {
            return (
                <div style={{ padding: '10px 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <i className='bx bxs-error-alt' style={{ fontSize: '45px', color: '#dc2626' }}></i>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¿Estás absolutamente seguro?</h3>
                  <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '32px' }}>
                      Esta acción es <strong>irreversible</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button onClick={() => setModalStep(1)} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}>Atrás</button>
                      <button onClick={confirmarAccion} style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Sí, Eliminar</button>
                  </div>
                </div>
            );
       };
    }
  };

  // --- RENDERIZADO PRINCIPAL (SIN HEADER BLANCO SUPERIOR) ---
  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        
        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENIDO PRINCIPAL */}
        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {/* YA NO HAY HEADER AQUÍ - Diseño más limpio */}
            
            {/* ÁREA DE TRABAJO */}
            <div className="content-area" style={{ padding: '40px' }}>

                {/* Título y Botón Crear */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Listado de Empresas</h1>
                        <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '1rem' }}>Administra y supervisa las empresas registradas en la plataforma.</p>
                    </div>
                    
                    {/* BOTÓN CREAR CON ICONO AUMENTADO */}
                    <button 
                        onClick={() => navigate("/admin/empresas/crear")} 
                        className="btn-create" 
                        style={{ 
                            backgroundColor: '#dc2626', 
                            color: 'white', 
                            padding: '12px 24px', 
                            borderRadius: '10px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    >
                        {/* Icono más grande y visible */}
                        <i className='bx bx-plus-circle' style={{ fontSize: '1.3rem' }}></i> 
                        Crear Empresa
                    </button>
                </div>

                {errorMsg && (
                    <div style={{ marginBottom: 20, color: 'white', background: '#ef4444', padding: 15, borderRadius: 8 }}>{errorMsg}</div>
                )}

                {/* Filtros */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                        <i className='bx bx-search' style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.2rem' }}></i>
                        <input 
                          type="text" 
                          placeholder="Buscar por nombre, razón social o RUC..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleFilter()} 
                          style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.95rem' }}
                        />
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#374151', backgroundColor: 'white', cursor: 'pointer', minWidth: '150px' }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <button 
                        onClick={handleFilter} 
                        style={{ padding: '12px 24px', backgroundColor: '#1f2937', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}
                    >
                        <i className='bx bx-filter'></i> Filtrar
                    </button>
                </div>

                {/* Tabla */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <tr>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>Logo</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>Razón Social</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>Nombre Comercial</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>RUC</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>País</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#111827', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#374151'}}>Cargando...</td></tr>}
                            {!loading && filteredEmpresas.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#6b7280'}}>No se encontraron resultados.</td></tr>}

                            {!loading && filteredEmpresas.map((empresa) => (
                            <tr key={empresa.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                {/* Logo Iniciales */}
                                <td style={{ padding: '16px' }}>
                                  <div style={{ width: '40px', height: '40px', backgroundColor: '#be185d', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                      {getInitials(empresa.nombre_comercial)}
                                  </div>
                                </td>
                                
                                <td style={{ padding: '16px', fontSize: '0.9rem', color: '#1f2937', fontWeight: '500' }}>{empresa.razon_social}</td>
                                <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>{empresa.nombre_comercial}</td>
                                <td style={{ padding: '16px', color: '#374151' }}>{empresa.ruc_nit}</td>
                                <td style={{ padding: '16px', color: '#374151' }}>{empresa.pais_nombre ?? empresa.pais}</td>
                                
                                {/* Badge Estado */}
                                <td style={{ padding: '16px' }}>
                                  <span style={{ 
                                      backgroundColor: (empresa.estado_nombre || '').toLowerCase() === 'activo' ? '#dcfce7' : '#fee2e2', 
                                      color: (empresa.estado_nombre || '').toLowerCase() === 'activo' ? '#15803d' : '#b91c1c', 
                                      padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
                                  }}>
                                      {empresa.estado_nombre ?? empresa.estado}
                                  </span>
                                </td>
                                
                                {/* Acciones */}
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                      <button onClick={() => navigate(`/admin/empresas/ver/${empresa.id}`)} style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }} title="Ver">
                                        <i className='bx bx-show' style={{ fontSize: '1.1rem' }}></i>
                                      </button>
                                      <button onClick={() => navigate(`/admin/empresas/editar/${empresa.id}`)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }} title="Editar">
                                        <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                      </button>
                                      <button onClick={() => iniciarAccion(empresa, 'toggle')} style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }} title="Estado">
                                        <i className='bx bx-power-off' style={{ fontSize: '1.1rem' }}></i>
                                      </button>
                                      <button onClick={() => iniciarAccion(empresa, 'delete')} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }} title="Eliminar">
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
        </main>

        {/* MODAL OVERLAY */}
        {showModal && empresaSeleccionada && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
               {renderModalContent()}
            </div>
          </div>
        )}
    </div>
  );
};

export default Empresas;