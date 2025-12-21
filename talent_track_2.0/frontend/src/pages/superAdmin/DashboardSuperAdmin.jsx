import React from 'react';
import Sidebar from '../../components/Sidebar';
import 'boxicons/css/boxicons.min.css';

const DashboardSuperAdmin = () => {
  return (
    <div className="layout">
      {/* 1. Sidebar Fijo */}
      <Sidebar />

      {/* 2. Contenido Principal */}
      <main className="main-content">
        
        {/* Header Común */}
        <header className="header">
          <h2 className="header-title">Dashboard General</h2>
          <div className="header-actions">
            <div className="search-box">
              <i className='bx bx-search'></i>
              <input type="text" placeholder="Buscar..." />
            </div>
            {/* Avatar o Notificaciones podrían ir aquí */}
          </div>
        </header>

        <div className="content-area">
          {/* Tarjetas de Resumen (Stats) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            {/* Card 1: Empresas */}
            <div className="form-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '28px' }}>
                <i className='bx bx-buildings'></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>12</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Empresas Activas</p>
              </div>
            </div>

            {/* Card 2: Usuarios */}
            <div className="form-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '28px' }}>
                <i className='bx bx-user-voice'></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>1,240</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Usuarios Totales</p>
              </div>
            </div>

            {/* Card 3: Ingresos (Ejemplo) */}
            <div className="form-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', fontSize: '28px' }}>
                <i className='bx bx-dollar-circle'></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>$45k</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Ingresos Mensuales</p>
              </div>
            </div>

            {/* Card 4: Alertas */}
            <div className="form-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: '28px' }}>
                <i className='bx bx-error-circle'></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>3</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Alertas Críticas</p>
              </div>
            </div>

          </div>

          {/* Gráfico o Tabla Reciente (Placeholder) */}
          <div className="form-card">
            <h3 className="form-title">Actividad Reciente</h3>
            <p className="form-description">Últimos movimientos registrados en la plataforma.</p>
            
            <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
              <i className='bx bx-bar-chart-alt-2' style={{ fontSize: '40px', marginBottom: '10px' }}></i>
              <p>Aquí podrías colocar gráficas de rendimiento o tablas de auditoría.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardSuperAdmin;