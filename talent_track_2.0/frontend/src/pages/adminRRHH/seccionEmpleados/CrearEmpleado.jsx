import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Sidebar correcto
import { apiFetch } from "../../../services/api";

// Importamos estilos globales
import "../../../assets/css/admin-empresas.css";

const ESTADOS = [
  { id: 1, label: "Activo" },
  { id: 2, label: "Suspendido" },
  { id: 3, label: "Baja" },
];

export default function CrearEmpleado() {
  const navigate = useNavigate();

  // Estados de datos
  const [unidades, setUnidades] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Estado para Modal Éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    unidad_id: "",
    puesto_id: "",
    manager_id: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    estado: 1, // Por defecto Activo
  });

  // Carga inicial de catálogos
  const loadData = async () => {
    const [uRes, pRes, mRes] = await Promise.all([
      apiFetch("/api/rrhh/unidades-organizacionales/"),
      apiFetch("/api/rrhh/puestos/"),
      apiFetch("/api/rrhh/helpers/empleados-min/"),
    ]);

    const uData = await uRes.json();
    const pData = await pRes.json();
    const mData = await mRes.json();

    setUnidades(Array.isArray(uData) ? uData : []);
    setPuestos(Array.isArray(pData) ? pData : []);
    setManagers(Array.isArray(mData) ? mData : []);
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadData();
      } catch (e) {
        setErr(e?.message || "Error cargando datos del sistema.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Opciones formateadas
  const unidadOptions = useMemo(
    () => unidades.map((u) => ({ 
        id: u.id, 
        label: `${u.nombre || "N/A"} (${u.tipo_label ? u.tipo_label.charAt(0).toUpperCase() + u.tipo_label.slice(1) : 'N/A'})` 
    })),
    [unidades]
  );

  const puestoOptions = useMemo(
    () => puestos.map((p) => ({ 
        id: p.id, 
        label: `${p.nombre} — ${p.unidad_nombre || "Sin Unidad"}` 
    })),
    [puestos]
  );

  const managerOptions = useMemo(() => managers, [managers]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Validaciones
    if (!form.nombres.trim()) return setErr("El nombre es obligatorio.");
    if (!form.apellidos.trim()) return setErr("El apellido es obligatorio.");
    if (!form.email.trim()) return setErr("El email es obligatorio.");
    if (!form.telefono.trim()) return setErr("El teléfono es obligatorio.");
    if (!form.fecha_nacimiento) return setErr("La fecha de nacimiento es obligatoria.");
    if (!form.unidad_id) return setErr("Selecciona una unidad organizacional.");
    if (!form.puesto_id) return setErr("Selecciona un puesto.");

    const payload = {
      unidad_id: Number(form.unidad_id),
      puesto_id: Number(form.puesto_id),
      manager_id: form.manager_id ? Number(form.manager_id) : null,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      fecha_nacimiento: form.fecha_nacimiento, // YYYY-MM-DD
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch("/api/rrhh/empleados/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data));
      }

      // ÉXITO: Abrir modal
      setShowSuccessModal(true);
      
    } catch (e2) {
      setErr(e2?.message || "Error al crear el empleado.");
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/rrhh/empleados");
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      <main className="page-content">
        
        {/* Header */}
        <div className="page-header-section">
            <div>
                <h1 className="page-main-title">Nuevo Empleado</h1>
                <p className="page-subtitle">Registrar un nuevo colaborador en la base de datos.</p>
            </div>
        </div>

        {loading && <div className="loading-state"><i className='bx bx-loader-alt bx-spin'></i> Cargando formularios...</div>}
        
        {err && (
            <div className="error-state" style={{ padding: '15px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <i className='bx bx-error-circle'></i> {err}
            </div>
        )}

        {!loading && (
          // --- GRID LAYOUT ---
          <div className="form-layout-grid">
              
              {/* IZQUIERDA: FORMULARIO */}
              <div className="form-card-main">
                  <form onSubmit={onSubmit}>
                    
                    {/* SECCIÓN 1: DATOS PERSONALES */}
                    <div className="form-section-title">Información Personal y de Contacto</div>

                    {/* Fila 1: Nombres y Apellidos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label className="form-label">Nombres *</label>
                          <div className="input-with-icon-wrapper">
                              <i className='bx bx-user input-icon'></i>
                              <input 
                                className="form-input with-icon"
                                name="nombres" 
                                value={form.nombres} 
                                onChange={onChange} 
                                placeholder="Ej. Juan Andrés"
                              />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Apellidos *</label>
                          <div className="input-with-icon-wrapper">
                              <i className='bx bx-user input-icon'></i>
                              <input 
                                className="form-input with-icon"
                                name="apellidos" 
                                value={form.apellidos} 
                                onChange={onChange} 
                                placeholder="Ej. Pérez López"
                              />
                          </div>
                        </div>
                    </div>

                    {/* Fila 2: Email y Teléfono */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label className="form-label">Correo Electrónico *</label>
                          <div className="input-with-icon-wrapper">
                              <i className='bx bx-envelope input-icon'></i>
                              <input 
                                className="form-input with-icon"
                                type="email"
                                name="email" 
                                value={form.email} 
                                onChange={onChange} 
                                placeholder="ejemplo@empresa.com"
                              />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Teléfono / Móvil *</label>
                          <div className="input-with-icon-wrapper">
                              <i className='bx bx-phone input-icon'></i>
                              <input 
                                className="form-input with-icon"
                                name="telefono" 
                                value={form.telefono} 
                                onChange={onChange} 
                                placeholder="Ej. 0991234567"
                              />
                          </div>
                        </div>
                    </div>

                    {/* Fila 3: Fecha Nacimiento */}
                    <div className="form-group" style={{ maxWidth: '50%' }}>
                        <label className="form-label">Fecha de Nacimiento *</label>
                        <div className="input-with-icon-wrapper">
                            <i className='bx bx-calendar input-icon'></i>
                            <input 
                                className="form-input with-icon"
                                type="date"
                                name="fecha_nacimiento" 
                                value={form.fecha_nacimiento} 
                                onChange={onChange} 
                            />
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="form-group">
                        <label className="form-label">Dirección Domiciliaria</label>
                        <textarea 
                            className="form-input" 
                            style={{ height: 'auto', paddingLeft: '16px' }} 
                            name="direccion" 
                            value={form.direccion} 
                            onChange={onChange} 
                            rows={2} 
                            placeholder="Calle principal, secundaria y número de casa..."
                        />
                    </div>

                    {/* SECCIÓN 2: ASIGNACIÓN ORGANIZACIONAL */}
                    <div className="form-section-title" style={{ marginTop: '30px' }}>Asignación Organizacional</div>

                    {/* Fila: Unidad y Puesto */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Unidad Organizacional *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-sitemap input-icon'></i>
                                <select 
                                    className="form-select with-icon"
                                    name="unidad_id" 
                                    value={form.unidad_id} 
                                    onChange={onChange}
                                >
                                    <option value="">-- Seleccionar Unidad --</option>
                                    {unidadOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Puesto (Cargo) *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-briefcase input-icon'></i>
                                <select 
                                    className="form-select with-icon"
                                    name="puesto_id" 
                                    value={form.puesto_id} 
                                    onChange={onChange}
                                >
                                    <option value="">-- Seleccionar Puesto --</option>
                                    {puestoOptions.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Fila: Manager y Estado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Jefe Inmediato (Manager)</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-user-voice input-icon'></i>
                                <select 
                                    className="form-select with-icon"
                                    name="manager_id" 
                                    value={form.manager_id} 
                                    onChange={onChange}
                                >
                                    <option value="">-- Sin Jefe Asignado --</option>
                                    {managerOptions.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.label}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Estado Inicial *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-toggle-left input-icon'></i>
                                <select 
                                    className="form-select with-icon"
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
                    </div>

                    {/* Footer Botones */}
                    <div className="form-actions-footer">
                      <Link to="/rrhh/empleados" className="btn-form-cancel">
                        Cancelar
                      </Link>
                      <button type="submit" className="btn-create-company" style={{ padding: '12px 32px' }}>
                        <i className='bx bx-user-check'></i> Registrar Empleado
                      </button>
                    </div>

                  </form>
              </div>

              {/* DERECHA: AYUDA */}
              <div className="help-card-side">
                  <div className="help-card-header">
                      <div className="help-icon-box">
                          <i className='bx bx-bulb'></i>
                      </div>
                      <h3 className="help-card-title">Tips de Registro</h3>
                  </div>
                  
                  <div className="help-item">
                      <h4 className="help-item-title">Correo Corporativo</h4>
                      <p className="help-item-text">
                          Asegúrese de usar el correo institucional si ya está asignado. Este será su usuario de acceso al sistema.
                      </p>
                  </div>

                  <div className="help-item">
                      <h4 className="help-item-title">Asignación de Puesto</h4>
                      <p className="help-item-text">
                          El puesto determina el salario base. Si no encuentra el puesto adecuado, debe crearlo primero en la sección "Puestos".
                      </p>
                  </div>

                  <div className="help-item">
                      <h4 className="help-item-title">Contrato</h4>
                      <p className="help-item-text">
                          Al crear el empleado, el sistema preparará su ficha. No olvide registrar posteriormente su contrato en la pestaña correspondiente.
                      </p>
                  </div>
              </div>

          </div>
        )}

        {/* --- MODAL DE ÉXITO --- */}
        {showSuccessModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-icon-success">
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <h3 className="modal-title">¡Registro Exitoso!</h3>
                    <p className="modal-text">
                        El empleado ha sido registrado correctamente en la base de datos.
                    </p>
                    <div className="modal-actions">
                        <button 
                            className="btn-modal" 
                            style={{ backgroundColor: '#d51e37', color: 'white' }}
                            onClick={handleCloseSuccess}
                        >
                            Ir a la Lista
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}