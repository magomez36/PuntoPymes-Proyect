import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

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
    estado: 1         // 1: Activo, 2: Inactivo (según tu lógica)
  });

  // --- 1. MAPA DE CONFIGURACIÓN (Vital para traducir IDs <-> Nombres) ---
  const configuracionPaises = {
    "Ecuador":        { paisId: 8,  monedaId: 8,  monedaNombre: "Dólar estadounidense (USD)" },
    "Bolivia":        { paisId: 2,  monedaId: 2,  monedaNombre: "Boliviano (BOB)" },
    "Chile":          { paisId: 3,  monedaId: 3,  monedaNombre: "Peso chileno (CLP)" },
    "Colombia":       { paisId: 4,  monedaId: 4,  monedaNombre: "Peso colombiano (COP)" },
    "Mexico":         { paisId: 13, monedaId: 13, monedaNombre: "Peso mexicano (MXN)" },
    "Estados Unidos": { paisId: 1,  monedaId: 1,  monedaNombre: "Dólar (USD)" },
    "Peru":           { paisId: 5,  monedaId: 5,  monedaNombre: "Sol (PEN)" },
    "España":         { paisId: 6,  monedaId: 6,  monedaNombre: "Euro (EUR)" }
  };

  // Función auxiliar: Dado un ID (ej: 8), encuentra el Nombre ("Ecuador")
  // Sirve para seleccionar la opción correcta en el <select> al cargar los datos
  const getPaisNombreById = (id) => {
    return Object.keys(configuracionPaises).find(
      key => configuracionPaises[key].paisId === id
    ) || "";
  };

  // --- 2. CARGAR DATOS (GET) ---
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        // Ajusta esta URL a tu endpoint de lectura (GET)
        const response = await fetch(`http://127.0.0.1:8000/api/listado-empresas/${id}/`);
        
        if (!response.ok) throw new Error("Error cargando empresa");
        
        const data = await response.json();

        // Rellenamos el formulario con los datos recibidos
        setFormData({
          razonSocial: data.razon_social,
          nombreEmpresa: data.nombre_comercial,
          ruc: data.ruc_nit,
          paisId: data.pais,     // El backend devuelve número (8)
          monedaId: data.moneda, // El backend devuelve número (8)
          monedaNombre: data.moneda_nombre, 
          estado: data.estado    // El backend devuelve número (1)
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
  
  // Para inputs de texto normales
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Para el cambio de País (Actualiza IDs automáticamente)
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

    // CONSTRUCCIÓN DEL JSON EXACTO
    const payload = {
      razon_social: formData.razonSocial,
      nombre_comercial: formData.nombreEmpresa,
      ruc_nit: formData.ruc,
      pais: formData.paisId,                // Envía ID numérico (ej: 8)
      moneda: formData.monedaId,            // Envía ID numérico (ej: 8)
      estado: parseInt(formData.estado, 10) // Asegura que sea número entero (1 o 2)
    };

    try {
      // URL de actualización
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

  // Calculamos el nombre del país actual para el value del select HTML
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
            <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
            <span className="breadcrumb-separator">/</span>
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
                    {/* Asumiendo que 1=Activo, 2=Inactivo en tu DB */}
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