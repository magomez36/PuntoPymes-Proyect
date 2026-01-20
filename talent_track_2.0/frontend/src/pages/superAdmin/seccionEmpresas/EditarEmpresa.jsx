import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
// Importamos el CSS donde definiste .layout-watermark
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css";

// SOLUCIÓN: Movemos el objeto fuera del componente porque es estático
const configuracionPaises = {
  Argentina: { paisId: 1, monedaId: 1, monedaNombre: "Peso argentino (ARS)" },
  Bolivia: { paisId: 2, monedaId: 2, monedaNombre: "Boliviano (BOB)" },
  Chile: { paisId: 3, monedaId: 3, monedaNombre: "Peso chileno (CLP)" },
  Colombia: { paisId: 4, monedaId: 4, monedaNombre: "Peso colombiano (COP)" },
  "Costa Rica": { paisId: 5, monedaId: 5, monedaNombre: "Colón costarricense (CRC)" },
  Cuba: { paisId: 6, monedaId: 6, monedaNombre: "Peso cubano (CUP)" },
  "República Dominicana": { paisId: 7, monedaId: 7, monedaNombre: "Peso dominicano (DOP)" },
  Ecuador: { paisId: 8, monedaId: 8, monedaNombre: "Dólar estadounidense (USD)" },
  "El Salvador": { paisId: 9, monedaId: 9, monedaNombre: "Dólar estadounidense (USD)" },
  España: { paisId: 10, monedaId: 10, monedaNombre: "Euro (EUR)" },
  Guatemala: { paisId: 11, monedaId: 11, monedaNombre: "Quetzal (GTQ)" },
  Honduras: { paisId: 12, monedaId: 12, monedaNombre: "Lempira (HNL)" },
  México: { paisId: 13, monedaId: 13, monedaNombre: "Peso mexicano (MXN)" },
  Nicaragua: { paisId: 14, monedaId: 14, monedaNombre: "Córdoba nicaragüense (NIO)" },
  Panamá: { paisId: 15, monedaId: 15, monedaNombre: "Balboa (PAB) y Dólar (USD)" },
  Paraguay: { paisId: 16, monedaId: 16, monedaNombre: "Guaraní paraguayo (PYG)" },
  Perú: { paisId: 17, monedaId: 17, monedaNombre: "Sol peruano (PEN)" },
  Uruguay: { paisId: 18, monedaId: 18, monedaNombre: "Peso uruguayo (UYU)" },
  Venezuela: { paisId: 19, monedaId: 19, monedaNombre: "Bolívar venezolano (VES)" },
};

