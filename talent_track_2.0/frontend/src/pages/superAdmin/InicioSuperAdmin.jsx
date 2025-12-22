import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const InicioSuperAdmin = () => {
  return (
    <div className="layout">
      {/* 1. Sidebar Inteligente (Reemplaza al sidebar estático del HTML) */}
      <Sidebar />

      {/* 2. Contenido Principal */}
      <main className="main-content">
        
        {/* Header */}
        <header className="header">
          <h2 className="header-title">Bienvenido, (Superadmin)</h2>
          <div className="header-actions">
            <div className="search-box">
              <i className='bx bx-search'></i>
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>
        </header>

        {/* Área de Contenido */}
        <div className="content-area">
          <div className="welcome-section">
            <h3>Aquí tienes un resumen conciso del estado actual del sistema.</h3>
          </div>

          {/* Tarjetas de Estadísticas (Stats Cards) */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-buildings'></i>
              </div>
              <div className="stat-info">
                <h3>Empresas Activas</h3>
                <div className="stat-value">128</div>
                <div className="stat-change">+5 nuevas este mes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-group'></i>
              </div>
              <div className="stat-info">
                <h3>Usuarios Totales</h3>
                <div className="stat-value">15,721</div>
                <div className="stat-change">+2.1% último mes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-cloud-check'></i>
              </div>
              <div className="stat-info">
                <h3>Estado del Sistema</h3>
                <div className="stat-value" style={{ color: '#10b981' }}>Óptimo</div>
                <div className="stat-change" style={{ color: '#6b7280' }}>Todos los servicios operativos</div>
              </div>
            </div>
          </div>

          {/* Sección de Módulos */}
          <div className="modules-section">
            <h2>Resumen de Módulos</h2>
            <div className="modules-grid">
              
              {/* Módulo 1: Configuración */}
              <div className="module-card">
                <div>
                  <div className="module-icon">
                    <i className='bx bx-cog'></i>
                  </div>
                  <h4>Configuración Global</h4>
                  <p>Ajustes generales de la plataforma y parámetros del sistema.</p>
                </div>
                {/* Nota: Enlace temporal a Dashboard hasta que tengas la pág de config */}
                <Link to="/admin/dashboard" className="module-action" style={{ textDecoration: 'none' }}>
                  <span>Gestionar</span>
                  <i className='bx bx-right-arrow-alt'></i>
                </Link>
              </div>

              {/* Módulo 2: Gestión Multiempresa (Conectado a tu ruta real) */}
              <div className="module-card">
                <div>
                  <div className="module-icon">
                    <i className='bx bx-briefcase'></i>
                  </div>
                  <h4>Gestión Multiempresa</h4>
                  <p>Administra todas las empresas clientes desde un solo lugar.</p>
                </div>
                <Link to="/admin/empresas" className="module-action" style={{ textDecoration: 'none' }}>
                  <span>Ver Empresas</span>
                  <i className='bx bx-right-arrow-alt'></i>
                </Link>
              </div>

              {/* Módulo 3: Control de Acceso */}
              <div className="module-card">
                <div>
                  <div className="module-icon">
                    <i className='bx bx-user-circle'></i>
                  </div>
                  <h4>Control de Acceso</h4>
                  <p>Define roles y permisos para los administradores del sistema.</p>
                </div>
                {/* Nota: Enlace temporal */}
                <Link to="/admin/dashboard" className="module-action" style={{ textDecoration: 'none' }}>
                  <span>Configurar Roles</span>
                  <i className='bx bx-right-arrow-alt'></i>
                </Link>
              </div>

              {/* Módulo 4: Monitor */}
              <div className="module-card">
                <div>
                  <div className="module-icon">
                    <i className='bx bx-bar-chart-alt-2'></i>
                  </div>
                  <h4>Monitor de Sistema</h4>
                  <p>Visualiza el rendimiento, logs y estado de los servicios.</p>
                </div>
                {/* Nota: Enlace temporal */}
                <Link to="/admin/dashboard" className="module-action" style={{ textDecoration: 'none' }}>
                  <span>Ver Estado</span>
                  <i className='bx bx-right-arrow-alt'></i>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InicioSuperAdmin;