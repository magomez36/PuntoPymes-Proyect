import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Asegúrate del path correcto
import { apiFetch } from "../../../services/api";

// Importamos estilos globales
import "../../../assets/css/admin-empresas.css";

const TIPOS = [
  { id: 1, label: "Indefinido" },
  { id: 2, label: "Plazo Fijo" },
  { id: 3, label: "Temporal" },
  { id: 4, label: "Practicante / Pasante" },
];

export default function CrearContrato() {
  const navigate = useNavigate();

  // Estados de datos
  const [empleados, setEmpleados] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Estado para Modal Éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    empleado_id: "",
    turno_base_id: "",
    tipo: 1,
    fecha_inicio: "",
    fecha_fin: "",
    salario_base: "0.00",
    jornada_semanal_horas: 40,
  });

  // Carga de datos
  const loadData = async () => {
    const [eRes, tRes] = await Promise.all([
      apiFetch("/api/rrhh/helpers/empleados-sin-contrato/"),
      apiFetch("/api/rrhh/helpers/turnos-min/"),
    ]);
    const eData = await eRes.json();
    const tData = await tRes.json();

    setEmpleados(Array.isArray(eData) ? eData : []);
    setTurnos(Array.isArray(tData) ? tData : []);
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadData();
      } catch (e) {
        setErr(e?.message || "Error cargando datos para el contrato.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const turnoOptions = useMemo(() => turnos.map((t) => ({ id: t.id, label: t.nombre })), [turnos]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "jornada_semanal_horas") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: n }));
      return;
    }

    if (name === "salario_base") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onBlurSalary = () => {
    const n = Number(form.salario_base);
    if (Number.isNaN(n) || n < 0) return;
    setForm((p) => ({ ...p, salario_base: n.toFixed(2) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empleado_id) return setErr("Debes seleccionar un empleado.");
    if (!form.fecha_inicio) return setErr("La fecha de inicio es obligatoria.");

    const payload = {
      empleado_id: Number(form.empleado_id),
      turno_base_id: form.turno_base_id ? Number(form.turno_base_id) : null,
      tipo: Number(form.tipo),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      salario_base: Number(form.salario_base).toFixed(2),
      jornada_semanal_horas: Number(form.jornada_semanal_horas),
    };

    try {
      const res = await apiFetch("/api/rrhh/contratos/", {
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
      setErr(e2?.message || "Error al crear el contrato.");
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/rrhh/contratos");
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      <main className="page-content">
        
        {/* Header */}
        <div className="page-header-section">
            <div>
                <h1 className="page-main-title">Nuevo Contrato</h1>
                <p className="page-subtitle">Formalizar la relación laboral con un colaborador.</p>
            </div>
        </div>

        {loading && <div className="loading-state"><i className='bx bx-loader-alt bx-spin'></i> Preparando formulario...</div>}
        
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
                    
                    {/* SECCIÓN 1: DETALLES DEL CONTRATO */}
                    <div className="form-section-title">Detalles de Contratación</div>

                    {/* Empleado y Tipo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Empleado (Sin contrato activo) *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-user input-icon'></i>
                                <select 
                                    className="form-select with-icon"
                                    name="empleado_id" 
                                    value={form.empleado_id} 
                                    onChange={onChange}
                                >
                                    <option value="">-- Seleccionar Colaborador --</option>
                                    {empleados.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.label}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tipo de Contrato *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-file-blank input-icon'></i>
                                <select 
                                    className="form-select with-icon"
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

                    {/* Fechas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Fecha de Inicio *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-calendar input-icon'></i>
                                <input 
                                    className="form-input with-icon"
                                    type="date"
                                    name="fecha_inicio" 
                                    value={form.fecha_inicio} 
                                    onChange={onChange} 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fecha de Fin (Opcional)</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-calendar-x input-icon'></i>
                                <input 
                                    className="form-input with-icon"
                                    type="date"
                                    name="fecha_fin" 
                                    value={form.fecha_fin} 
                                    onChange={onChange} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: CONDICIONES ECONÓMICAS */}
                    <div className="form-section-title" style={{ marginTop: '30px' }}>Condiciones Económicas y Horario</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        
                        {/* Salario */}
                        <div className="form-group">
                            <label className="form-label">Salario Base ($) *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-dollar input-icon'></i>
                                <input
                                    className="form-input with-icon"
                                    type="number"
                                    name="salario_base"
                                    min="0"
                                    step="0.01"
                                    value={form.salario_base}
                                    onChange={onChange}
                                    onBlur={onBlurSalary}
                                />
                            </div>
                        </div>

                        {/* Jornada */}
                        <div className="form-group">
                            <label className="form-label">Horas Semanales *</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-time input-icon'></i>
                                <input
                                    className="form-input with-icon"
                                    type="number"
                                    name="jornada_semanal_horas"
                                    min="0"
                                    step="1"
                                    value={form.jornada_semanal_horas}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {/* Turno */}
                        <div className="form-group">
                            <label className="form-label">Turno Base (Opc.)</label>
                            <div className="input-with-icon-wrapper">
                                <i className='bx bx-sun input-icon'></i>
                                <select 
                                    className="form-select with-icon"
                                    name="turno_base_id" 
                                    value={form.turno_base_id} 
                                    onChange={onChange}
                                >
                                    <option value="">-- Ninguno --</option>
                                    {turnoOptions.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.label}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </div>

                    {/* Footer Botones */}
                    <div className="form-actions-footer">
                      <Link to="/rrhh/contratos" className="btn-form-cancel">
                        Cancelar
                      </Link>
                      <button type="submit" className="btn-create-company" style={{ padding: '12px 32px' }}>
                        <i className='bx bx-check-double'></i> Crear Contrato
                      </button>
                    </div>

                  </form>
              </div>

              {/* DERECHA: AYUDA */}
              <div className="help-card-side">
                  <div className="help-card-header">
                      <div className="help-icon-box">
                          <i className='bx bx-info-circle'></i>
                      </div>
                      <h3 className="help-card-title">Antes de Empezar</h3>
                  </div>
                  
                  <div className="help-item">
                      <h4 className="help-item-title">¿No aparece el empleado?</h4>
                      <p className="help-item-text">
                          En la lista solo aparecen colaboradores que <strong>no tienen un contrato activo</strong> actualmente. Si ya tiene uno, debe finalizarlo primero o editarlo.
                      </p>
                  </div>

                  <div className="help-item">
                      <h4 className="help-item-title">Contratos Indefinidos</h4>
                      <p className="help-item-text">
                          Para contratos indefinidos, deje el campo <strong>Fecha de Fin</strong> en blanco.
                      </p>
                  </div>

                  <div className="help-item">
                      <h4 className="help-item-title">Salario Base</h4>
                      <p className="help-item-text">
                          Ingrese el valor bruto mensual sin descontar aportes al IESS ni impuestos.
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
                    <h3 className="modal-title">¡Contrato Creado!</h3>
                    <p className="modal-text">
                        Se ha registrado correctamente el contrato laboral en el sistema.
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