const EditarEmpresa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    razonSocial: "",
    nombreEmpresa: "",
    ruc: "",
    paisId: "",
    monedaId: "",
    monedaNombre: "",
    estado: 1, 
    logo: null 
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const token = getAccessToken();
        if (!token) { navigate("/login"); return; }

        const response = await fetch(`http://127.0.0.1:8000/api/empresas/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error cargando empresa");

        const data = await response.json();
        const paisEncontrado = Object.keys(configuracionPaises).find(key => configuracionPaises[key].paisId === data.pais);
        const monedaInfo = paisEncontrado ? configuracionPaises[paisEncontrado].monedaNombre : "";

        setFormData({
          razonSocial: data.razon_social ?? "",
          nombreEmpresa: data.nombre_comercial ?? "",
          ruc: data.ruc_nit ?? "",
          paisId: data.pais ?? "",
          monedaId: data.moneda ?? "",
          monedaNombre: monedaInfo,
          estado: data.estado ?? 1,
          logo: null 
        });

        if (data.logo) setLogoPreview(data.logo);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        alert("No se pudieron cargar los datos.");
        navigate("/admin/empresas");
      }
    };
    if (id) fetchEmpresa();
  }, [id, navigate]); 

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePaisChange = (e) => {
    const config = configuracionPaises[e.target.value];
    if (config) {
      setFormData((p) => ({
        ...p,
        paisId: config.paisId,
        monedaId: config.monedaId,
        monedaNombre: config.monedaNombre,
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file)); 
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/admin/empresas");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      razon_social: formData.razonSocial,
      nombre_comercial: formData.nombreEmpresa,
      ruc_nit: formData.ruc,
      pais: Number(formData.paisId),
      moneda: Number(formData.monedaId),
      estado: formData.estado, 
    };

    try {
      const token = getAccessToken();
      const response = await fetch(`http://127.0.0.1:8000/api/actualizar-empresa/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.detail || "Error al actualizar.");
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  if (loading) return (
    // Agregamos la clase aquí también por si acaso tarda en cargar
    <div className="layout layout-watermark" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc', minHeight: '100vh', display: 'flex'}}>
      <Sidebar />
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Cargando datos...</div>
    </div>
  );

  return (
    // CLASE AGREGADA: layout-watermark
    <div className="layout layout-watermark" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/empresas" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Empresas</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Empresa</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Empresa</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Modifica los datos de la organización existente.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* FORMULARIO */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Datos Generales</h4>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                             <div style={{ flexShrink: 0 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Logo</label>
                                <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', cursor: 'pointer', overflow: 'hidden', position: 'relative' }} onClick={() => document.getElementById('logo-upload').click()}>
                                    {logoPreview ? <img src={logoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className='bx bx-image' style={{ fontSize: '32px', color: '#94a3b8' }}></i>}
                                </div>
                                <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                <p style={{fontSize:'0.75rem', color: '#64748b', textAlign:'center', marginTop:'5px'}}>Click para cambiar</p>
                             </div>
                             <div style={{ flex: 1, display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre Comercial <span style={{color:'#ef4444'}}>*</span></label>
                                    <div style={{ position: 'relative' }}><i className='bx bx-store' style={iconStyle}></i><input type="text" name="nombreEmpresa" required placeholder="Ej. Innovate Corp" value={formData.nombreEmpresa} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Razón Social <span style={{color:'#ef4444'}}>*</span></label>
                                        <div style={{ position: 'relative' }}><i className='bx bxs-business' style={iconStyle}></i><input type="text" name="razonSocial" required placeholder="Ej. Innovate S.A." value={formData.razonSocial} onChange={handleChange} style={inputStyle} /></div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>RUC / NIT <span style={{color:'#ef4444'}}>*</span></label>
                                        <div style={{ position: 'relative' }}><i className='bx bx-id-card' style={iconStyle}></i><input type="text" name="ruc" required placeholder="Ej. 1790012345" value={formData.ruc} onChange={handleChange} style={inputStyle} /></div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Configuración</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>País <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}><i className='bx bx-world' style={iconStyle}></i><select required onChange={handlePaisChange} value={Object.keys(configuracionPaises).find((k) => configuracionPaises[k].paisId === Number(formData.paisId)) || ""} style={{ ...inputStyle, appearance: 'none', backgroundColor: 'white' }}><option value="" disabled>Seleccionar...</option>{Object.keys(configuracionPaises).map(p => <option key={p} value={p}>{p}</option>)}</select><i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i></div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Moneda Principal</label>
                                <div style={{ position: 'relative' }}><i className='bx bx-money' style={iconStyle}></i><input type="text" readOnly value={formData.monedaNombre} placeholder="Automático" style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#64748b' }} /></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/empresas" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Cancelar</Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><i className='bx bx-save'></i> Guardar Cambios</button>
                        </div>
                    </form>
                </div>
                {/* PANEL DERECHO */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-edit' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Modo Edición</h3>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>Los cambios realizados en la información legal se reflejarán inmediatamente en facturas y reportes nuevos.</p>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Gestión de Estado</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>Para <strong>activar o desactivar</strong> esta empresa, utilice el botón de estado en la tabla principal del listado.</p>
                    </div>
                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '16px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <i className='bx bx-info-circle' style={{ color: '#0284c7', fontSize: '1.1rem', marginTop: '1px' }}></i>
                            <span>Si cambias el país, la moneda se actualizará automáticamente.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* MODAL */}
        {showSuccessModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <i className='bx bx-check' style={{ fontSize: '48px' }}></i>
               </div>
               <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Actualización Exitosa!</h3>
               <p style={{ color: '#6b7280', marginBottom: '24px' }}>La información de la empresa ha sido guardada correctamente.</p>
               <button onClick={handleCloseSuccessModal} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditarEmpresa;