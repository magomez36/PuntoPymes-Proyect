import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; 
import '../../assets/css/admin-empresas.css'; 
import '../../assets/css/modal.css';

// Imagen por defecto si la empresa no tiene logo
const logoEmpresa = "https://ui-avatars.com/api/?name=Empresa&background=random"; 

const EmpresasSuperAdmin = () => {
  // --- ESTADOS DE DATOS ---
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DEL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [modalAction, setModalAction] = useState('toggle'); // 'toggle' (estado) o 'delete' (eliminar)

  // URL base de tu API
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // 1. CARGAR EMPRESAS
  const fetchEmpresas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/listado-empresas/`);
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      const data = await response.json();
      setEmpresas(data); 
      setLoading(false);
    } catch (error) {
      console.error("Error cargando empresas:", error);
      setLoading(false);
    }
  };

  // --- LÓGICA DEL MODAL ---

  // A) Abrir modal para CAMBIAR ESTADO
  const iniciarCambioEstado = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalAction('toggle');
    setShowModal(true);
  };

  // B) Abrir modal para ELIMINAR
  const iniciarEliminacion = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalAction('delete');
    setShowModal(true);
  };

  // C) Cerrar Modal
  const cerrarModal = () => {
    setShowModal(false);
    setEmpresaSeleccionada(null);
  };

  // D) Manejador central del botón "Confirmar"
  const handleConfirmacion = async () => {
    if (modalAction === 'toggle') {
      await ejecutarCambioEstado();
    } else if (modalAction === 'delete') {
      await ejecutarEliminacion();
    }
  };

  // --- ACCIONES A LA API ---

  // Acción 1: Cambiar Estado (PATCH)
  const ejecutarCambioEstado = async () => {
    if (!empresaSeleccionada) return;
    const { id } = empresaSeleccionada;

    try {
      const response = await fetch(`${API_BASE_URL}/empresas/${id}/toggle-estado/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) 
      });

      if (response.ok) {
        // Actualizamos la lista localmente
        setEmpresas(prev => prev.map(emp => {
          if (emp.id === id) {
            const nuevoEstadoNombre = emp.estado_nombre === 'activo' ? 'inactivo' : 'activo';
            const nuevoEstadoId = emp.estado === 1 ? 2 : 1; 
            return { ...emp, estado_nombre: nuevoEstadoNombre, estado: nuevoEstadoId };
          }
          return emp;
        }));
        cerrarModal();
      } else {
        alert("No se pudo cambiar el estado.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión.");
    }
  };

  // Acción 2: Eliminar Empresa (DELETE)
  const ejecutarEliminacion = async () => {
    if (!empresaSeleccionada) return;
    const { id } = empresaSeleccionada;

    try {
      const response = await fetch(`${API_BASE_URL}/empresas/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Eliminamos de la lista localmente
        setEmpresas(prev => prev.filter(emp => emp.id !== id));
        cerrarModal();
      } else {
        alert("Error al eliminar. Verifica si la empresa tiene datos relacionados.");
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error de conexión al eliminar.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        
        {/* Header Superior */}
        <header className="header">
          <h2 className="header-title">Gestión de Empresas</h2>
          <div className="header-actions">
            <div className="search-box">
              <i className='bx bx-search'></i>
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>
        </header>

        <div className="content-area">
          
          {/* Título y Botón Crear */}
          <div className="page-header-section">
            <div>
              <h1 className="page-main-title">Listado de Empresas</h1>
              <p className="page-subtitle">Visualiza, crea, modifica y administra el estado de las empresas.</p>
            </div>
            <Link to="/admin/empresas/crear-empresa" className="btn-create-company" style={{ textDecoration: 'none' }}>
              <i className='bx bx-plus'></i> Crear Empresa
            </Link>
          </div>

          {/* Filtros */}
          <div className="filters-section">
            <div className="search-filter">
              <i className='bx bx-search'></i>
              <input type="text" placeholder="Buscar por nombre o CIF..." className="search-input-table" />
            </div>
            <div className="filter-actions">
              <select className="status-filter">
                <option>Todos los estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
              <button className="btn-filter">
                <i className='bx bx-filter-alt'></i> Filtrar
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>LOGO</th>
                    <th>RAZON SOCIAL</th>
                    <th>NOMBRE EMPRESA</th>
                    <th>RUC</th>
                    <th>PAIS</th>
                    <th>MONEDA</th>
                    <th>ESTADO</th>
                    <th style={{ textAlign: 'center' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>Cargando datos...</td></tr>
                  )}

                  {!loading && empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td>
                        <img 
                          src={logoEmpresa} 
                          alt="Logo"
                          className="company-logo-mini"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                        />
                      </td>
                      <td>{empresa.razon_social}</td>
                      <td><div className="company-name">{empresa.nombre_comercial}</div></td>
                      <td>{empresa.ruc_nit}</td>
                      <td>{empresa.pais_nombre}</td>
                      <td>{empresa.moneda_nombre ? empresa.moneda_nombre.split('(')[0] : 'USD'}</td>
                      <td>
                        <span className={`status-badge status-${empresa.estado_nombre === 'activo' ? 'active' : 'inactive'}`}>
                          {empresa.estado_nombre ? empresa.estado_nombre.charAt(0).toUpperCase() + empresa.estado_nombre.slice(1) : ''}
                        </span>
                      </td>
                      
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          
                          <Link to={`/admin/empresas/ver-empresa/${empresa.id}`} className="btn-action" title="Ver Detalles">
                             <i className='bx bxs-show'></i>
                          </Link>
                          
                          <Link to={`/admin/empresas/editar-empresa/${empresa.id}`} className="btn-action" title="Editar">
                             <i className='bx bxs-edit-alt'></i>
                          </Link>

                          {/* Botón Cambiar Estado */}
                          <button 
                            className="btn-action" 
                            title={empresa.estado_nombre === 'activo' ? "Desactivar" : "Activar"}
                            onClick={() => iniciarCambioEstado(empresa)}
                            style={{ 
                                backgroundColor: empresa.estado_nombre === 'activo' ? '#fff3cd' : '#d1f4e0', 
                                color: empresa.estado_nombre === 'activo' ? '#ffc107' : '#0f5132',
                                border: 'none'
                            }}
                          >
                            <i className='bx bx-revision'></i>
                          </button>

                          {/* Botón Eliminar */}
                          <button 
                            className="btn-action btn-danger" 
                            title="Eliminar Empresa"
                            onClick={() => iniciarEliminacion(empresa)}
                          >
                             <i className='bx bxs-trash'></i>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {!loading && empresas.length === 0 && (
                     <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>No hay empresas registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-section">
              <div className="pagination-info">Mostrando {empresas.length} resultados</div>
            </div>
          </div>
        </div>

        {/* --- MODAL DINÁMICO (Cambio de Estado / Eliminar) --- */}
        {showModal && empresaSeleccionada && (
          <div className="modal-overlay">
            <div className="modal-content">
               {/* Icono dinámico: Rojo para borrar, Amarillo/Verde para estado */}
               <div className="modal-icon" style={{ 
                   backgroundColor: modalAction === 'delete' ? '#fee2e2' : '#e0e7ff',
                   color: modalAction === 'delete' ? '#dc2626' : '#4f46e5'
               }}>
                 <i className={`bx ${modalAction === 'delete' ? 'bxs-trash' : 'bx-error-circle'}`}></i>
               </div>

               <h3 className="modal-title">
                 {modalAction === 'delete' ? '¿Eliminar Empresa?' : 'Confirmar Acción'}
               </h3>
               
               <p className="modal-text">
                 {modalAction === 'delete' ? (
                   <>
                     Esta acción es <strong>irreversible</strong>. Se eliminará permanentemente la empresa:
                     <br/><strong>"{empresaSeleccionada.nombre_comercial}"</strong>
                   </>
                 ) : (
                   <>
                     Vas a <strong>{empresaSeleccionada.estado_nombre === 'activo' ? 'desactivar' : 'activar'}</strong> la empresa:
                     <br/><strong>"{empresaSeleccionada.nombre_comercial}"</strong>
                   </>
                 )}
               </p>
               
               <div className="modal-actions">
                 <button className="btn-modal-cancel" onClick={cerrarModal}>Cancelar</button>
                 
                 <button 
                   className="btn-modal-confirm" 
                   onClick={handleConfirmacion}
                   style={{
                     background: modalAction === 'delete' 
                       ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' // Rojo fuerte para borrar
                       : 'linear-gradient(135deg, #d51e37 0%, #a81729 100%)' // Tu rojo normal
                   }}
                 >
                   {modalAction === 'delete' ? 'Sí, Eliminar' : 'Confirmar'}
                 </button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EmpresasSuperAdmin;