import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoEmpresa from '../../assets/img/logos_Empresas/logo_empresa_deafult.svg'; // Imagen por defecto  
import Sidebar from '../../components/Sidebar';

const EmpresasSuperAdmin = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  // URLs de tu API
  const API_URL = 'http://127.0.0.1:8000/api/listado-empresas/';
  //const BACKEND_BASE = 'http://127.0.0.1:8000'; // Para las imágenes

  // 1. Cargar empresas al inicio
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

  // 2. FUNCIÓN ACTUALIZADA: Toggle Estado con la URL CORRECTA
  const toggleEstado = async (id, estadoNombreActual) => {
    const accion = estadoNombreActual === 'activo' ? 'desactivar' : 'activar';
    
    if (!window.confirm(`¿Estás seguro de que deseas ${accion} esta empresa?`)) return;

    try {
      // --- CAMBIO APLICADO AQUÍ ---
      // Usamos la ruta correcta: /api/empresas/{id}/toggle-estado/
      const response = await fetch(`http://127.0.0.1:8000/api/empresas/${id}/toggle-estado/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Si usaras token
        },
        body: JSON.stringify({}) // Body vacío
      });

      if (response.ok) {
        // Opción B: Actualizar localmente para que sea instantáneo
        setEmpresas(prevEmpresas => prevEmpresas.map(emp => {
          if (emp.id === id) {
            // Invertimos la lógica localmente
            const nuevoEstadoNombre = emp.estado_nombre === 'activo' ? 'inactivo' : 'activo';
            const nuevoEstadoId = emp.estado === 1 ? 2 : 1; 
            
            return { 
              ...emp, 
              estado_nombre: nuevoEstadoNombre,
              estado: nuevoEstadoId
            };
          }
          return emp;
        }));

      } else {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        alert("No se pudo cambiar el estado. Revisa la consola.");
      }

    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión al intentar cambiar el estado.");
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

        <div className="content-area" style={{ marginTop: '30px' }}>
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
                    <th>ACCIONES</th>
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
                          src={logoEmpresa} // Usamos la imagen por defecto como tenías configurado
                          alt="Logo"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
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
                      <td>
                        <div className="action-buttons">
                          <Link to={`/admin/empresas/ver-empresa/${empresa.id}`} className="btn-action" title="Ver">
                             <i className='bx bx-show'></i>
                          </Link>

                          <Link to={`/admin/empresas/editar-empresa/${empresa.id}`} className="btn-action" title="Editar">
                             <i className='bx bx-edit-alt'></i>
                          </Link>

                          {/* BOTÓN CAMBIAR ESTADO */}
                          <button 
                            className="btn-action" 
                            title={empresa.estado_nombre === 'activo' ? "Desactivar Empresa" : "Activar Empresa"}
                            onClick={() => toggleEstado(empresa.id, empresa.estado_nombre)}
                            style={{ backgroundColor: '#fff3cd', color: '#ffc107', border: 'none', cursor: 'pointer' }}
                          >
                            <i className='bx bx-revision'></i>
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
              {/* Controles de paginación... */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmpresasSuperAdmin;