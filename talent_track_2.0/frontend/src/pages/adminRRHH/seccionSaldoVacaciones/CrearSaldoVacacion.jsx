import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Sidebar correcto
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// --- HELPERS ---
function buildYears(centerYear = new Date().getFullYear(), back = 5, forward = 2) {
  const years = [];
  for (let y = centerYear - back; y <= centerYear + forward; y++) years.push(String(y));
  return years;
}

export default function CrearSaldoVacacion() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [saldos, setSaldos] = useState([]);

  const [form, setForm] = useState({
    empleado_id: "",
    periodo: "",
    dias_asignados: "15", // Default más común
  });

  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });

  const years = useMemo(() => buildYears(), []);

  // --- CARGA DE DATOS ---
  const load = async () => {
    setLoading(true);
    try {
      const [resEmp, resSaldos] = await Promise.all([
        apiFetch("/api/rrhh/vacaciones/helpers/empleados/"),
        apiFetch("/api/rrhh/vacaciones/saldos/"),
      ]);

      const dataEmp = await resEmp.json().catch(() => []);
      const dataSaldos = await resSaldos.json().catch(() => []);

      if (!resEmp.ok) throw new Error(dataEmp?.detail || "No se pudo cargar empleados.");
      if (!resSaldos.ok) throw new Error(dataSaldos?.detail || "No se pudo cargar saldos existentes.");

      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
      setSaldos(Array.isArray(dataSaldos) ? dataSaldos : []);
    } catch (e) {
      showModal('error', 'Error', e?.message || "Error cargando datos iniciales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- VALIDACIONES ---
  const periodosOcupados = useMemo(() => {
    const eid = Number(form.empleado_id);
    if (!eid) return new Set();
    const used = saldos
      .filter((s) => Number(s.empleado) === eid)
      .map((s) => String(s.periodo));
    return new Set(used);
  }, [form.empleado_id, saldos]);

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dias_asignados") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return; // Validación numérica básica
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }

    if (name === "empleado_id") {
      setForm((p) => ({ ...p, empleado_id: value, periodo: "" })); // Reset periodo al cambiar empleado
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const showModal = (type, title, message) => {
      setModalConfig({ show: true, type, title, message });
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
      if (modalConfig.type === 'success') {
          navigate("/rrhh/vacaciones/saldos");
      }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.empleado_id) return showModal('error', 'Faltan datos', "Selecciona un empleado.");
    if (!form.periodo) return showModal('error', 'Faltan datos', "Selecciona un periodo.");
    if (periodosOcupados.has(String(form.periodo))) return showModal('error', 'Duplicado', "Este empleado ya tiene un saldo registrado para ese periodo.");

    const diasAsignadosNum = Number(form.dias_asignados);
    if (Number.isNaN(diasAsignadosNum) || diasAsignadosNum < 0) return showModal('error', 'Error', "La cantidad de días no es válida.");

    try {
      const res = await apiFetch("/api/rrhh/vacaciones/saldos/", {
        method: "POST",
        body: JSON.stringify({
          empleado_id: Number(form.empleado_id),
          periodo: String(form.periodo),
          dias_asignados: String(Number(form.dias_asignados).toFixed(2)),
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(out?.periodo || out?.detail || "Error al guardar.");
      }

      showModal('success', 'Saldo Creado', 'Se ha asignado el saldo de vacaciones correctamente.');
      
    } catch (e2) {
      showModal('error', 'Error', e2?.message || "No se pudo crear el registro.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', maxWidth: '600px', width: '100%' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1e293b', backgroundColor: '#fff' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Asignar Saldo</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Registra días de vacaciones para un colaborador.</p>
            </div>
            <Link to="/rrhh/vacaciones/saldos" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* LOADING STATE */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando datos...</p>}

        {/* FORMULARIO CARD */}
        {!loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '20px' }}>
                <div style={cardStyle}>
                    <form onSubmit={submit}>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Empleado <span style={{color:'#ef4444'}}>*</span></label>
                            <select 
                                name="empleado_id" 
                                value={form.empleado_id} 
                                onChange={onChange} 
                                style={inputStyle}
                                required
                            >
                                <option value="">-- Selecciona un colaborador --</option>
                                {empleados.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.nombres} {e.apellidos} ({e.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label style={labelStyle}>Periodo (Año) <span style={{color:'#ef4444'}}>*</span></label>
                                <select 
                                    name="periodo" 
                                    value={form.periodo} 
                                    onChange={onChange} 
                                    disabled={!form.empleado_id}
                                    style={{ ...inputStyle, backgroundColor: !form.empleado_id ? '#f1f5f9' : '#fff' }}
                                    required
                                >
                                    <option value="">-- Año --</option>
                                    {years.map((y) => (
                                        <option key={y} value={y} disabled={periodosOcupados.has(y)} style={{ color: periodosOcupados.has(y) ? '#cbd5e1' : 'inherit' }}>
                                            {y} {periodosOcupados.has(y) ? "(Asignado)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Días a Asignar <span style={{color:'#ef4444'}}>*</span></label>
                                <input 
                                    type="number" 
                                    name="dias_asignados" 
                                    min="0" 
                                    step="1" // Paso entero para evitar decimales innecesarios en input
                                    value={form.dias_asignados} 
                                    onChange={onChange} 
                                    style={inputStyle}
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate("/rrhh/vacaciones/saldos")} 
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#D51F36', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(213, 31, 54, 0.2)' }}
                            >
                                Guardar Saldo
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        )}

        {/* MODAL DE ÉXITO / ERROR */}
        {modalConfig.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        backgroundColor: modalConfig.type === 'success' ? '#dcfce7' : '#fee2e2', 
                        color: modalConfig.type === 'success' ? '#16a34a' : '#dc2626', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <i className={`bx ${modalConfig.type === 'success' ? 'bx-check' : 'bx-x'}`} style={{ fontSize: '48px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{modalConfig.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5', fontSize:'0.95rem' }}>{modalConfig.message}</p>
                    <button onClick={closeModal} style={{ width: '100%', padding: '12px', backgroundColor: modalConfig.type === 'success' ? '#16a34a' : '#374151', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        {modalConfig.type === 'success' ? 'Continuar' : 'Cerrar'}
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}