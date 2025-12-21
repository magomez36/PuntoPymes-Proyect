import React from 'react';
import Sidebar from '../../components/Sidebar'; // <--- IMPORTANTE: Importamos el Sidebar

const DashboardSuperAdmin = () => {
  return (
    <div className="dashboard-content">
      {/* Métricas Principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon users">
            <i className='bx bx-group'></i>
          </div>
          <div className="metric-info">
            <h3>Usuarios Totales</h3>
            <div className="metric-value">15,721</div>
            <div className="metric-change positive">
              <i className='bx bx-up-arrow-alt'></i>
              +2.1% este mes
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon companies">
            <i className='bx bx-buildings'></i>
          </div>
          <div className="metric-info">
            <h3>Empresas Activas</h3>
            <div className="metric-value">128</div>
            <div className="metric-change positive">
              <i className='bx bx-up-arrow-alt'></i>
              +5% este mes
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon health">
            <i className='bx bx-bar-chart-alt'></i>
          </div>
          <div className="metric-info">
            <h3>Salud del Sistema</h3>
            <div className="metric-value">99.9%</div>
            <div className="metric-status">
              <i className='bx bx-check-circle'></i>
              Estable
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon registrations">
            <i className='bx bx-trending-up'></i>
          </div>
          <div className="metric-info">
            <h3>Nuevos Registros (Hoy)</h3>
            <div className="metric-value">48</div>
            <div className="metric-change negative">
              <i className='bx bx-down-arrow-alt'></i>
              -10% vs ayer
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Resumen de Asistencia Diario */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className='bx bx-calendar-check'></i>
              Resumen de Asistencia Diario
            </h3>
            <div className="card-date">
              <span>24 Oct, 2023</span>
              <i className='bx bx-refresh'></i>
            </div>
          </div>

          <div className="attendance-stats">
            <div className="attendance-stat-item">
              <div className="stat-label">
                <i className='bx bx-group'></i>
                Total Empleados
              </div>
              <div className="stat-number">854</div>
            </div>

            <div className="attendance-stat-item">
              <div className="stat-label">
                <i className='bx bx-time'></i>
                Llegadas Tarde
              </div>
              <div className="stat-number orange">24</div>
            </div>

            <div className="attendance-stat-item">
              <div className="stat-label">
                <i className='bx bx-time-five'></i>
                Horas Extra
              </div>
              <div className="stat-number blue">42.5h</div>
            </div>

            <div className="attendance-stat-item highlight-green">
              <div className="stat-label">
                <i className='bx bx-user-check'></i>
                Presentes
              </div>
              <div className="stat-number-large">94%</div>
              <div className="stat-detail">802/854</div>
              {/* SVG corregido para JSX (camelCase) */}
              <svg className="progress-ring" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#d1fae5" strokeWidth="8"/>
                <circle 
                  cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="8" 
                  strokeDasharray="314" strokeDashoffset="19" 
                  transform="rotate(-90 60 60)" strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Calendario de Ausencias */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">
              <i className='bx bx-calendar-x'></i>
              Calendario de Ausencias
            </h3>
            <select className="week-selector">
              <option>Esta Semana</option>
              <option>Próxima Semana</option>
              <option>Este Mes</option>
            </select>
          </div>

          <div className="absence-list">
            <div className="absence-item">
              <div className="absence-avatar-placeholder">RG</div>
              <div className="absence-info">
                <div className="absence-name">Roberto Gómez</div>
                <span className="absence-type vacation">Vacaciones</span>
              </div>
              <div className="absence-dates">
                <div className="absence-date">23 - 27 Oct</div>
                <div className="absence-status approved">
                  <i className='bx bx-check-circle'></i>
                  Aprobado
                </div>
              </div>
            </div>

            <div className="absence-item">
              <div className="absence-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>MR</div>
              <div className="absence-info">
                <div className="absence-name">María Rodríguez</div>
                <span className="absence-type sick">Enfermedad</span>
              </div>
              <div className="absence-dates">
                <div className="absence-date">24 Oct</div>
                <div className="absence-status pending">
                  <i className='bx bx-time-five'></i>
                  Pendiente
                </div>
              </div>
            </div>

            <div className="absence-item">
              <div className="absence-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>JD</div>
              <div className="absence-info">
                <div className="absence-name">Juan Díaz</div>
                <span className="absence-type personal">Permiso Personal</span>
              </div>
              <div className="absence-dates">
                <div className="absence-date">25 Oct (PM)</div>
                <div className="absence-status approved">
                  <i className='bx bx-check-circle'></i>
                  Aprobado
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico KPI (Empleado) */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className='bx bx-line-chart'></i>
            Histórico KPI (Empleado)
          </h3>
          <div className="card-actions">
            <select className="department-selector">
              <option>Todos los Departamentos</option>
              <option>Ventas</option>
              <option>Marketing</option>
              <option>Soporte Técnico</option>
              <option>Desarrollo</option>
            </select>
            <a href="#" className="view-full-report">Ver reporte completo</a>
          </div>
        </div>

        <div className="kpi-table-container">
          <table className="kpi-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Empleado</th>
                <th>KPI</th>
                <th>Valor Actual</th>
                <th>Meta</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Oct 2023</td>
                <td>
                  <div className="employee-cell">
                    <div className="employee-avatar-letter">AL</div>
                    <div>
                      <div className="employee-name">Ana Lopez</div>
                      <div className="employee-role">Ventas Senior</div>
                    </div>
                  </div>
                </td>
                <td>Ventas Mensuales</td>
                <td className="value-cell">$45,200</td>
                <td className="meta-cell">$40,000</td>
                <td>
                  <span className="status-chip success">Completo</span>
                </td>
                <td>
                  <button className="action-btn">
                    <i className='bx bx-dots-vertical-rounded'></i>
                  </button>
                </td>
              </tr>
              {/* ... Puedes agregar más filas aquí ... */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardSuperAdmin;