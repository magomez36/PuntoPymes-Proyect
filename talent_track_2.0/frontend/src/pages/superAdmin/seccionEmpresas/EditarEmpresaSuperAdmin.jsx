import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';

const EditarEmpresaSuperAdmin = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    razonSocial: '',
    nombreEmpresa: '',
    ruc: '',
    paisId: '',       // Guardamos el ID (ej: 8) para el backend
    monedaId: '',     // Guardamos el ID (ej: 8) para el backend
    monedaNombre: '', // Texto para mostrar en el input (readOnly)
    estado: 1         // 1: Activo, 2: Inactivo
  });

  // --- 1. MAPA DE CONFIGURACIÓN COMPLETO (19 Países) ---
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

  // Función auxiliar: Dado un ID numérico, encuentra el Nombre del país
  const getPaisNombreById = (id) => {
    return Object.keys(configuracionPaises).find(
      key => configuracionPaises[key].paisId === id
    ) || "";
  };

  // --- 2. CARGAR DATOS (GET) ---
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/empresas/${id}/`);
        
        if (!response.ok) throw new Error("Error cargando empresa");
        
        const data = await response.json();

        // Rellenamos el formulario
        setFormData({
          razonSocial: data.razon_social,
          nombreEmpresa: data.nombre_comercial,
          ruc: data.ruc_nit,
          paisId: data.pais,     
          monedaId: data.moneda, 
          monedaNombre: data.moneda_nombre, 
          estado: data.estado
        });
        setLoading(false);

      } catch (error) {
        console.error("Error:", error);
        alert("No se pudieron cargar los datos.");
        navigate('/admin/empresas');
      }
    };

    if (id) fetchEmpresa();
  }, [id, navigate]);

  // --- 3. MANEJADORES DE CAMBIOS ---
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Actualiza Moneda e IDs al cambiar País
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

  // --- 4. ENVIAR DATOS (PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      razon_social: formData.razonSocial,
      nombre_comercial: formData.nombreEmpresa,
      ruc_nit: formData.ruc,
      pais: formData.paisId,             // Envía ID numérico (ej: 8)
      moneda: formData.monedaId,         // Envía ID numérico (ej: 8)
      estado: parseInt(formData.estado, 10) 
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/actualizar-empresa/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Empresa actualizada correctamente');
        navigate('/admin/empresas');
      } else {
        const errorData = await response.json();
        console.error("Error backend:", errorData);
        alert('Error al actualizar.');
      }
    } catch (error) {
      console.error("Error red:", error);
      alert('Error de conexión.');
    }
  };

  if (loading) return <div className="layout"><div className="main-content">Cargando...</div></div>;

  // Calculamos el nombre del país actual para seleccionarlo en el <select>
  const paisNombreActual = getPaisNombreById(formData.paisId);

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
            <span className="breadcrumb-item active">Editar Empresa</span>
          </nav>

          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Editar Empresa</h2>
              <p className="form-description">Modifique los datos necesarios.</p>
            </div>

            <form className="company-form" onSubmit={handleSubmit}>
              
              {/* LOGO (Visual por ahora) */}
              <div className="form-section">
                <label className="form-label">Logo Actual</label>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                   <div style={{width:'50px', height:'50px', background:'#f0f0f0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <i className='bx bx-image' style={{fontSize:'24px', color:'#999'}}></i>
                   </div>
                   <span className="upload-link" style={{fontSize:'14px'}}>Cambiar imagen (Próximamente)</span>
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
                      value={formData.razonSocial}
                      onChange={handleChange}
                      required
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
                      value={formData.nombreEmpresa}
                      onChange={handleChange}
                      required
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
                      value={formData.ruc}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">País <span className="required">*</span></label>
                  <select 
                    className="form-select-field" 
                    required 
                    onChange={handlePaisChange}
                    value={paisNombreActual} 
                  >
                    <option value="" disabled>Seleccionar País</option>
                    {/* Generación dinámica de opciones ordenadas por ID o alfabéticamente */}
                    {Object.keys(configuracionPaises).map(paisName => (
                      <option key={paisName} value={paisName}>{paisName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MONEDA y ESTADO */}
              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Moneda Principal</label>
                  <div className="input-with-icon">
                    <i className='bx bx-money input-icon-left'></i>
                    <input 
                      type="text" 
                      className="form-input-field" 
                      value={formData.monedaNombre}
                      readOnly 
                      style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">Estado</label>
                  <select 
                    name="estado" 
                    className="form-select-field"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="1">Activo</option>
                    <option value="2">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <Link to="/admin/empresas" className="btn-cancel" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Cancelar
                </Link>
                <button type="submit" className="btn-save">
                  <i className='bx bx-save'></i> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditarEmpresaSuperAdmin;