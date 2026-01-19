import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Mantenemos tu import
import { apiFetch } from "../../../services/api";

// Importamos los estilos globales
import "../../../assets/css/admin-empresas.css";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

const TIPOS = [
  { id: 1, label: "Sede" },
  { id: 2, label: "Área" },
  { id: 3, label: "Departamento" },
];

const ESTADOS = [
  { id: 1, label: "Activa" },
  { id: 2, label: "Inactiva" },
];

export default function EditarUnidadOrg() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Estado para el Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    unidad_padre_id: "",
    nombre: "",
    tipo: 1,
    ubicacion: "",
    estado: 1,
  });

  // 1. Cargar lista de todas las unidades
  const loadUnidades = async () => {
    const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  // 2. Cargar los datos de la unidad a editar
  const loadDetalle = async () => {
    const res = await apiFetch(`/api/rrhh/unidades-organizacionales/${id}/`);
    const data = await res.json();

    setForm({
      unidad_padre_id: data.unidad_padre_id ? String(data.unidad_padre_id) : "",
      nombre: data.nombre || "",
      tipo: Number(data.tipo || 1),
      ubicacion: data.ubicacion || "",
      estado: Number(data.estado || 1),
    });
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadUnidades();
        await loadDetalle();
      } catch (e) {
        setErr(e?.message || "Error cargando datos.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const parentOptions = useMemo(() => {
    const myId = Number(id);
    return unidades
      .filter((u) => u.id !== myId)
      .map((u) => ({ 
        id: u.id, 
        label: `${u.nombre || "N/A"} (${u.tipo_label ? u.tipo_label.charAt(0).toUpperCase() + u.tipo_label.slice(1) : ''})` 
      }));
  }, [unidades, id]);

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
      estado: Number(form.estado),
      unidad_padre_id: form.unidad_padre_id ? Number(form.unidad_padre_id) : null,
    };

    try {
      const res = await apiFetch(`/api/rrhh/unidades-organizacionales/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data));
      }

      // Éxito: Mostrar Modal
      setShowSuccessModal(true);

    } catch (e2) {
      setErr(e2?.message || "Error al actualizar la unidad.");
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/rrhh/unidades-organizacionales");
  };

  // --- ESTILOS INLINE AUXILIARES ---
  const inputGroupStyle = { position: 'relative', display: 'flex', alignItems: 'center' };
  const iconStyle = { position: 'absolute', left: '12px', color: '#9ca3af', fontSize: '1.2rem', pointerEvents: 'none' };
  const inputPaddingStyle = { paddingLeft: '40px' };

// --- ESTILO MARCA DE AGUA (Estilo Login) ---
  const watermarkStyle = {
    position: 'fixed',
    bottom: '-80px',      // Lo bajamos para que se corte un poco
    right: '-80px',       // Lo movemos a la derecha para que se corte
    width: '550px',       // Tamaño grande (como en el login)
    height: 'auto',
    opacity: '0.04',      // Muy sutil (casi transparente para que no moleste al leer)
    zIndex: 0,            // Al fondo, para no tapar clicks ni textos
    pointerEvents: 'none' // Asegura que los clicks pasen a través de la imagen
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      {/* 1. LAYOUT WRAPPER: Aplica el margen izquierdo correcto */}
      <main className="page-content-wrapper">
        
        {/* === HEADER (Alineado a la Izquierda) === */}
        <div style={{ marginBottom: '30px' }}>
            
            {/* Breadcrumb */}
            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/rrhh/unidades-organizacionales" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                    Unidades Org.
                </Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem' }}></i>
                <span style={{ color: '#d51e37', fontWeight: '600', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px' }}>
                    Editar Unidad
                </span>
            </div>

            <h1 className="page-header-title" style={{ fontWeight: '800', color: '#111827' }}>
                Editar Unidad
            </h1>
            <p className="page-header-desc">Modifica la información y estructura de la unidad seleccionada.</p>
        </div>

        {/* === CONTENIDO PRINCIPAL (Centrado) === */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            
            {loading && <div className="loading-box">Cargando datos...</div>}
            
            {err && (
                <div className="error-box">
                    <i className='bx bx-error-circle'></i> {err}
                </div>
            )}

            {!loading && (
              // Usamos .main-grid-layout para la estructura de 2 columnas
              <div className="main-grid-layout">
                  
                  {/* IZQUIERDA: FORMULARIO */}
                  <div className="form-card-container">
                      <form onSubmit={onSubmit}>
                        
                        <span className="form-section-label">Información General</span>
                        
                        {/* Nombre */}
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
                              />
                          </div>
                        </div>

                        {/* Grid: Estado y Ubicación */}
                        <div className="form-row-grid">
                            {/* Estado */}
                            <div>
                                <label style={{display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'0.875rem', color:'#374151'}}>
                                    Estado Actual <span style={{color:'#ef4444'}}>*</span>
                                </label>
                                <div style={inputGroupStyle}>
                                    <i className='bx bx-toggle-left' style={iconStyle}></i>
                                    <select 
                                        className="form-control-input"
                                        style={inputPaddingStyle}
                                        name="estado" 
                                        value={form.estado} 
                                        onChange={onChange}
                                    >
                                        {ESTADOS.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.label}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Ubicación */}
                            <div>
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
                                        placeholder="Ej. Piso 2, Oficina 204"
                                    />
                                </div>
                            </div>
                        </div>

                        <span className="form-section-label" style={{ marginTop: '30px' }}>Estructura Jerárquica</span>

                        {/* Grid: Padre y Tipo */}
                        <div className="form-row-grid">
                            {/* Padre */}
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

                            {/* Tipo */}
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

                        {/* Botones */}
                        <div className="form-buttons-footer">
                          <Link to="/rrhh/unidades-organizacionales" className="btn-secondary-cancel">
                            Cancelar
                          </Link>
                          <button type="submit" className="btn-primary-save">
                            <i className='bx bx-save'></i> Guardar Cambios
                          </button>
                        </div>

                      </form>
                  </div>

                  {/* DERECHA: AYUDA */}
                  <div className="side-info-card">
                      <div className="side-header">
                          <div className="icon-box-blue">
                              <i className='bx bx-edit-alt'></i>
                          </div>
                          <h3 className="side-title">Modo Edición</h3>
                      </div>
                      
                      <div className="side-content">
                          <h5>Cambiar Jerarquía</h5>
                          <p>
                              Puedes mover esta unidad a otra dependencia seleccionando un nuevo <strong>Padre</strong>.
                              Ten cuidado: esto moverá también a todas las sub-unidades que dependan de esta.
                          </p>

                          <h5>Estado Inactivo</h5>
                          <p>
                              Si marcas la unidad como <strong>Inactiva</strong>, no podrá ser seleccionada en nuevos contratos ni asignaciones.
                          </p>
                      </div>

                      <div className="info-note-blue">
                          <i className='bx bx-info-circle'></i>
                          <span>Los cambios se aplicarán inmediatamente tras guardar.</span>
                      </div>
                  </div>

              </div>
            )}
        </div>

        {/* --- MODAL DE ÉXITO --- */}
        {showSuccessModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>¡Edición Exitosa!</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                        La unidad organizacional se ha actualizado correctamente.
                    </p>
                    <button onClick={handleCloseModal} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#d51e37', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        Aceptar
                    </button>
                </div>
            </div>
        )}

      </main>

      {/* --- LOGO MARCA DE AGUA --- */}
      <img 
        src={logoWatermark}
        alt="Logo Empresa" 
        style={watermarkStyle} 
      />

    </div>
  );
}