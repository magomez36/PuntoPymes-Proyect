import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Asegúrate de importar el Sidebar correcto
import { apiFetch } from "../../../services/api";

// Importamos los estilos globales
import "../../../assets/css/admin-empresas.css";

export default function CrearPuesto() {
  const navigate = useNavigate();

  // Estados
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    unidad_id: "",
    nombre: "",
    descripcion: "",
    nivel: "",
    salario_referencial: "0.00",
  });

  // Carga de unidades para el Select
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
        setErr(e?.message || "Error cargando unidades organizacionales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unidadOptions = useMemo(() => {
    return unidades.map((u) => ({
      id: u.id,
      label: `${u.nombre || "N/A"} (${u.tipo_label ? u.tipo_label.charAt(0).toUpperCase() + u.tipo_label.slice(1) : ''})`,
    }));
  }, [unidades]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "salario_referencial") {
      // Solo permitir >= 0
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onBlurSalary = () => {
    const n = Number(form.salario_referencial);
    if (Number.isNaN(n) || n < 0) return;
    setForm((p) => ({ ...p, salario_referencial: n.toFixed(2) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.unidad_id) return setErr("Selecciona una unidad organizacional.");
    if (!form.nombre.trim()) return setErr("El nombre es obligatorio.");
    if (!form.descripcion.trim()) return setErr("La descripción es obligatoria.");
    if (!form.nivel.trim()) return setErr("El nivel es obligatorio.");

    const nSalary = Number(form.salario_referencial);
    if (Number.isNaN(nSalary) || nSalary < 0) return setErr("Salario referencial inválido.");

    const payload = {
      unidad_id: Number(form.unidad_id),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      nivel: form.nivel.trim(),
      salario_referencial: nSalary.toFixed(2),
    };

    try {
      const res = await apiFetch("/api/rrhh/puestos/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data));
      }

      // ÉXITO: Mostrar modal en lugar de alert
      setShowSuccessModal(true);
      
    } catch (e2) {
      setErr(e2?.message || "Error creando puesto.");
    }
  };

  // Función para cerrar modal y redirigir
  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/rrhh/puestos");
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      <main className="page-content">
        
        {/* Header */}
        <div className="page-header-section">
            <div>
                <h1 className="page-main-title">Nuevo Puesto</h1>
                <p className="page-subtitle">Registrar un nuevo cargo y definir sus atribuciones y compensación.</p>
            </div>
        </div>

        {loading && <div className="loading-state"><i className='bx bx-loader-alt bx-spin'></i> Cargando formulario...</div>}
        
        {err && (
            <div className="error-state" style={{ padding: '15px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <i className='bx bx-error-circle'></i> {err}
            </div>
        )}

        {!loading && (
          // --- GRID LAYOUT (Igual que Unidades) ---
          <div className="form-layout-grid">
              
              {/* IZQUIERDA: FORMULARIO */}
              <div className="form-card-main">
                  <form onSubmit={onSubmit}>
                    
                    <div className="form-section-title">Datos del Cargo</div>

                    {/* Unidad Organizacional */}
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
                            {unidadOptions.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                      </div>
                    </div>

                    {/* Nombre y Nivel */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label className="form-label">Nombre del Puesto *</label>
                          <div className="input-with-icon-wrapper">
                              <i className='bx bx-id-card input-icon'></i>
                              <input 
                                className="form-input with-icon"
                                name="nombre" 
                                value={form.nombre} 
                                onChange={onChange} 
                                placeholder="Ej. Analista Senior"
                              />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Nivel Jerárquico *</label>
                          <div className="input-with-icon-wrapper">
                              <i className='bx bx-layer input-icon'></i>
                              <input 
                                className="form-input with-icon"
                                name="nivel" 
                                value={form.nivel} 
                                onChange={onChange} 
                                placeholder="Ej. Operativo / Gerencial"
                              />
                          </div>
                        </div>
                    </div>

                    {/* Descripción (Textarea) */}
                    <div className="form-group">
                      <label className="form-label">Descripción de Funciones *</label>
                      <textarea 
                        className="form-input" // Reusamos estilo, aunque sin icono interno
                        style={{ height: 'auto', paddingLeft: '16px' }} // Ajuste porque no tiene icono
                        name="descripcion" 
                        value={form.descripcion} 
                        onChange={onChange} 
                        rows={4} 
                        placeholder="Describa las responsabilidades principales..."
                      />
                    </div>

                    {/* Salario */}
                    <div className="form-section-title" style={{ marginTop: '20px' }}>Compensación</div>
                    
                    <div className="form-group" style={{ maxWidth: '300px' }}>
                      <label className="form-label">Salario Referencial (USD) *</label>
                      <div className="input-with-icon-wrapper">
                          <i className='bx bx-dollar input-icon'></i>
                          <input
                            className="form-input with-icon"
                            type="number"
                            name="salario_referencial"
                            min="0"
                            step="0.01"
                            value={form.salario_referencial}
                            onChange={onChange}
                            onBlur={onBlurSalary}
                          />
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="form-actions-footer">
                      <Link to="/rrhh/puestos" className="btn-form-cancel">
                        Cancelar
                      </Link>
                      <button type="submit" className="btn-create-company" style={{ padding: '12px 32px' }}>
                        <i className='bx bx-save'></i> Guardar Puesto
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
                      <h3 className="help-card-title">Ayuda Rápida</h3>
                  </div>
                  
                  <div className="help-item">
                      <h4 className="help-item-title">Asignación de Unidad</h4>
                      <p className="help-item-text">
                          Cada puesto debe pertenecer a una unidad específica (ej. "Contador" pertenece a "Departamento Financiero").
                      </p>
                  </div>

                  <div className="help-item">
                      <h4 className="help-item-title">Salario Referencial</h4>
                      <p className="help-item-text">
                          Ingrese el valor base bruto mensual. Use punto (.) para decimales. 
                          Ejemplo: <strong>1200.00</strong>
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
                    <h3 className="modal-title">¡Puesto Creado!</h3>
                    <p className="modal-text">
                        El nuevo puesto se ha registrado exitosamente en el sistema.
                    </p>
                    <div className="modal-actions">
                        <button 
                            className="btn-modal" 
                            style={{ backgroundColor: '#d51e37', color: 'white' }}
                            onClick={handleCloseSuccess}
                        >
                            Aceptar y Volver
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}