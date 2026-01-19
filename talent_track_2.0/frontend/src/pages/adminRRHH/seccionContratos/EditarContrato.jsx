import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/SidebarRRHH";

// Si tienes estilos globales para el sidebar o modales, impórtalos aquí
// import "../../../assets/css/admin-empresas.css"; 

const TIPOS = [
  { id: 1, label: "Indefinido" },
  { id: 2, label: "Plazo Fijo" },
  { id: 3, label: "Temporal" },
  { id: 4, label: "Practicante" },
];

const ESTADOS = [
  { id: 1, label: "Activo" },
  { id: 2, label: "Inactivo" },
];

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    empleado_id: "",
    turno_base_id: "",
    tipo: 1,
    fecha_inicio: "",
    fecha_fin: "",
    salario_base: "0.00",
    jornada_semanal_horas: 40,
    estado: 1,
  });

  // --- CARGA DE DATOS ---
  const loadAll = async () => {
    try {
      const dRes = await apiFetch(`/api/rrhh/contratos/${id}/`);
      const dData = await dRes.json();

      const [eRes, tRes] = await Promise.all([
        apiFetch(`/api/rrhh/helpers/empleados-sin-contrato/?include_empleado_id=${dData.empleado_id}`),
        apiFetch("/api/rrhh/helpers/turnos-min/"),
      ]);
      const eData = await eRes.json();
      const tData = await tRes.json();

      setEmpleados(Array.isArray(eData) ? eData : []);
      setTurnos(Array.isArray(tData) ? tData : []);

      setForm({
        empleado_id: dData.empleado_id ? String(dData.empleado_id) : "",
        turno_base_id: dData.turno_base_id ? String(dData.turno_base_id) : "",
        tipo: Number(dData.tipo || 1),
        fecha_inicio: dData.fecha_inicio || "",
        fecha_fin: dData.fecha_fin || "",
        salario_base: dData.salario_base || "0.00",
        jornada_semanal_horas: Number(dData.jornada_semanal_horas ?? 0),
        estado: Number(dData.estado || 1),
      });
    } catch (e) {
      setErr("Error cargando datos del contrato.");
    }
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadAll();
      } catch (e) {
        setErr(e?.message || "Error cargando contrato.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const turnoOptions = useMemo(
    () => turnos.map((t) => ({ id: t.id, label: t.nombre })),
    [turnos]
  );

  // --- HANDLERS ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.empleado_id) return setErr("Selecciona un empleado.");
    if (!form.fecha_inicio) return setErr("Fecha inicio es obligatoria.");

    const payload = {
      empleado_id: Number(form.empleado_id),
      turno_base_id: form.turno_base_id ? Number(form.turno_base_id) : null,
      tipo: Number(form.tipo),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      salario_base: Number(form.salario_base).toFixed(2),
      jornada_semanal_horas: Number(form.jornada_semanal_horas),
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch(`/api/rrhh/contratos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }
      // Éxito: Mostrar modal
      setShowSuccessModal(true);
    } catch (e2) {
      setErr(e2?.message || "Error actualizando contrato.");
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/rrhh/contratos");
  };

  // --- ESTILOS INLINE (Copiados de tu código) ---
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc', height:'100vh', display:'flex'}}>Cargando...</div>;

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/rrhh/contratos" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Contratos</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Contrato</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Contrato Laboral</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Modifica la información contractual y condiciones del empleado.</p>
            </div>

            {err && <div style={{ padding: '15px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{err}</div>}

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO (IZQUIERDA) --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                        
                        {/* SECCIÓN 1: DATOS GENERALES */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Generales
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPLEADO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empleado <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-user' style={iconStyle}></i>
                                    <select name="empleado_id" value={form.empleado_id} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">-- Selecciona --</option>
                                        {empleados.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* TURNO BASE */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Turno Base</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-time' style={iconStyle}></i>
                                    <select name="turno_base_id" value={form.turno_base_id} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">-- Sin turno base --</option>
                                        {turnoOptions.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: DETALLES DEL CONTRATO */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Detalles del Contrato
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* TIPO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Tipo de Contrato <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-file' style={iconStyle}></i>
                                    <select name="tipo" value={form.tipo} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* ESTADO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Estado <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-toggle-right' style={iconStyle}></i>
                                    <select name="estado" value={form.estado} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        {ESTADOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* FECHA INICIO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Fecha Inicio <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-calendar' style={iconStyle}></i>
                                    <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>

                            {/* FECHA FIN */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Fecha Fin (Opcional)</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-calendar-x' style={iconStyle}></i>
                                    <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 3: REMUNERACIÓN */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Remuneración
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* SALARIO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Salario Base ($) <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-dollar' style={iconStyle}></i>
                                    <input type="number" name="salario_base" min="0" step="0.01" value={form.salario_base} onChange={onChange} onBlur={onBlurSalary} style={inputStyle} />
                                </div>
                            </div>

                            {/* HORAS SEMANALES */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Horas Semanales <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-time-five' style={iconStyle}></i>
                                    <input type="number" name="jornada_semanal_horas" min="0" step="1" value={form.jornada_semanal_horas} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/rrhh/contratos" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL DERECHO (INFO) --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-edit' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Modo Edición</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Restricciones</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            No es posible cambiar el empleado asociado a este contrato. Si hubo un error en la selección, deberá crear un nuevo contrato.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Historial</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Cualquier cambio en el <strong>salario base</strong> o <strong>tipo de contrato</strong> quedará registrado para futuros reportes de nómina.
                        </p>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '16px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <i className='bx bx-info-circle' style={{ color: '#0284c7', fontSize: '1.1rem', marginTop: '1px' }}></i>
                            <span>Los cambios afectarán la nómina actual si el periodo está abierto.</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <i className='bx bx-check' style={{ fontSize: '48px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Actualización Exitosa!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>El contrato ha sido modificado correctamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        Continuar
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}