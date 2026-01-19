import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarRRHH from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";

import "../../../assets/css/admin-empresas.css"; 

const TIPOS = [
  { id: 1, label: "Sede" },
  { id: 2, label: "Área" },
  { id: 3, label: "Departamento" },
];

export default function CrearUnidadOrg() {
  const navigate = useNavigate();

  // Estados
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // 1. NUEVO ESTADO PARA EL MODAL
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    unidad_padre_id: "",
    nombre: "",
    tipo: 1, // Por defecto Sede
    ubicacion: "",
  });

  // Cargar unidades existentes
  const loadUnidades = async () => {
    const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadUnidades();
      } catch (e) {
        setErr(e?.message || "Error cargando unidades.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const parentOptions = useMemo(() => {
    return unidades.map((u) => ({ 
        id: u.id, 
        label: `${u.nombre || "N/A"} (${u.tipo_label ? u.tipo_label.charAt(0).toUpperCase() + u.tipo_label.slice(1) : ''})` 
    }));
  }, [unidades]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) return setErr("El nombre es obligatorio.");
    if (!form.ubicacion.trim()) return setErr("La ubicación es obligatoria.");

    const payload = {
      nombre: form.nombre.trim(),
      tipo: Number(form.tipo),
      ubicacion: form.ubicacion.trim(),
      unidad_padre_id: form.unidad_padre_id ? Number(form.unidad_padre_id) : null,
    };

    try {
      const res = await apiFetch("/api/rrhh/unidades-organizacionales/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data));
      }

      // 2. MOSTRAMOS EL MODAL EN LUGAR DE REDIRIGIR
      setShowSuccessModal(true);

    } catch (e2) {
      setErr(e2?.message || "Error al crear la unidad.");
    }
  };

  // Función para cerrar modal y redirigir
  const handleCloseModal = () => {
      setShowSuccessModal(false);
      navigate("/rrhh/unidades-organizacionales");
  };

  // --- ESTILOS INLINE AUXILIARES ---
  const inputGroupStyle = { position: 'relative', display: 'flex', alignItems: 'center' };
  const iconStyle = { position: 'absolute', left: '12px', color: '#9ca3af', fontSize: '1.2rem', pointerEvents: 'none' };
  const inputPaddingStyle = { paddingLeft: '40px' };

  return (
    <div className="layout-wrapper">
      <SidebarRRHH />
      
      <main className="page-content-wrapper">
        
        {/* HEADER ALINEADO A LA IZQUIERDA */}
        <div style={{ marginBottom: '30px' }}>
            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/rrhh/unidades-organizacionales" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                    Unidades Org.
                </Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem' }}></i>
                <span style={{ color: '#d51e37', fontWeight: '600', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px' }}>
                    Crear Nueva
                </span>
            </div>

            <h1 className="page-header-title" style={{ fontWeight: '800', color: '#111827' }}>
                Nueva Unidad Organizacional
            </h1>
            <p className="page-header-desc">Define la estructura jerárquica (departamentos, áreas) de la empresa.</p>
        </div>


        {/* CONTENIDO CENTRADO */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            
            {loading && <div className="loading-box">Preparando formulario...</div>}
            
            {err && (
                <div className="error-box">
                    <i className='bx bx-error-circle'></i> {err}
                </div>
            )}

            {!loading && (
              <div className="main-grid-layout">
                  
                  {/* IZQUIERDA: FORMULARIO */}
                  <div className="form-card-container">
                      <form onSubmit={onSubmit}>
                        
                        <span className="form-section-label">Datos Básicos</span>
                        
                        {/* Input Nombre */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.875rem', color:'#374151'}}>
                            Nombre de Unidad <span style={{color:'#ef4444'}}>*</span>
                          </label>
                          <div style={inputGroupStyle}>
                              <i className='bx bx-building' style={iconStyle}></i>
                              <input 
                                className="form-control-input"
                                style={inputPaddingStyle}
                                name="nombre" 
                                value={form.nombre} 
                                onChange={onChange} 
                                placeholder="Ej. Recursos Humanos"
                                autoFocus
                              />
                          </div>
                        </div>

                        <span className="form-section-label" style={{ marginTop: '30px' }}>Jerarquía y Ubicación</span>

                        <div className="form-row-grid">
                            {/* Select Padre */}
                            <div>
                              <label style={{display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.875rem', color:'#374151'}}>
                                Unidad Padre (Opcional)
                              </label>
                              <div style={inputGroupStyle}>
                                  <i className='bx bx-sitemap' style={iconStyle}></i>
                                  <select 
                                    className="form-control-input"
                                    style={inputPaddingStyle}
                                    name="unidad_padre_id" 
                                    value={form.unidad_padre_id} 
                                    onChange={onChange}
                                  >
                                    <option value="">Ninguna (Nivel Raíz)</option>
                                    {parentOptions.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.label}
                                      </option>
                                    ))}
                                  </select>
                              </div>
                            </div>

                            {/* Select Tipo */}
                            <div>
                              <label style={{display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.875rem', color:'#374151'}}>
                                Tipo de Unidad <span style={{color:'#ef4444'}}>*</span>
                              </label>
                              <div style={inputGroupStyle}>
                                  <i className='bx bx-purchase-tag' style={iconStyle}></i>
                                  <select 
                                    className="form-control-input"
                                    style={inputPaddingStyle}
                                    name="tipo" 
                                    value={form.tipo} 
                                    onChange={onChange}
                                  >
                                    {TIPOS.map((t) => (
                                      <option key={t.id} value={t.id}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                              </div>
                            </div>
                        </div>

                        {/* Input Ubicación */}
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.875rem', color:'#374151'}}>
                            Ubicación Física <span style={{color:'#ef4444'}}>*</span>
                          </label>
                          <div style={inputGroupStyle}>
                              <i className='bx bx-map' style={iconStyle}></i>
                              <input 
                                className="form-control-input"
                                style={inputPaddingStyle}
                                name="ubicacion" 
                                value={form.ubicacion} 
                                onChange={onChange} 
                                placeholder="Ej. Edificio A, Piso 2, Oficina 204"
                              />
                          </div>
                        </div>

                        <div className="form-buttons-footer">
                          <Link to="/rrhh/unidades-organizacionales" className="btn-secondary-cancel">
                            Cancelar
                          </Link>
                          <button type="submit" className="btn-primary-save">
                            <i className='bx bx-save'></i> Guardar Unidad
                          </button>
                        </div>

                      </form>
                  </div>

                  {/* DERECHA: AYUDA */}
                  <div className="side-info-card">
                      <div className="side-header">
                          <div className="icon-box-blue">
                              <i className='bx bx-bulb'></i>
                          </div>
                          <h3 className="side-title">Ayuda Rápida</h3>
                      </div>
                      
                      <div className="side-content">
                          <h5>Estructura Jerárquica</h5>
                          <p>
                              Al seleccionar una <strong>Unidad Padre</strong>, creas una sub-unidad.
                              Ej: "RRHH" (Hijo) dentro de "Gerencia" (Padre).
                          </p>

                          <h5>Tipos de Unidad</h5>
                          <p>
                              Define el nivel en el organigrama:<br/>
                              • <strong>Sede:</strong> Edificio o campus completo.<br/>
                              • <strong>Área:</strong> División grande (Gerencia).<br/>
                              • <strong>Departamento:</strong> Equipo operativo.
                          </p>
                      </div>
                      
                      <div className="info-note-blue">
                          <i className='bx bx-info-circle'></i>
                          <span>Los campos marcados con (*) son obligatorios para el registro.</span>
                      </div>
                  </div>

              </div>
            )}
        </div>

        {/* 3. MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>¡Unidad Creada!</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                        La unidad organizacional se ha registrado correctamente.
                    </p>
                    <button onClick={handleCloseModal} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#d51e37', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        Aceptar
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}