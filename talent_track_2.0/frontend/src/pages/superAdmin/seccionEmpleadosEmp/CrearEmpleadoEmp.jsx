import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function CrearEmpleadoEmp() {
  const navigate = useNavigate();
  
  // Datos para selects
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [managers, setManagers] = useState([]);
  
  // Formulario
  const [form, setForm] = useState({
    empresa_id: "",
    unidad_id: "",
    puesto_id: "",
    manager_id: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    estado: "1", 
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGAR EMPRESAS ---
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`${API_BASE}/listado-empresas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadEmpresas();
  }, [navigate]);

  // --- CARGAR DEPENDENCIAS (Cascada) ---
  const loadDependencias = async (empresaId) => {
    setUnidades([]);
    setPuestos([]);
    setManagers([]);
    setForm(p => ({ ...p, unidad_id: "", puesto_id: "", manager_id: "" }));

    if (!empresaId) return;

    try {
        const token = getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [resU, resP, resM] = await Promise.all([
            apiFetch(`${API_BASE}/helpers/unidades-por-empresa/?empresa_id=${empresaId}`, { headers }),
            apiFetch(`${API_BASE}/helpers/puestos-por-empresa/?empresa_id=${empresaId}`, { headers }),
            apiFetch(`${API_BASE}/helpers/empleados-por-empresa/?empresa_id=${empresaId}`, { headers }),
        ]);

        if (resU.ok) setUnidades(await resU.json());
        if (resP.ok) setPuestos(await resP.json());
        if (resM.ok) setManagers(await resM.json());

    } catch (e) {
        console.error("Error cargando dependencias", e);
    }
  };

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));

    if (name === "empresa_id") {
        loadDependencias(value);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.empresa_id) return alert("Selecciona una empresa.");
    if (!form.unidad_id) return alert("Selecciona una unidad.");
    if (!form.puesto_id) return alert("Selecciona un puesto.");
    if (!form.nombres.trim() || !form.apellidos.trim()) return alert("Nombre completo obligatorio.");
    if (!form.email.trim()) return alert("Email obligatorio.");

    const payload = {
      empresa_id: Number(form.empresa_id),
      unidad_id: Number(form.unidad_id),
      puesto_id: Number(form.puesto_id),
      manager_id: form.manager_id ? Number(form.manager_id) : null,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      fecha_nacimiento: form.fecha_nacimiento,
      estado: Number(form.estado),
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/empleados-empresa/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.detail || "Error al crear empleado.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/empleados");
  };

  // Estilos Actualizados (Fondo gris suave para inputs)
  const inputStyle = { 
    width: '100%', 
    padding: '10px 12px 10px 40px', 
    borderRadius: '8px', 
    border: '1px solid #d1d5db', 
    outline: 'none', 
    fontSize: '0.9rem', 
    color: '#1f2937', 
    transition: 'border-color 0.2s', 
    backgroundColor: '#f8fafc' // Fondo gris suave solicitado
  };
  
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const textareaStyle = { ...inputStyle, padding: '10px 12px', minHeight: '80px', resize: 'vertical' };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/empleados" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Empleados</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Nuevo Empleado</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nuevo Empleado</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Registra la información personal y laboral del empleado.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        {/* LEYENDA DE CAMPOS OBLIGATORIOS (MOVIDA AQUÍ PARA VISIBILIDAD) */}
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'24px', fontSize:'0.85rem', color:'#64748b', background:'#f1f5f9', padding:'8px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', width:'fit-content' }}>
                            <i className='bx bx-info-circle' style={{fontSize:'1.1rem', color:'#3b82f6'}}></i>
                            <span>Los campos marcados con <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize:'1rem' }}>*</span> son obligatorios.</span>
                        </div>

                        {/* SECCIÓN 1 */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Asignación Laboral
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPRESA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <select name="empresa_id" value={form.empresa_id} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">Seleccionar Empresa...</option>
                                        {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* UNIDAD */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Unidad Organizacional <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-sitemap' style={iconStyle}></i>
                                    <select name="unidad_id" value={form.unidad_id} onChange={onChange} required disabled={!form.empresa_id} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">Seleccionar Unidad...</option>
                                        {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* PUESTO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Puesto / Cargo <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-briefcase' style={iconStyle}></i>
                                    <select name="puesto_id" value={form.puesto_id} onChange={onChange} required disabled={!form.empresa_id} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">Seleccionar Puesto...</option>
                                        {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* MANAGER */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Jefe Inmediato</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-user-pin' style={iconStyle}></i>
                                    <select name="manager_id" value={form.manager_id} onChange={onChange} disabled={!form.empresa_id} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">N/A (Sin Jefe)</option>
                                        {managers.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombres} {m.apellidos}</option>
                                        ))}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2 */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Información Personal
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            {/* NOMBRES */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombres <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-user' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="nombres" 
                                        value={form.nombres} 
                                        onChange={onChange} 
                                        required 
                                        style={inputStyle} 
                                        placeholder="Ej. Juan Carlos" 
                                    />
                                </div>
                            </div>

                            {/* APELLIDOS */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Apellidos <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-user' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="apellidos" 
                                        value={form.apellidos} 
                                        onChange={onChange} 
                                        required 
                                        style={inputStyle} 
                                        placeholder="Ej. Pérez López" 
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Correo Electrónico <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-envelope' style={iconStyle}></i>
                                    <input type="email" name="email" value={form.email} onChange={onChange} required style={inputStyle} placeholder="ejemplo@empresa.com" />
                                </div>
                            </div>

                            {/* TELÉFONO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Teléfono</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-phone' style={iconStyle}></i>
                                    <input type="text" name="telefono" value={form.telefono} onChange={onChange} style={inputStyle} placeholder="Ej. 0991234567" />
                                </div>
                            </div>

                            {/* FECHA NACIMIENTO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Fecha de Nacimiento</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-calendar' style={iconStyle}></i>
                                    <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>

                            {/* ESTADO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Estado Inicial</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-toggle-left' style={iconStyle}></i>
                                    <select name="estado" value={form.estado} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="1">Activo</option>
                                        <option value="2">Suspendido</option>
                                        <option value="3">Baja</option>
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Dirección Domiciliaria</label>
                            <textarea name="direccion" value={form.direccion} onChange={onChange} style={textareaStyle} placeholder="Calle, número, ciudad..." />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/empleados" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Cancelar</Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Registrar Empleado
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- DERECHA: PANEL DE TIPS --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><i className='bx bx-bulb' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Guía de Registro</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Acceso al Sistema</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            El correo electrónico ingresado será el usuario de acceso. Se enviará una contraseña temporal si el sistema de notificaciones está activo.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Jerarquía</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Asignar un <strong>Jefe Inmediato</strong> es crucial para los flujos de aprobación de vacaciones y permisos.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Estado Inicial</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Seleccione <strong>Activo</strong> para permitir el marcaje de asistencia inmediato. Use <strong>Suspendido</strong> si el ingreso es a futuro.
                        </p>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Empleado Registrado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>El nuevo colaborador ha sido añadido al sistema.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}