import React from 'react';

const InicioSuperAdmin = () => {
  return (
    <div className="content-area">
      <div className="welcome-section">
        <h3>Aquí tienes un resumen conciso del estado actual del sistema.</h3>
      </div>

      {/* Stats Cards */}
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

      {/* Modules Section */}
      <div className="modules-section">
        <h2>Resumen de Módulos</h2>
        <div className="modules-grid">
          <div className="module-card">
            <div>
              <div className="module-icon">
                <i className='bx bx-cog'></i>
              </div>
              <h4>Configuración Global</h4>
              <p>Ajustes generales de la plataforma y parámetros del sistema.</p>
            </div>
            <div className="module-action">
              <span>Gestionar</span>
              <i className='bx bx-right-arrow-alt'></i>
            </div>
          </div>

          <div className="module-card">
            <div>
              <div className="module-icon">
                <i className='bx bx-briefcase'></i>
              </div>
              <h4>Gestión Multiempresa</h4>
              <p>Administra todas las empresas clientes desde un solo lugar.</p>
            </div>
            <div className="module-action">
              <span>Ver Empresas</span>
              <i className='bx bx-right-arrow-alt'></i>
            </div>
          </div>

          <div className="module-card">
            <div>
              <div className="module-icon">
                <i className='bx bx-user-circle'></i>
              </div>
              <h4>Control de Acceso</h4>
              <p>Define roles y permisos para los administradores del sistema.</p>
            </div>
            <div className="module-action">
              <span>Configurar Roles</span>
              <i className='bx bx-right-arrow-alt'></i>
            </div>
          </div>

          <div className="module-card">
            <div>
              <div className="module-icon">
                <i className='bx bx-bar-chart-alt-2'></i>
              </div>
              <h4>Monitor de Sistema</h4>
              <p>Visualiza el rendimiento, logs y estado de los servicios.</p>
            </div>
            <div className="module-action">
              <span>Ver Estado</span>
              <i className='bx bx-right-arrow-alt'></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioSuperAdmin;