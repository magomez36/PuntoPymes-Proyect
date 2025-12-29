import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; 
import '../../assets/css/admin-empresas.css'; 
import '../../assets/css/modal.css';

const logoEmpresa = "https://ui-avatars.com/api/?name=Empresa&background=random"; 

const EmpresasSuperAdmin = () => {
  // --- ESTADOS DE DATOS ---
  const [empresas, setEmpresas] = useState([]); // La lista original completa
  const [filteredEmpresas, setFilteredEmpresas] = useState([]); // La lista que se MUESTRA (filtrada)
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // --- ESTADOS DEL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [modalAction, setModalAction] = useState('toggle'); 
  const [modalStep, setModalStep] = useState(1); 

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/listado-empresas/`);
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      const data = await response.json();
      
      setEmpresas(data); 
      setFilteredEmpresas(data); // Al inicio, mostramos todas
      setLoading(false);
    } catch (error) {
      console.error("Error cargando empresas:", error);
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const handleFilter = () => {
    let resultado = empresas;

    // 1. Filtrar por texto (Nombre, Razón Social o RUC)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(emp => 
        emp.nombre_comercial.toLowerCase().includes(term) ||
        emp.razon_social.toLowerCase().includes(term) ||
        emp.ruc_nit.toLowerCase().includes(term)
      );
    }

    // 2. Filtrar por Estado
    if (statusFilter !== 'todos') {
      resultado = resultado.filter(emp => 
        emp.estado_nombre.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredEmpresas(resultado);
  };

  // Helper para actualizar ambas listas (original y filtrada) tras un cambio CRUD
  const updateLocalLists = (updatedList) => {
    setEmpresas(updatedList);
    // Re-aplicamos filtros sobre la nueva lista para mantener la vista consistente
    // Nota simplificada: Aquí actualizamos la filtrada directamente con la nueva lista
    // Si quisieras mantener el filtro activo estrictamente, deberías re-ejecutar la lógica de filtro.
    // Por usabilidad, a veces es mejor resetear o actualizar directo:
    setFilteredEmpresas(updatedList); 
  };

  // --- LÓGICA DE MODALES (Igual que antes) ---
  const iniciarCambioEstado = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalAction('toggle');
    setModalStep(1);
    setShowModal(true);
  };

  const iniciarEliminacion = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setModalAction('delete');
    setModalStep(1);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEmpresaSeleccionada(null);
    setModalStep(1);
  };

  const handleModalAction = async () => {
    if (modalAction === 'toggle') {
      await ejecutarCambioEstado();
    } else if (modalAction === 'delete') {
      if (modalStep === 1) {
        setModalStep(2);
      } else {
        await ejecutarEliminacionReal();
      }
    }
  };

  // --- API ACTIONS ---
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
        const nuevaLista = empresas.map(emp => {
          if (emp.id === id) {
            const nuevoEstadoNombre = emp.estado_nombre === 'activo' ? 'inactivo' : 'activo';
            const nuevoEstadoId = emp.estado === 1 ? 2 : 1; 
            return { ...emp, estado_nombre: nuevoEstadoNombre, estado: nuevoEstadoId };
          }
          return emp;
        });
        updateLocalLists(nuevaLista);
        cerrarModal();
      } else {
        alert("No se pudo cambiar el estado.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión.");
    }
  };

  const ejecutarEliminacionReal = async () => {
    if (!empresaSeleccionada) return;
    const { id } = empresaSeleccionada;

    try {
      const response = await fetch(`${API_BASE_URL}/empresas/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const nuevaLista = empresas.filter(emp => emp.id !== id);
        updateLocalLists(nuevaLista);
        cerrarModal();
      } else {
        alert("Error al eliminar. Verifica datos relacionados.");
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error de conexión.");
    }
  };

  // --- RENDER MODAL CONTENT ---
  const renderModalContent = () => {
    if (!empresaSeleccionada) return null;

    if (modalAction === 'toggle') {
      const isActivating = empresaSeleccionada.estado_nombre !== 'activo';
      return (
        <>
          <div className={`modal-icon ${isActivating ? 'icon-success' : 'icon-warning'}`}>
            <i className={`bx ${isActivating ? 'bx-check-circle' : 'bx-power-off'}`}></i>
          </div>
          <h3 className="modal-title">Confirmar cambio de estado</h3>
          <p className="modal-text">
            ¿Deseas <strong>{isActivating ? 'ACTIVAR' : 'DESACTIVAR'}</strong> la empresa <span className="company-name-highlight">"{empresaSeleccionada.nombre_comercial}"</span>?
            <br/><br/>
            Este cambio afectará inmediatamente el acceso al sistema.
          </p>
          <div className="modal-actions">
            <button className="btn-modal btn-cancel" onClick={cerrarModal}>Cancelar</button>
            <button 
              className={`btn-modal ${isActivating ? 'btn-confirm-success' : 'btn-confirm-warning'}`} 
              onClick={handleModalAction}
            >
              Confirmar
            </button>
          </div>
        </>
      );
    }

    if (modalAction === 'delete' && modalStep === 1) {
      return (
        <>
          <div className="modal-icon icon-danger">
            <i className='bx bxs-trash'></i>
          </div>
          <h3 className="modal-title">¿Eliminar Empresa?</h3>
          <p className="modal-text">
            Vas a eliminar permanentemente: <br/>
            <span className="company-name-highlight">"{empresaSeleccionada.nombre_comercial}"</span>
            <br/><br/>
            Esta acción <strong>no se puede deshacer</strong>.
          </p>
          <div className="modal-actions">
            <button className="btn-modal btn-cancel" onClick={cerrarModal}>Cancelar</button>
            <button className="btn-modal btn-confirm-danger" onClick={handleModalAction}>Sí, Eliminar</button>
          </div>
        </>
      );
    }

    if (modalAction === 'delete' && modalStep === 2) {
      return (
        <>
          <div className="modal-icon icon-danger">
            <i className='bx bxs-error-alt'></i>
          </div>
          <h3 className="modal-title">Advertencia Final</h3>
          <p className="modal-text">
            La eliminación borrará también los siguientes datos asociados:
          </p>
          <div className="warning-list">
            <ul>
              <li>Usuarios y accesos del sistema</li>
              <li>Unidades organizacionales y puestos</li>
              <li>Registros de asistencia y turnos</li>
              <li>Configuraciones de nómina y reportes</li>
            </ul>
          </div>
          <div className="modal-actions">
            <button className="btn-modal btn-cancel" onClick={cerrarModal}>Cancelar</button>
            <button className="btn-modal btn-confirm-danger" onClick={handleModalAction}>Comprendo, Eliminar</button>
          </div>
        </>
      );
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        
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
          <div className="page-header-section">
            <div>
              <h1 className="page-main-title">Listado de Empresas</h1>
              <p className="page-subtitle">Administra y supervisa las empresas registradas en la plataforma.</p>
            </div>
            <Link to="/admin/empresas/crear-empresa" className="btn-create-company" style={{ textDecoration: 'none' }}>
              <i className='bx bx-plus'></i> Crear Empresa
            </Link>
          </div>

          {/* --- SECCIÓN DE FILTROS ACTUALIZADA --- */}
          <div className="filters-section">
            <div className="search-filter">
              <i className='bx bx-search'></i>
              <input 
                type="text" 
                placeholder="Buscar por nombre o RUC..." 
                className="search-input-table"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()} // Filtrar al dar Enter
              />
            </div>
            <div className="filter-actions">
              <select 
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              
              <button className="btn-filter" onClick={handleFilter}>
                <i className='bx bx-filter-alt'></i> Filtrar
              </button>
            </div>
          </div>

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

                  {!loading && filteredEmpresas.map((empresa) => (
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
                  
                  {!loading && filteredEmpresas.length === 0 && (
                     <tr><td colSpan="8" style={{textAlign:'center', padding:'30px', color: '#6b7280'}}>
                        No se encontraron empresas con esos filtros.
                     </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-section">
              <div className="pagination-info">Mostrando {filteredEmpresas.length} resultados</div>
            </div>
          </div>
        </div>

        {/* --- MODAL --- */}
        {showModal && empresaSeleccionada && (
          <div className="modal-overlay">
            <div className="modal-content">
               {renderModalContent()}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EmpresasSuperAdmin;