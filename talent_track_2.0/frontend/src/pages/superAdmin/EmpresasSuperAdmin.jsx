import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // <--- IMPORTANTE: Importamos el Sidebar
import logoEmpresaDefault from '../../../../backend/media/logo_empresa/default_logo_empresa.svg'; // Asegúrate de que la ruta es correcta

const EmpresasSuperAdmin = () => {
  return (
    // ESTRUCTURA CLAVE: .layout > Sidebar + .main-content
    <div className="layout">
      
      {/* 1. Ponemos el Sidebar aquí a la izquierda */}
      <Sidebar />

      {/* 2. El contenido principal a la derecha */}
      <main className="main-content">
        
        {/* Header de la página */}
        <header className="header">
          <h2 className="header-title">Gestión de Empresas (Menú Consolidado - con Visualizar)</h2>
          <div className="header-actions">
            <div className="search-box">
              <i className='bx bx-search'></i>
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>
        </header>

        <div className="content-area">
          {/* Page Header */}
          <div className="page-header-section">
            <div>
              <h1 className="page-main-title">Listado de Empresas</h1>
              <p className="page-subtitle">Visualiza, crea, modifica y elimina empresas.</p>
            </div>
            <Link to="/admin/create-company" className="btn-create-company" style={{ textDecoration: 'none' }}>
              <i className='bx bx-plus'></i>
              Crear Empresa
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
                <option>Pendiente</option>
                <option>Inactivo</option>
              </select>
              <button className="btn-filter">
                <i className='bx bx-filter-alt'></i>
                Filtrar
              </button>
            </div>
          </div>

          {/* Tabla de Empresas */}
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
                  {/* Fila 1 */}
                  <tr>
                    <td>
                    <img 
                        src={logoEmpresaDefault}  // Usamos la variable importada
                        alt="Logo Empresa"
                        style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'cover',
                        borderRadius: '8px' 
                        }} 
                    />
                    </td>
                    <td>Innovate Corp S.A</td>
                    <td><div className="company-name">Innovate Corp</div></td>
                    <td>C12345678</td>
                    <td>Chile</td>
                    <td>Peso Chileno</td>
                    <td><span className="status-badge status-active">Activo</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action"><i className='bx bx-show'></i></button>
                        <button className="btn-action"><i className='bx bx-edit-alt'></i></button>
                        <button className="btn-action btn-danger"><i className='bx bx-trash'></i></button>
                      </div>
                    </td>
                  </tr>
                  {/* ... resto de filas ... */}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="pagination-section">
              <div className="pagination-info">Mostrando 1 a 6 de 128 resultados</div>
              <div className="pagination-controls">
                <button className="pagination-btn" disabled><i className='bx bx-chevron-left'></i></button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn"><i className='bx bx-chevron-right'></i></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmpresasSuperAdmin;