import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/SidebarEmpleado";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// --- HELPERS ---
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

function fmtDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function MiPerfilCuentaEmp() {
  const [tab, setTab] = useState("perfil"); // perfil | cuenta
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [perfil, setPerfil] = useState(null);
  const [cuenta, setCuenta] = useState(null);

  // Estados de edición
  const [editPerfil, setEditPerfil] = useState(false);
  const [editCuenta, setEditCuenta] = useState(false);

  // Formularios
  const [perfilForm, setPerfilForm] = useState({
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
  });

  const [cuentaForm, setCuentaForm] = useState({
    email: "",
    phone: "",
    password_actual: "",
    password_nueva: "",
    password_nueva_repetir: "",
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });

  // --- CARGA DE DATOS ---
  const loadAll = async () => {
    setLoading(true);
    try {
      const r1 = await apiFetch("/api/empleado/perfil/");
      const d1 = await safeJson(r1);
      if (!r1.ok) throw new Error(d1?.detail || "Error cargando perfil.");

      const r2 = await apiFetch("/api/empleado/cuenta/");
      const d2 = await safeJson(r2);
      if (!r2.ok) throw new Error(d2?.detail || "Error cargando cuenta.");

      setPerfil(d1);
      setCuenta(d2);

      setPerfilForm({
        telefono: d1?.telefono || "",
        direccion: d1?.direccion || "",
        fecha_nacimiento: fmtDate(d1?.fecha_nacimiento),
      });

      setCuentaForm((p) => ({
        ...p,
        email: d2?.email || "",
        phone: d2?.phone || "",
        password_actual: "",
        password_nueva: "",
        password_nueva_repetir: "",
      }));
    } catch (e) {
      showModal('error', 'Error de Conexión', e?.message || "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // --- HANDLERS ---
  const onChangePerfil = (e) => {
    const { name, value } = e.target;
    setPerfilForm((p) => ({ ...p, [name]: value }));
  };

  const onChangeCuenta = (e) => {
    const { name, value } = e.target;
    setCuentaForm((p) => ({ ...p, [name]: value }));
  };

  const showModal = (type, title, message) => {
      setModalConfig({ show: true, type, title, message });
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        telefono: perfilForm.telefono || null,
        direccion: perfilForm.direccion || null,
        fecha_nacimiento: perfilForm.fecha_nacimiento ? perfilForm.fecha_nacimiento : null,
      };

      const res = await apiFetch("/api/empleado/perfil/", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data || {}));

      setPerfil(data);
      setEditPerfil(false);
      showModal('success', 'Perfil Actualizado', 'Tus datos personales se han guardado correctamente.');
    } catch (e2) {
      showModal('error', 'Error', e2?.message || "No se pudo guardar el perfil.");
    }
  };

  const guardarCuenta = async (e) => {
    e.preventDefault();
    
    const pa = cuentaForm.password_actual;
    const pn = cuentaForm.password_nueva;
    const pr = cuentaForm.password_nueva_repetir;
    const quiereCambiarPass = Boolean(pa || pn || pr);

    // Validación Front
    if (quiereCambiarPass) {
      if (!(pa && pn && pr)) return showModal('error', 'Faltan datos', "Para cambiar la contraseña debes llenar todos los campos de seguridad.");
      if (pn !== pr) return showModal('error', 'Error', "Las nuevas contraseñas no coinciden.");
      if (pn.length < 6) return showModal('error', 'Seguridad', "La nueva contraseña debe tener al menos 6 caracteres.");
      if (pa === pn) return showModal('error', 'Error', "La nueva contraseña no puede ser igual a la actual.");
    }

    try {
      // 1) Guardar email / phone
      const payloadCuenta = {
        email: cuentaForm.email.trim(),
        phone: cuentaForm.phone || null,
      };

      const resCuenta = await apiFetch("/api/empleado/cuenta/", {
        method: "PUT",
        body: JSON.stringify(payloadCuenta),
      });

      const dataCuenta = await safeJson(resCuenta);
      if (!resCuenta.ok) throw new Error(dataCuenta?.detail || "Error actualizando cuenta.");

      setCuenta(dataCuenta);

      // 2) Cambiar password (si aplica)
      if (quiereCambiarPass) {
        const payloadPass = {
          password_actual: pa,
          password_nueva: pn,
          password_nueva_repetir: pr,
        };

        const resPass = await apiFetch("/api/empleado/usuario/cambiar-password/", {
          method: "PATCH",
          body: JSON.stringify(payloadPass),
        });

        const dataPass = await safeJson(resPass);
        if (!resPass.ok) {
          const firstKey = dataPass && typeof dataPass === "object" ? Object.keys(dataPass)[0] : null;
          throw new Error(firstKey ? dataPass[firstKey] : dataPass?.detail || "No se pudo cambiar la contraseña.");
        }
      }

      setEditCuenta(false);
      
      // Limpiar campos de password
      setCuentaForm((p) => ({
        ...p,
        password_actual: "",
        password_nueva: "",
        password_nueva_repetir: "",
      }));

      showModal('success', 'Cuenta Actualizada', quiereCambiarPass ? "Se han actualizado tus datos y tu contraseña." : "Tus datos de contacto han sido actualizados.");

    } catch (e2) {
      showModal('error', 'Error', e2?.message || "Ocurrió un error al guardar los cambios.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
  
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1e293b' };
  
  // --- NUEVO ESTILO DE PESTAÑAS (TABS SUBRAYADAS) ---
  const tabBtnStyle = (isActive) => ({
    padding: '12px 20px', 
    border: 'none', 
    borderBottom: isActive ? '3px solid #D51F36' : '3px solid transparent', // Línea roja activa
    backgroundColor: 'transparent', 
    color: isActive ? '#D51F36' : '#64748b', // Texto rojo activo
    fontWeight: isActive ? '700' : '600', 
    cursor: 'pointer', 
    transition: 'all 0.2s', 
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Mi Perfil</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Gestiona tu información personal y seguridad.</p>
            </div>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* --- TABS DE NAVEGACIÓN (NUEVO DISEÑO) --- */}
        <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '15px', marginBottom: '10px' }}>
            <button onClick={() => setTab("perfil")} style={tabBtnStyle(tab === "perfil")}>
                <i className='bx bx-user'></i> Datos Personales
            </button>
            <button onClick={() => setTab("cuenta")} style={tabBtnStyle(tab === "cuenta")}>
                <i className='bx bx-shield-quarter'></i> Cuenta & Seguridad
            </button>
        </div>

        {loading && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando datos...</p>}

        {/* --- TAB: PERFIL --- */}
        {!loading && tab === "perfil" && perfil && (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Avatar Card (Decorativo) */}
                <div style={{ flex: '0 0 280px', ...cardStyle, textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f1f5f9', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#64748b', fontWeight: '700' }}>
                        {perfil.nombres?.charAt(0)}{perfil.apellidos?.charAt(0)}
                    </div>
                    <h2 style={{ fontSize: '1.2rem', color: '#1e293b', margin: '0 0 5px 0' }}>{perfil.nombres} {perfil.apellidos}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Colaborador</p>
                </div>

                {/* Formulario Datos */}
                <div style={{ flex: 1, ...cardStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>Información Básica</h3>
                        {!editPerfil && (
                            <button onClick={() => setEditPerfil(true)} style={{ border: 'none', background: 'transparent', color: '#0f172a', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <i className='bx bx-edit'></i> Editar
                            </button>
                        )}
                    </div>

                    {!editPerfil ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' }}>
                            <div>
                                <label style={labelStyle}>Correo Electrónico</label>
                                <div style={{ fontSize: '1rem', color: '#334155' }}>{perfil.email}</div>
                            </div>
                            <div>
                                <label style={labelStyle}>Teléfono</label>
                                <div style={{ fontSize: '1rem', color: '#334155' }}>{perfil.telefono || "No registrado"}</div>
                            </div>
                            <div>
                                <label style={labelStyle}>Fecha de Nacimiento</label>
                                <div style={{ fontSize: '1rem', color: '#334155' }}>{perfil.fecha_nacimiento ? fmtDate(perfil.fecha_nacimiento) : "No registrada"}</div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Dirección Domiciliaria</label>
                                <div style={{ fontSize: '1rem', color: '#334155' }}>{perfil.direccion || "No registrada"}</div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={guardarPerfil}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Teléfono de Contacto</label>
                                    <input name="telefono" value={perfilForm.telefono} onChange={onChangePerfil} style={inputStyle} placeholder="Ej: 0991234567" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fecha de Nacimiento</label>
                                    <input type="date" name="fecha_nacimiento" value={perfilForm.fecha_nacimiento} onChange={onChangePerfil} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Dirección Domiciliaria</label>
                                    <input name="direccion" value={perfilForm.direccion} onChange={onChangePerfil} style={inputStyle} placeholder="Ej: Av. Loja y Mercadillo" />
                                </div>
                            </div>
                            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => { setEditPerfil(false); loadAll(); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar Cambios</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {/* --- TAB: CUENTA --- */}
        {!loading && tab === "cuenta" && cuenta && (
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Configuración de Cuenta</h3>
                    {!editCuenta && (
                        <button onClick={() => setEditCuenta(true)} style={{ border: 'none', background: 'transparent', color: '#0f172a', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i className='bx bx-edit'></i> Editar
                        </button>
                    )}
                </div>

                {!editCuenta ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <div>
                            <label style={labelStyle}>Email (Usuario de Acceso)</label>
                            <div style={{ fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className='bx bx-envelope' style={{color:'#94a3b8'}}></i> {cuenta.email}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Teléfono de Recuperación</label>
                            <div style={{ fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className='bx bx-phone' style={{color:'#94a3b8'}}></i> {cuenta.phone || "No configurado"}
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Estado MFA (2FA)</label>
                            <div style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '20px', backgroundColor: cuenta.mfa_habilitado ? '#dcfce7' : '#f1f5f9', color: cuenta.mfa_habilitado ? '#166534' : '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>
                                {cuenta.mfa_habilitado ? "ACTIVADO" : "DESACTIVADO"}
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={guardarCuenta}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <label style={labelStyle}>Email <span style={{color:'#ef4444'}}>*</span></label>
                                <input name="email" value={cuentaForm.email} onChange={onChangeCuenta} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Teléfono Recuperación</label>
                                <input name="phone" value={cuentaForm.phone} onChange={onChangeCuenta} style={inputStyle} />
                            </div>
                        </div>

                        {/* SECCIÓN CAMBIO DE CONTRASEÑA */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '0.95rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className='bx bx-lock-alt'></i> Cambio de Contraseña
                            </h4>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Contraseña Actual</label>
                                    <input type="password" name="password_actual" value={cuentaForm.password_actual} onChange={onChangeCuenta} style={inputStyle} placeholder="Solo si deseas cambiarla..." />
                                </div>
                                <div>
                                    <label style={labelStyle}>Nueva Contraseña</label>
                                    <input type="password" name="password_nueva" value={cuentaForm.password_nueva} onChange={onChangeCuenta} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Repetir Nueva Contraseña</label>
                                    <input type="password" name="password_nueva_repetir" value={cuentaForm.password_nueva_repetir} onChange={onChangeCuenta} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => { setEditCuenta(false); loadAll(); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar Cambios</button>
                        </div>
                    </form>
                )}
            </div>
        )}

        {/* --- MODAL --- */}
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
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                        {modalConfig.title}
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5', fontSize:'0.95rem' }}>
                        {modalConfig.message}
                    </p>
                    <button 
                        onClick={closeModal} 
                        style={{ width: '100%', padding: '12px', backgroundColor: modalConfig.type === 'success' ? '#16a34a' : '#374151', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}
                    >
                        {modalConfig.type === 'success' ? 'Continuar' : 'Cerrar'}
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}