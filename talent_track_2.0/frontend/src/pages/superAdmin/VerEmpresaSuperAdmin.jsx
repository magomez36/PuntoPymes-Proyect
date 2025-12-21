import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const VerEmpresaSuperAdmin = () => {
  const { id } = useParams();
  
  // Estado para los datos (Simulados)
  const [empresa, setEmpresa] = useState({
    razonSocial: '', nombreEmpresa: '', ruc: '', pais: '', moneda: '', estado: ''
  });

  useEffect(() => {
    // Aquí simularíamos la carga de datos desde el backend usando el ID
    if (id) {
      setEmpresa({
        razonSocial: "Innovate Corp S.A.",
        nombreEmpresa: "Innovate Corp",
        ruc: "C12345678",
        pais: "Chile",
        moneda: "Peso Chileno (CLP)",
        estado: "Activo"
      });
    }
  }, [id]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <h2 className="header-title">Empresa</h2>
        </header>

        <div className="content-area">
          <nav className="breadcrumb">
            <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/admin/empresas" className="breadcrumb-item">Gestión de Empresas</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Ver Detalle</span>
          </nav>

          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Detalles de la Empresa</h2>
            </div>

            <form className="company-form">
              {/* Campos de Solo Lectura */}
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Razón Social</label>
                  <input type="text" className="form-input-field" value={empresa.razonSocial} readOnly />
                </div>
                <div className="form-section">
                  <label className="form-label">Nombre Comercial</label>
                  <input type="text" className="form-input-field" value={empresa.nombreEmpresa} readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">RUC</label>
                  <input type="text" className="form-input-field" value={empresa.ruc} readOnly />
                </div>
                <div className="form-section">
                  <label className="form-label">País</label>
                  <input type="text" className="form-input-field" value={empresa.pais} readOnly />
                </div>
              </div>

              <div className="form-section">
                  <label className="form-label">Moneda</label>
                  <input type="text" className="form-input-field" value={empresa.moneda} readOnly />
              </div>

              <div className="form-actions">
                <Link to="/admin/empresas" className="btn-save">
                  <i className='bx bx-arrow-back'></i> Volver
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerEmpresaSuperAdmin;