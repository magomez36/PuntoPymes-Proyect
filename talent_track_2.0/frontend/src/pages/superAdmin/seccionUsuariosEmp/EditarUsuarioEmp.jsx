import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function EditarUsuarioEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState("");
  const [empresaNombre, setEmpresaNombre] = useState(""); // Contexto visual
  const [empleados, setEmpleados] = useState([]);

  const [form, setForm] = useState({
    empleado_id: "",
    email: "",
    phone: "",
    mfa_habilitado: false,
    estado: 1,
    old_password: "",
    new_password: "",
    new_password2: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        if (!token) return navigate("/login");

        // 1. Cargar Usuario
        const res = await apiFetch(`${API_BASE}/usuarios-empresa/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Error cargando usuario");
        const data = await res.json();

        setEmpresaId(String(data.empresa_id || ""));
        setEmpresaNombre(data.empresa_razon_social || "Empresa Desconocida");

        setForm({
          empleado_id: String(data.empleado_id || ""),
          email: data.email || "",
          phone: data.phone || "",
          mfa_habilitado: Boolean(data.mfa_habilitado),
          estado: Number(data.estado || 1),
          old_password: "",
          new_password: "",
          new_password2: "",
        });

        // 2. Cargar Empleados de esa empresa (para poder cambiar el vínculo si es necesario)
        if (data.empresa_id) {
            const resEmp = await apiFetch(`${API_BASE}/helpers/empleados-por-empresa/?empresa_id=${data.empresa_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resEmp.ok) {
                const empData = await resEmp.json();
                setEmpleados(Array.isArray(empData) ? empData : []);
            }
        }

      } catch (e) {
        console.error(e);
        alert("No se pudo cargar la información.");
        navigate("/admin/usuarios");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.empleado_id) return alert("Selecciona un empleado.");
    if (!form.email.trim()) return alert("El email es obligatorio.");

    // Validación de Password
    const anyPw = form.old_password || form.new_password || form.new_password2;
    if (anyPw) {
      if (!form.old_password) return alert("Ingresa la contraseña actual para autorizar el cambio.");
      if (!form.new_password) return alert("Ingresa la nueva contraseña.");
      if (form.new_password !== form.new_password2) return alert("La confirmación de contraseña no coincide.");
    }

    const payload = {
      empleado_id: Number(form.empleado_id),
      email: form.email.trim(),
      phone: form.phone?.trim() || "",
      mfa_habilitado: Boolean(form.mfa_habilitado),
      estado: Number(form.estado),
      old_password: form.old_password || "",
      new_password: form.new_password || "",
      new_password2: form.new_password2 || "",
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/usuarios-empresa/${id}/`, {
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
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "Error al actualizar usuario.");
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
  const readOnlyStyle = { ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' };
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
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Usuario</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Modificar Perfil</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Actualiza datos de contacto, estado y seguridad.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: PERFIL --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px', height: 'fit-content' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-user-circle' style={{fontSize:'1.2rem', color:'#64748b'}}></i> Información de Cuenta
                    </h4>

                    {/* EMPRESA (Contexto) */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa</label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bxs-business' style={iconStyle}></i>
                            <input type="text" value={empresaNombre} readOnly style={readOnlyStyle} />
                        </div>
                    </div>

                    {/* EMPLEADO */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empleado Vinculado <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-user' style={iconStyle}></i>
                            <select name="empleado_id" value={form.empleado_id} onChange={onChange} disabled={!empresaId} style={{ ...inputStyle, appearance: 'none' }}>
                                <option value="">Seleccionar Empleado...</option>
                                {empleados.map(em => (
                                    <option key={em.id} value={em.id}>
                                        {em.nombres} {em.apellidos} - {em.email}
                                    </option>
                                ))}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Email (Login) <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-envelope' style={iconStyle}></i>
                            <input type="email" name="email" value={form.email} onChange={onChange} style={inputStyle} />
                        </div>
                    </div>

                    {/* PHONE */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Teléfono</label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-phone' style={iconStyle}></i>
                            <input type="text" name="phone" value={form.phone} onChange={onChange} style={inputStyle} />
                        </div>
                    </div>

                    {/* ESTADO */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Estado de la Cuenta</label>
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

                {/* --- DERECHA: SEGURIDAD --- */}
                <div style={{ flex: '1', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* MFA */}
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                        <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                            <i className='bx bx-shield-quarter' style={{fontSize:'1.2rem', color:'#0284c7'}}></i> Seguridad Avanzada
                        </h4>
                        
                        <div style={{ background:'#f8fafc', padding:'16px', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>
                                <div style={{ position:'relative', width:'40px', height:'20px' }}>
                                    <input type="checkbox" name="mfa_habilitado" checked={form.mfa_habilitado} onChange={onChange} style={{ opacity:0, width:0, height:0 }} />
                                    <span style={{ position:'absolute', cursor:'pointer', top:0, left:0, right:0, bottom:0, backgroundColor: form.mfa_habilitado ? '#16a34a' : '#cbd5e1', borderRadius:'34px', transition: '.4s' }}></span>
                                    <span style={{ position:'absolute', content:"", height:'16px', width:'16px', left: form.mfa_habilitado ? '22px' : '2px', bottom:'2px', backgroundColor:'white', borderRadius:'50%', transition: '.4s' }}></span>
                                </div>
                                Autenticación de Doble Factor
                            </label>
                        </div>
                    </div>

                    {/* PASSWORD CHANGE */}
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                        <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                            <i className='bx bx-key' style={{fontSize:'1.2rem', color:'#dc2626'}}></i> Cambiar Contraseña
                        </h4>
                        <p style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:'20px' }}>Complete estos campos solo si desea cambiar la clave actual.</p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Contraseña Antigua</label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bx-lock-open' style={iconStyle}></i>
                                <input type="password" name="old_password" value={form.old_password} onChange={onChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nueva Clave</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-lock-alt' style={iconStyle}></i>
                                    <input type="password" name="new_password" value={form.new_password} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Confirmar</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-check-double' style={iconStyle}></i>
                                    <input 
                                        type="password" name="new_password2" value={form.new_password2} onChange={onChange} 
                                        style={{ ...inputStyle, borderColor: form.new_password2 && form.new_password !== form.new_password2 ? '#ef4444' : '#d1d5db' }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link 
                            to="/admin/usuarios"
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent:'center' }}
                        >
                            Cancelar
                        </Link>
                        <button 
                            onClick={onSubmit} 
                            style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.3)' }}
                        >
                            <i className='bx bx-save'></i> Guardar Cambios
                        </button>
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
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Los datos del usuario han sido guardados.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}