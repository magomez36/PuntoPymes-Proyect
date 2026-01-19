import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Sidebar correcto
import { apiFetch } from "../../../services/api";

// Importamos estilos globales
import "../../../assets/css/admin-empresas.css";

export default function EditarPuesto() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Estado para el modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    unidad_id: "",
    nombre: "",
    descripcion: "",
    nivel: "",
    salario_referencial: "0.00",
  });

  // 1. Cargar lista de Unidades
  const loadUnidades = async () => {
    const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  // 2. Cargar datos del Puesto
  const loadDetalle = async () => {
    const res = await apiFetch(`/api/rrhh/puestos/${id}/`);
    const data = await res.json();

    setForm({
      unidad_id: data.unidad_id ? String(data.unidad_id) : "",
      nombre: data.nombre || "",
      descripcion: data.descripcion || "",
      nivel: data.nivel || "",
      salario_referencial: data.salario_referencial || "0.00",
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
        setErr(e?.message || "Error cargando la información del puesto.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const unidadOptions = useMemo(() => {
    return unidades.map((u) => ({
      id: u.id,
      label: `${u.nombre || "N/A"} (${u.tipo_label ? u.tipo_label.charAt(0).toUpperCase() + u.tipo_label.slice(1) : ''})`,
    }));
  }, [unidades]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "salario_referencial") {
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
      const res = await apiFetch(`/api/rrhh/puestos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data));
      }

      // ÉXITO: Abrir modal
      setShowSuccessModal(true);

    } catch (e2) {
      setErr(e2?.message || "Error al guardar los cambios.");
    }
  };

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
                <h1 className="page-main-title">Editar Puesto</h1>
                <p className="page-subtitle">Actualiza la información, descripción o salario del cargo seleccionado.</p>
            </div>
        </div>

        {loading && <div className="loading-state"><i className='bx bx-loader-alt bx-spin'></i> Cargando datos...</div>}
        
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
                    
                    <div className="form-section-title">Información del Cargo</div>

                    {/* Unidad */}
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
                              />
                          </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                      <label className="form-label">Descripción de Funciones *</label>
                      <textarea 
                        className="form-input" 
                        style={{ height: 'auto', paddingLeft: '16px' }} 
                        name="descripcion" 
                        value={form.descripcion} 
                        onChange={onChange} 
                        rows={4} 
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

                    {/* Footer Botones */}
                    <div className="form-actions-footer">
                      <Link to="/rrhh/puestos" className="btn-form-cancel">
                        Cancelar
                      </Link>
                      <button type="submit" className="btn-create-company" style={{ padding: '12px 32px' }}>
                        <i className='bx bx-save'></i> Guardar Cambios
                      </button>
                    </div>

                  </form>
              </div>

              {/* DERECHA: AYUDA */}
              <div className="help-card-side">
                  <div className="help-card-header">
                      <div className="help-icon-box">
                          <i className='bx bx-edit'></i>
                      </div>
                      <h3 className="help-card-title">Modo Edición</h3>
                  </div>
                  
                  <div className="help-item">
                      <h4 className="help-item-title">Actualizar Unidad</h4>
                      <p className="help-item-text">
                          Si cambias la unidad organizacional, el puesto se moverá en el organigrama y afectará a los empleados asignados actualmente.
                      </p>
                  </div>

                  <div className="help-item">
                      <h4 className="help-item-title">Ajuste Salarial</h4>
                      <p className="help-item-text">
                          Modificar el salario referencial no cambia automáticamente el sueldo de los empleados activos, solo actualiza la referencia para futuras contrataciones.
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
                    <h3 className="modal-title">¡Actualización Exitosa!</h3>
                    <p className="modal-text">
                        La información del puesto ha sido guardada correctamente.
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