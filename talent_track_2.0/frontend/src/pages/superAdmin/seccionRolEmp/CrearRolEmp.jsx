import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar"; // Sidebar de SuperAdmin
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

const ROLES = [
  { id: 1, label: "Super Admin" },
  { id: 2, label: "RRHH (Recursos Humanos)" },
  { id: 3, label: "Manager / Supervisor" },
  { id: 4, label: "Empleado" },
  { id: 5, label: "Auditor" },
];

export default function CrearRolEmp() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  
  const [form, setForm] = useState({
    empresa: "",
    nombre: 2, // RRHH por defecto
    descripcion: "",
  });

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', msg: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/listado-empresas/");
        const data = await res.json();
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const showModal = (type, title, msg) => setModal({ show: true, type, title, msg });
  const closeModal = () => {
      setModal({ ...modal, show: false });
      if (modal.type === 'success') navigate("/admin/roles");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.empresa) return showModal('error', 'Faltan datos', "Selecciona una empresa.");

    try {
      const res = await apiFetch("/api/roles-empresa/", {
        method: "POST",
        body: JSON.stringify({
          empresa: Number(form.empresa),
          nombre: String(form.nombre),
          descripcion: form.descripcion || "",
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      showModal('success', 'Rol Creado', 'El rol se ha asignado correctamente.');
    } catch (e) {
      showModal('error', 'Error', "No se pudo crear el rol.");
    }
  };

  // --- ESTILOS ---
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', backgroundColor: '#fff', color: '#334155' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, padding: '30px 30px 30px 110px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Crear Rol</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Define accesos para una empresa.</p>
            </div>
            <Link to="/admin/roles" style={{ textDecoration:'none', color:'#64748b', fontWeight:'600', display:'flex', alignItems:'center', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {loading ? <p style={{textAlign:'center', color:'#64748b'}}>Cargando...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', alignItems: 'start' }}>
                
                {/* COLUMNA 1: FORMULARIO */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={labelStyle}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                            <select name="empresa" value={form.empresa} onChange={onChange} style={inputStyle} required>
                                <option value="">-- Seleccione Empresa --</option>
                                {empresas.map((e) => (
                                    <option key={e.id} value={e.id}>{e.razon_social}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={labelStyle}>Tipo de Rol <span style={{color:'#ef4444'}}>*</span></label>
                            <select name="nombre" value={form.nombre} onChange={onChange} style={inputStyle}>
                                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={labelStyle}>Descripción (Opcional)</label>
                            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={4} placeholder="Notas internas..." style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button type="button" onClick={() => navigate("/admin/roles")} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '600', cursor:'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', cursor:'pointer' }}>Crear Rol</button>
                        </div>
                    </form>
                </div>

                {/* COLUMNA 2: GUÍA */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', padding: '30px' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className='bx bx-shield-quarter' style={{ color: '#dc2626', fontSize:'1.4rem' }}></i> Niveles de Acceso
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { role: 'Super Admin', desc: 'Control total del sistema y todas las empresas.', icon: 'bx-crown' },
                            { role: 'RRHH', desc: 'Gestión de personal, nóminas y asistencia.', icon: 'bx-user-pin' },
                            { role: 'Manager', desc: 'Supervisión de equipos y aprobación de solicitudes.', icon: 'bx-briefcase' },
                            { role: 'Empleado', desc: 'Acceso al portal personal y marcaje.', icon: 'bx-user' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ minWidth: '36px', height: '36px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    <i className={`bx ${item.icon}`}></i>
                                </div>
                                <div>
                                    <strong style={{ display: 'block', color: '#334155', fontSize: '0.95rem' }}>{item.role}</strong>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* MODAL */}
        {modal.show && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '60px', height: '60px', background: modal.type === 'error' ? '#fee2e2' : '#dcfce7', color: modal.type === 'error' ? '#dc2626' : '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>
                        <i className={`bx ${modal.type === 'error' ? 'bx-x' : 'bx-check'}`}></i>
                    </div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{modal.title}</h3>
                    <p style={{ color: '#64748b', marginBottom: '25px' }}>{modal.msg}</p>
                    <button onClick={closeModal} style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Entendido</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}