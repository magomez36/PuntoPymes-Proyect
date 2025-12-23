import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importamos useNavigate
import Sidebar from '../../components/Sidebar';

const CrearEmpresaSuperAdmin = () => {
  const navigate = useNavigate(); // Hook para redireccionar
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    razonSocial: '',
    nombreEmpresa: '',
    ruc: '',
    paisId: '',      // Guardaremos el ID (ej: 8)
    monedaId: '',    // Guardaremos el ID (ej: 8)
    monedaNombre: '' // Solo para mostrar en el input (readOnly)
  });

  // Mapa de Configuración: "Nombre País" -> { ID País, ID Moneda, Nombre Moneda }
  // Basado en tu JSON anterior: Ec(8), Bo(2), Cl(3), Co(4), Mx(13)
  const configuracionPaises = {
    "Argentina":            { paisId: 1,  monedaId: 1,  monedaNombre: "Peso argentino (ARS)" },
    "Bolivia":              { paisId: 2,  monedaId: 2,  monedaNombre: "Boliviano (BOB)" },
    "Chile":                { paisId: 3,  monedaId: 3,  monedaNombre: "Peso chileno (CLP)" },
    "Colombia":             { paisId: 4,  monedaId: 4,  monedaNombre: "Peso colombiano (COP)" },
    "Costa Rica":           { paisId: 5,  monedaId: 5,  monedaNombre: "Colón costarricense (CRC)" },
    "Cuba":                 { paisId: 6,  monedaId: 6,  monedaNombre: "Peso cubano (CUP)" },
    "República Dominicana": { paisId: 7,  monedaId: 7,  monedaNombre: "Peso dominicano (DOP)" },
    "Ecuador":              { paisId: 8,  monedaId: 8,  monedaNombre: "Dólar estadounidense (USD)" },
    "El Salvador":          { paisId: 9,  monedaId: 9,  monedaNombre: "Dólar estadounidense (USD)" },
    "España":               { paisId: 10, monedaId: 10, monedaNombre: "Euro (EUR)" },
    "Guatemala":            { paisId: 11, monedaId: 11, monedaNombre: "Quetzal (GTQ)" },
    "Honduras":             { paisId: 12, monedaId: 12, monedaNombre: "Lempira (HNL)" },
    "México":               { paisId: 13, monedaId: 13, monedaNombre: "Peso mexicano (MXN)" },
    "Nicaragua":            { paisId: 14, monedaId: 14, monedaNombre: "Córdoba nicaragüense (NIO)" },
    "Panamá":               { paisId: 15, monedaId: 15, monedaNombre: "Balboa (PAB) y Dólar (USD)" },
    "Paraguay":             { paisId: 16, monedaId: 16, monedaNombre: "Guaraní paraguayo (PYG)" },
    "Perú":                 { paisId: 17, monedaId: 17, monedaNombre: "Sol peruano (PEN)" },
    "Uruguay":              { paisId: 18, monedaId: 18, monedaNombre: "Peso uruguayo (UYU)" },
    "Venezuela":            { paisId: 19, monedaId: 19, monedaNombre: "Bolívar venezolano (VES)" }
  };

  // Maneja cambios en inputs de texto (Razón Social, RUC, Nombre)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Maneja cambio de País (Actualiza IDs y Texto de Moneda)
  const handlePaisChange = (e) => {
    const nombrePais = e.target.value;
    const config = configuracionPaises[nombrePais];

    if (config) {
      setFormData({
        ...formData,
        paisId: config.paisId,
        monedaId: config.monedaId,
        monedaNombre: config.monedaNombre
      });
    }
  };

  // ENVÍO AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Preparamos el JSON tal como lo pide tu ejemplo
    const payload = {
      razon_social: formData.razonSocial,
      nombre_comercial: formData.nombreEmpresa,
      ruc_nit: formData.ruc,
      pais: formData.paisId,     // Envía número (ej: 8)
      moneda: formData.monedaId, // Envía número (ej: 8)
      estado: 1                  // Por defecto creamos como Activo (1)
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/crear-empresa/', {
        method: 'POST', // Usamos POST para crear
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Empresa creada exitosamente');
        navigate('/admin/empresas'); // Volver al listado
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert('Error al crear empresa. Revisa la consola.');
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        
        <header className="header">
          <h2 className="header-title">Empresa</h2>
        </header>

        <div className="content-area">
          <nav className="breadcrumb">
            <Link to="/admin/empresas" className="breadcrumb-item">Gestión de Empresas</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Crear Empresa</span>
          </nav>

          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Nueva Empresa</h2>
              <p className="form-description">Complete los datos para registrar la empresa en el sistema.</p>
            </div>

            {/* Agregamos onSubmit al formulario */}
            <form className="company-form" onSubmit={handleSubmit}>
              
              {/* LOGO (Nota: Por ahora no se envía en el JSON, requiere FormData si quieres subir archivos) */}
              <div className="form-section">
                <label className="form-label">Logo de la Empresa</label>
                <div className="upload-area">
                  <i className='bx bx-image-add upload-icon'></i>
                  <div className="upload-text">
                    <span className="upload-link">Subir imagen</span>
                  </div>
                  <input type="file" hidden />
                </div>
              </div>

              {/* RAZÓN SOCIAL y NOMBRE */}
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Razón Social <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <i className='bx bxs-business input-icon-left'></i>
                    <input 
                      type="text" 
                      name="razonSocial"
                      className="form-input-field" 
                      placeholder="Ej. Innovate Corp S.A." 
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Nombre Comercial <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <i className='bx bx-buildings input-icon-left'></i>
                    <input 
                      type="text" 
                      name="nombreEmpresa"
                      className="form-input-field" 
                      placeholder="Ej. Innovate Corp" 
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* RUC y PAÍS */}
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">RUC / Identificación <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <i className='bx bx-id-card input-icon-left'></i>
                    <input 
                      type="text" 
                      name="ruc"
                      className="form-input-field" 
                      placeholder="Ej. 1234567890" 
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">País <span className="required">*</span></label>
                  <select 
                    className="form-select-field" 
                    required 
                    onChange={handlePaisChange}
                    defaultValue=""
                  >
                    <option value="" disabled>Seleccionar País</option>
                    {/* Generamos las opciones desde nuestro objeto de configuración */}
                    {Object.keys(configuracionPaises).map(paisName => (
                      <option key={paisName} value={paisName}>{paisName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MONEDA (Automática) */}
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Moneda Principal</label>
                  <div className="input-with-icon">
                    <i className='bx bx-money input-icon-left'></i>
                    <input 
                      type="text" 
                      className="form-input-field" 
                      placeholder="Seleccione un país primero" 
                      value={formData.monedaNombre} // Muestra el nombre (ej: Dolar)
                      readOnly 
                      style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Link to="/admin/empresas" className="btn-cancel" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Cancelar
                </Link>
                <button type="submit" className="btn-save">
                  <i className='bx bx-save'></i> Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrearEmpresaSuperAdmin;