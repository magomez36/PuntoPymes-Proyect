import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function EditarEmpleadoEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [empresaId, setEmpresaId] = useState("");
  const [empresaNombre, setEmpresaNombre] = useState(""); // Para mostrar contexto
  const [unidades, setUnidades] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [managers, setManagers] = useState([]);
  
  // Formulario
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
    estado: 1,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGAR DEPENDENCIAS ---
  const loadDependencias = async (empId) => {
    try {
        const token = getAccessToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [resU, resP, resM] = await Promise.all([
            apiFetch(`${API_BASE}/helpers/unidades-por-empresa/?empresa_id=${empId}`, { headers }),
            apiFetch(`${API_BASE}/helpers/puestos-por-empresa/?empresa_id=${empId}`, { headers }),
            apiFetch(`${API_BASE}/helpers/empleados-por-empresa/?empresa_id=${empId}`, { headers }),
        ]);

        if (resU.ok) setUnidades(await resU.json());
        if (resP.ok) setPuestos(await resP.json());
        if (resM.ok) setManagers(await resM.json());

    } catch (e) {
        console.error("Error dependencias", e);
    }
  };

  // --- CARGAR DATOS INICIALES ---
  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`${API_BASE}/empleados-empresa/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("No se pudo cargar empleado.");
        const data = await res.json();

        // Guardamos ID y Nombre de empresa para contexto
        setEmpresaId(String(data.empresa_id || ""));
        setEmpresaNombre(data.empresa_razon_social || "Empresa Desconocida");

        if (data.empresa_id) {
            await loadDependencias(data.empresa_id);
        }

        setForm({
            unidad_id: String(data.unidad_id || ""),
            puesto_id: String(data.puesto_id || ""),
            manager_id: data.manager_id ? String(data.manager_id) : "",
            nombres: data.nombres || "",
            apellidos: data.apellidos || "",
            email: data.email || "",
            telefono: data.telefono || "",
            direccion: data.direccion || "",
            fecha_nacimiento: data.fecha_nacimiento || "",
            estado: Number(data.estado || 1),
        });

        setLoading(false);

      } catch (e) {
        console.error(e);
        alert("Error cargando datos.");
        navigate("/admin/empleados");
      }
    };
    load();
  }, [id, navigate]);

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.unidad_id) return alert("Selecciona unidad.");
    if (!form.puesto_id) return alert("Selecciona puesto.");
    if (!form.nombres.trim() || !form.apellidos.trim()) return alert("Nombre completo obligatorio.");
    if (!form.email.trim()) return alert("Email obligatorio.");

    const payload = {
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
      const res = await apiFetch(`${API_BASE}/empleados-empresa/${id}/`, {
        method: "PUT",
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
        alert(err?.detail || "Error al actualizar.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/empleados");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' };
  const readOnlyStyle = { ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const textareaStyle = { ...inputStyle, padding: '10px 12px', minHeight: '80px', resize: 'vertical' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc'}}>Cargando...</div>;

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/empleados" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Empleados</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Empleado</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Perfil</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Actualiza la información laboral y personal.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        {/* LEYENDA */}
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'24px', fontSize:'0.85rem', color:'#64748b', background:'#f1f5f9', padding:'8px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', width:'fit-content' }}>
                            <i className='bx bx-info-circle' style={{fontSize:'1.1rem', color:'#3b82f6'}}></i>
                            <span>Los campos marcados con <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize:'1rem' }}>*</span> son obligatorios.</span>
                        </div>

                        {/* SECCIÓN 1 */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Laborales
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPRESA (READ ONLY) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <input type="text" value={empresaNombre} readOnly style={readOnlyStyle} />
                                </div>
                            </div>

                            {/* UNIDAD */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Unidad Organizacional <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-sitemap' style={iconStyle}></i>
                                    <select name="unidad_id" value={form.unidad_id} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
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
                                    <select name="puesto_id" value={form.puesto_id} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
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
                                    <select name="manager_id" value={form.manager_id} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">N/A (Sin Jefe)</option>
                                        {managers
                                            .filter(m => String(m.id) !== String(id)) // Evitar auto-selección
                                            .map(m => (
                                                <option key={m.id} value={m.id}>{m.nombres} {m.apellidos}</option>
                                            ))}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2 */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Personales
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                            {/* NOMBRES */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombres <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-user' style={iconStyle}></i>
                                    <input type="text" name="nombres" value={form.nombres} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>

                            {/* APELLIDOS */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Apellidos <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-user' style={iconStyle}></i>
                                    <input type="text" name="apellidos" value={form.apellidos} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Correo Electrónico <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-envelope' style={iconStyle}></i>
                                    <input type="email" name="email" value={form.email} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>

                            {/* TELÉFONO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Teléfono</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-phone' style={iconStyle}></i>
                                    <input type="text" name="telefono" value={form.telefono} onChange={onChange} style={inputStyle} />
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

                            {/* ESTADO (VISIBLE AL EDITAR) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Estado Actual</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-toggle-left' style={iconStyle}></i>
                                    <select name="estado" value={form.estado} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value={1}>Activo</option>
                                        <option value={2}>Suspendido</option>
                                        <option value={3}>Baja</option>
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Dirección Domiciliaria</label>
                            <textarea name="direccion" value={form.direccion} onChange={onChange} style={textareaStyle} />
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/empleados" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL INFO --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-edit' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Modo Edición</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Empresa Bloqueada</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            No se puede mover un empleado entre empresas directamente. Para hacerlo, debe crearlo como nuevo en la otra empresa.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Cambio de Estado</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Si cambia a <strong>Baja</strong>, el empleado perderá el acceso al sistema inmediatamente.
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Actualización Exitosa!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Los datos del empleado han sido guardados.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}