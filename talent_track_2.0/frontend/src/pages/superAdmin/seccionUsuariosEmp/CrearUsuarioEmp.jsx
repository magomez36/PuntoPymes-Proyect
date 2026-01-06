import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function CrearUsuarioEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // Estados de Carga
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  
  // Estados Dependientes (Cargan al elegir empresa)
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    empresa_id: "",
    empleado_id: "",
    rol_id: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
    mfa_habilitado: false,
    estado: 1, // 1: Activo
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA INICIAL (Empresas) ---
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        if (!token) return navigate("/login");
        setLoading(true);
        const res = await apiFetch(`${API_BASE}/listado-empresas/`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadEmpresas();
  }, [navigate, token]);

  // --- CARGA DEPENDIENTE (Empleados y Roles) ---
  const loadEmpleadosRoles = async (empresaId) => {
    setEmpleados([]);
    setRoles([]);
    setForm(p => ({ ...p, empleado_id: "", rol_id: "" })); // Resetear selección

    if (!empresaId) return;

    setLoadingDeps(true);
    try {
      const [resEmp, resRol] = await Promise.all([
        apiFetch(`${API_BASE}/helpers/empleados-por-empresa/?empresa_id=${empresaId}`, { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch(`${API_BASE}/helpers/roles-por-empresa/?empresa_id=${empresaId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resEmp.ok) setEmpleados(await resEmp.json());
      if (resRol.ok) setRoles(await resRol.json());

    } catch (e) {
      console.error("Error cargando dependencias", e);
    } finally {
      setLoadingDeps(false);
    }
  };

  // --- HANDLERS ---
  const onChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;

    setForm(p => ({ ...p, [name]: v }));

    if (name === "empresa_id") {
      await loadEmpleadosRoles(v);
    }
    
    // Auto-llenar email si seleccionan empleado (opcional, buena UX)
    if (name === "empleado_id") {
        const emp = empleados.find(e => String(e.id) === String(v));
        if (emp && emp.email) {
            setForm(p => ({ ...p, email: emp.email }));
        }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.empresa_id) return alert("Selecciona una empresa.");
    if (!form.empleado_id) return alert("Selecciona un empleado.");
    if (!form.rol_id) return alert("Selecciona un rol.");
    if (!form.email.trim()) return alert("El email es obligatorio.");
    if (!form.password) return alert("La contraseña es obligatoria.");
    if (form.password !== form.password2) return alert("Las contraseñas no coinciden.");

    const payload = {
      empresa_id: Number(form.empresa_id),
      empleado_id: Number(form.empleado_id),
      rol_id: Number(form.rol_id),
      email: form.email.trim(),
      phone: form.phone?.trim() || "",
      password: form.password,
      password2: form.password2,
      mfa_habilitado: Boolean(form.mfa_habilitado),
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch(`${API_BASE}/usuarios-empresa/`, {
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
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "Error al crear usuario.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/usuarios");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc'}}>Cargando...</div>;

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/usuarios" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Usuarios</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Usuario</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nuevo Usuario</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Asigna credenciales de acceso a un empleado existente.</p>
            </div>

            <form onSubmit={onSubmit} style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: VINCULACIÓN --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-link' style={{fontSize:'1.2rem', color:'#64748b'}}></i> Vinculación
                    </h4>

                    {/* EMPRESA */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bxs-business' style={iconStyle}></i>
                            <select name="empresa_id" value={form.empresa_id} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                <option value="">Seleccionar Empresa...</option>
                                {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>

                    {/* EMPLEADO */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empleado <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-user' style={iconStyle}></i>
                            <select name="empleado_id" value={form.empleado_id} onChange={onChange} disabled={!form.empresa_id || loadingDeps} style={{ ...inputStyle, appearance: 'none', backgroundColor: !form.empresa_id ? '#f3f4f6' : '#f8fafc' }}>
                                <option value="">{loadingDeps ? "Cargando..." : "Seleccionar Empleado..."}</option>
                                {empleados.map(em => (
                                    <option key={em.id} value={em.id}>
                                        {em.nombres} {em.apellidos} - {em.email}
                                    </option>
                                ))}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                        {!form.empresa_id && <p style={{fontSize:'0.75rem', color:'#94a3b8', marginTop:'4px'}}>Selecciona una empresa primero.</p>}
                    </div>

                    {/* ROL */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Rol Asignado <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-badge-check' style={iconStyle}></i>
                            <select name="rol_id" value={form.rol_id} onChange={onChange} disabled={!form.empresa_id || loadingDeps} style={{ ...inputStyle, appearance: 'none', backgroundColor: !form.empresa_id ? '#f3f4f6' : '#f8fafc' }}>
                                <option value="">{loadingDeps ? "Cargando..." : "Seleccionar Rol..."}</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                ))}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>

                    {/* ESTADO */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Estado Inicial</label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-toggle-left' style={iconStyle}></i>
                            <select name="estado" value={form.estado} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                <option value={1}>Activo</option>
                                <option value={2}>Bloqueado</option>
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>
                </div>

                {/* --- DERECHA: CREDENCIALES --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-shield-quarter' style={{fontSize:'1.2rem', color:'#dc2626'}}></i> Credenciales y Seguridad
                    </h4>

                    {/* EMAIL */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Correo Electrónico (Login) <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-envelope' style={iconStyle}></i>
                            <input type="email" name="email" value={form.email} onChange={onChange} style={inputStyle} placeholder="usuario@empresa.com" />
                        </div>
                    </div>

                    {/* PHONE */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Teléfono (Opcional)</label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-phone' style={iconStyle}></i>
                            <input type="text" name="phone" value={form.phone} onChange={onChange} style={inputStyle} placeholder="+593 999 999 999" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        {/* PASSWORD 1 */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Contraseña <span style={{color:'#ef4444'}}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bx-lock-alt' style={iconStyle}></i>
                                <input type="password" name="password" value={form.password} onChange={onChange} style={inputStyle} />
                            </div>
                        </div>

                        {/* PASSWORD 2 */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Repetir Contraseña <span style={{color:'#ef4444'}}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bx-lock-alt' style={iconStyle}></i>
                                <input 
                                    type="password" name="password2" value={form.password2} onChange={onChange} 
                                    style={{ ...inputStyle, borderColor: form.password2 && form.password !== form.password2 ? '#ef4444' : '#d1d5db' }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* MFA */}
                    <div style={{ marginBottom: '32px', background:'#f8fafc', padding:'16px', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>
                            <div style={{ position:'relative', width:'40px', height:'20px' }}>
                                <input type="checkbox" name="mfa_habilitado" checked={form.mfa_habilitado} onChange={onChange} style={{ opacity:0, width:0, height:0 }} />
                                <span style={{ position:'absolute', cursor:'pointer', top:0, left:0, right:0, bottom:0, backgroundColor: form.mfa_habilitado ? '#16a34a' : '#cbd5e1', borderRadius:'34px', transition: '.4s' }}></span>
                                <span style={{ position:'absolute', content:"", height:'16px', width:'16px', left: form.mfa_habilitado ? '22px' : '2px', bottom:'2px', backgroundColor:'white', borderRadius:'50%', transition: '.4s' }}></span>
                            </div>
                            Habilitar Autenticación de Doble Factor (MFA)
                        </label>
                        <p style={{ margin:'8px 0 0 0', fontSize:'0.75rem', color:'#64748b' }}>Aumenta la seguridad requiriendo un código extra al iniciar sesión.</p>
                    </div>

                    {/* BOTONES */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link 
                            to="/admin/usuarios"
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}
                        >
                            Cancelar
                        </Link>
                        <button 
                            type="submit"
                            style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.3)' }}
                        >
                            <i className='bx bx-save'></i> Crear Usuario
                        </button>
                    </div>
                </div>

            </form>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Usuario Creado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Las credenciales han sido generadas exitosamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}