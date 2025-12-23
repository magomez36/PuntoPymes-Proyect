import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoEmpresa from '../../assets/img/logos_Empresas/logo_empresa_deafult.svg'; 
import Sidebar from '../../components/Sidebar';
import '../../assets/css/modal.css';

const EmpresasSuperAdmin = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADO PARA EL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  // URLs de tu API
  const API_URL = 'http://127.0.0.1:8000/api/listado-empresas/';

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await fetch(API_URL);
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
  
  // 1. Abrir Modal (Prepara los datos pero no ejecuta nada aún)
  const iniciarCambioEstado = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setShowModal(true);
  };

  // 2. Cerrar Modal
  const cerrarModal = () => {
    setShowModal(false);
    setEmpresaSeleccionada(null);
  };

  // 3. Confirmar Acción (Se ejecuta al dar click en "Confirmar" en el modal)
  const confirmarCambioEstado = async () => {
    if (!empresaSeleccionada) return;

    const { id, estado_nombre } = empresaSeleccionada;
    // const accion = estado_nombre === 'activo' ? 'desactivar' : 'activar'; // Para logs si quieres

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/empresas/${id}/toggle-estado/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) 
      });

      if (response.ok) {
        setEmpresas(prevEmpresas => prevEmpresas.map(emp => {
          if (emp.id === id) {
            const nuevoEstadoNombre = emp.estado_nombre === 'activo' ? 'inactivo' : 'activo';
            const nuevoEstadoId = emp.estado === 1 ? 2 : 1; 
            return { ...emp, estado_nombre: nuevoEstadoNombre, estado: nuevoEstadoId };
          }
          return emp;
        }));
        cerrarModal(); // Cerramos el modal tras el éxito
      } else {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        alert("No se pudo cambiar el estado.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión.");
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
              <p className="page-subtitle">Visualiza, crea, modifica y administra el estado de las empresas.</p>
            </div>
            <Link to="/admin/empresas/crear-empresa" className="btn-create-company" style={{ textDecoration: 'none' }}>
              <i className='bx bx-plus'></i> Crear Empresa
            </Link>
          </div>

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
                    {/* CAMBIO: Texto centrado en el header */}
                    <th style={{ textAlign: 'center' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan="8" style={{textAlign:'center', padding:'20px'}}>Cargando...</td></tr>
                  )}

                  {!loading && empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td>
                        <img 
                          src={logoEmpresa} 
                          alt="Logo"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                        />
                      </td>
                      <td>{empresa.razon_social}</td>
                      <td><div className="company-name">{empresa.nombre_comercial}</div></td>
                      <td>{empresa.ruc_nit}</td>
                      <td>{empresa.pais_nombre}</td>
                      <td>{empresa.moneda_nombre.split('(')[0]}</td>
                      <td>
                        <span className={`status-badge status-${empresa.estado_nombre === 'activo' ? 'active' : 'inactive'}`}>
                          {empresa.estado_nombre ? empresa.estado_nombre.charAt(0).toUpperCase() + empresa.estado_nombre.slice(1) : ''}
                        </span>
                      </td>
                      
                      {/* CAMBIO: Celda centrada y nuevos iconos */}
                      <td style={{ textAlign: 'center' }}>
                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                          
                          {/* Ver (Icono Sólido) */}
                          <Link to={`/admin/empresas/ver-empresa/${empresa.id}`} className="btn-action" title="Ver Detalles">
                             <i className='bx bxs-show'></i>
                          </Link>
                          
                          {/* Editar (Icono Sólido) */}
                          <Link to={`/admin/empresas/editar-empresa/${empresa.id}`} className="btn-action" title="Editar">
                             <i className='bx bxs-edit-alt'></i>
                          </Link>

                          {/* Cambiar Estado (Usa Modal) */}
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

                          {/* CAMBIO: Botón Eliminar (Icono Sólido + Estilo Danger) */}
                          <button 
                            className="btn-action btn-danger" 
                            title="Eliminar (Próximamente)"
                            onClick={() => alert("Funcionalidad de eliminar pendiente")}
                          >
                             <i className='bx bxs-trash'></i>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pagination-section">
              <div className="pagination-info">Mostrando {empresas.length} resultados</div>
            </div>
          </div>
        </div>

        {/* --- MODAL PERSONALIZADO (Renderizado condicional) --- */}
        {showModal && empresaSeleccionada && (
          <div className="modal-overlay">
            <div className="modal-content">
               <div className="modal-icon">
                 <i className='bx bx-error-circle'></i>
               </div>
               <h3 className="modal-title">¿Estás seguro?</h3>
               <p className="modal-text">
                 Vas a <strong>{empresaSeleccionada.estado_nombre === 'activo' ? 'desactivar' : 'activar'}</strong> la empresa:
                 <br/>
                 "{empresaSeleccionada.nombre_comercial}"
               </p>
               
               <div className="modal-actions">
                 <button className="btn-modal-cancel" onClick={cerrarModal}>Cancelar</button>
                 <button className="btn-modal-confirm" onClick={confirmarCambioEstado}>Confirmar Cambio</button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default EmpresasSuperAdmin;