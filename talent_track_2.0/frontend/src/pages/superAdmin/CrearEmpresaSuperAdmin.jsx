import React from 'react';
import { Link } from 'react-router-dom';

const CrearEmpresaSuperAdmin = () => {
  return (
    <div className="content-area">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/admin/companies" className="breadcrumb-item">Gestión de Empresas</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">Crear Empresa</span>
      </nav>

      {/* Form Card */}
      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">Información General</h2>
          <p className="form-description">Complete los detalles para registrar una nueva organización en el sistema.</p>
        </div>

        <form className="company-form" id="createCompanyForm">
          {/* Logo Upload */}
          <div className="form-section">
            <label className="form-label">Logo/Icono de la Empresa</label>
            <div className="upload-area" id="uploadArea">
              <i className='bx bx-image-add upload-icon'></i>
              <div className="upload-text">
                <span className="upload-link">Subir un archivo</span>
                <span> o arrastrar y soltar</span>
              </div>
              <p className="upload-hint">PNG, JPG, GIF hasta 5MB</p>
              <input type="file" id="logoInput" accept="image/png,image/jpeg,image/gif" hidden />
            </div>
          </div>

          {/* Nombre de la Empresa */}
          <div className="form-section">
            <label className="form-label" htmlFor="companyName">
              Nombre de la Empresa <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <i className='bx bx-buildings input-icon-left'></i>
              <input 
                type="text" 
                id="companyName" 
                className="form-input-field" 
                placeholder="Ej. Tech Solutions S.L."
                required
              />
            </div>
          </div>

          {/* CIF / NIF y Tipo de Plan */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="cif">
                CIF / NIF <span className="required">*</span>
              </label>
              <input 
                type="text" 
                id="cif" 
                className="form-input-field" 
                placeholder="B-12345678"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="plan">
                Tipo de Plan <span className="required">*</span>
              </label>
              <select id="plan" className="form-select-field" required>
                <option value="">Seleccionar plan</option>
                <option value="standard">Standard</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Contacto Principal y Número de Sucursales */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="contact">Contacto Principal</label>
              <div className="input-with-icon">
                <i className='bx bx-user input-icon-left'></i>
                <input 
                  type="text" 
                  id="contact" 
                  className="form-input-field" 
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="branches">Número de Sucursales</label>
              <div className="input-with-icon">
                <i className='bx bx-store input-icon-left'></i>
                <input 
                  type="number" 
                  id="branches" 
                  className="form-input-field" 
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Fecha de Registro y Estado de Licencia */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label" htmlFor="registrationDate">Fecha de Registro</label>
              <input 
                type="date" 
                id="registrationDate" 
                className="form-input-field"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Estado de Licencia</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input type="radio" name="licenseStatus" value="active" defaultChecked />
                  <span className="radio-label">Activa</span>
                </label>
                <label className="radio-option">
                  <input type="radio" name="licenseStatus" value="inactive" />
                  <span className="radio-label">Inactiva</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to="/admin/companies" className="btn-cancel" style={{textDecoration:'none', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center'}}>
              Cancelar
            </Link>
            <button type="submit" className="btn-save">
              <i className='bx bx-save'></i>
              Guardar Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEmpresaSuperAdmin;