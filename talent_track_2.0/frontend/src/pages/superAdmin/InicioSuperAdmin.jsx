import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const InicioSuperAdmin = () => {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <header className="header">
          <h2 className="header-title">Bienvenido, Super Admin</h2>
        </header>

        <div className="content-area">
          
          {/* Banner de Bienvenida */}
          <div className="form-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
            <div style={{ padding: '20px' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Hola de nuevo 👋</h1>
              <p style={{ opacity: 0.8, maxWidth: '600px', lineHeight: '1.6' }}>
                Estás en el panel de administración global de <strong>TalentTrack</strong>. 
                Desde aquí puedes gestionar todas las empresas inquilinas, supervisar el uso de la plataforma y configurar los parámetros globales del sistema.
              </p>
              <div style={{ marginTop: '20px' }}>
                 <Link to="/admin/empresas" className="btn-save" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#0f172a', border: 'none' }}>
                    <i className='bx bx-rocket'></i> Ir a Empresas
                 </Link>
              </div>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#333' }}>Accesos Rápidos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            
            <Link to="/admin/crear-empresa" className="form-card" style={{ padding: '20px', textAlign: 'center', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}>
              <i className='bx bx-plus-circle' style={{ fontSize: '40px', color: '#dc3545', marginBottom: '10px' }}></i>
              <h4 style={{ margin: 0 }}>Nueva Empresa</h4>
            </Link>

            <Link to="/admin/usuarios" className="form-card" style={{ padding: '20px', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
              <i className='bx bx-user-plus' style={{ fontSize: '40px', color: '#0d6efd', marginBottom: '10px' }}></i>
              <h4 style={{ margin: 0 }}>Crear Usuario</h4>
            </Link>

            <div className="form-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
              <i className='bx bx-cog' style={{ fontSize: '40px', color: '#6c757d', marginBottom: '10px' }}></i>
              <h4 style={{ margin: 0 }}>Configuración</h4>
            </div>

            <div className="form-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
              <i className='bx bx-support' style={{ fontSize: '40px', color: '#198754', marginBottom: '10px' }}></i>
              <h4 style={{ margin: 0 }}>Soporte</h4>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default InicioSuperAdmin;