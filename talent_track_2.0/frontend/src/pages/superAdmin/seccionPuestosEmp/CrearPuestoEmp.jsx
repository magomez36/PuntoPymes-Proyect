import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Reutilizamos estilos
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function CrearPuestoEmp() {
  const navigate = useNavigate();
  
  // Estados de datos
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]); // Se carga al elegir empresa
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    empresa: "",
    unidad: "",
    nombre: "",
    descripcion: "",
    nivel: "",
    salario_referencial: "",
  });

  // Estado Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- 1. CARGAR EMPRESAS ---
  useEffect(() => {
    const fetchEmpresas = async () => {
        try {
            const token = getAccessToken();
            if (!token) return navigate("/login");
            
            const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmpresas(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchEmpresas();
  }, [navigate]);

  // --- 2. CARGAR UNIDADES (Al cambiar empresa) ---
  const loadUnidades = async (empresaId) => {
    setUnidades([]); // Limpiar anteriores
    
    if (!empresaId) return;

    try {
        const token = getAccessToken();
        const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?empresa_id=${empresaId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUnidades(Array.isArray(data) ? data : []);
        }
    } catch (error) {
        console.error("Error cargando unidades", error);
    }
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "empresa") {
        setFormData(prev => ({ ...prev, empresa: value, unidad: "" })); // Reset unidad
        loadUnidades(value);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!formData.empresa) return alert("Seleccione una empresa.");
    if (!formData.unidad) return alert("Seleccione una unidad organizacional.");
    if (!formData.nombre.trim()) return alert("El nombre del puesto es obligatorio.");

    const payload = {
        empresa: parseInt(formData.empresa, 10),
        unidad: parseInt(formData.unidad, 10),
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        nivel: formData.nivel,
        salario_referencial: formData.salario_referencial === "" ? null : parseFloat(formData.salario_referencial),
    };

    try {
        const token = getAccessToken();
        const res = await apiFetch(`${API_BASE}/api/crear-puesto/`, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setShowSuccessModal(true);
        } else {
            const errorData = await res.json().catch(() => ({}));
            alert(errorData?.detail || "Error al crear el puesto.");
        }
    } catch (error) {
        alert("Error de conexión");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/puestos");
  };

  // Estilos inline
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const textareaStyle = { ...inputStyle, padding: '10px 12px', minHeight: '80px', resize: 'vertical' }; // Ajuste para textarea

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/puestos" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Puestos</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Puesto</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nuevo Puesto de Trabajo</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define los cargos, roles y responsabilidades dentro de una unidad.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Ubicación Organizacional
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPRESA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <select 
                                        name="empresa" 
                                        value={formData.empresa} 
                                        onChange={handleChange} 
                                        required
                                        style={{ ...inputStyle, appearance: 'none' }}
                                    >
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
                                    <select 
                                        name="unidad" 
                                        value={formData.unidad} 
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.empresa}
                                        style={{ 
                                            ...inputStyle, 
                                            appearance: 'none', 
                                            backgroundColor: formData.empresa ? 'white' : '#f3f4f6',
                                            cursor: formData.empresa ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        <option value="">Seleccionar Unidad...</option>
                                        {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Detalles del Puesto
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* NOMBRE */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre del Cargo <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-id-card' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        placeholder="Ej. Analista de Datos Senior" 
                                        value={formData.nombre} 
                                        onChange={handleChange} 
                                        required
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* NIVEL */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nivel Jerárquico</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-layer' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="nivel" 
                                        placeholder="Ej. Junior, Senior, Gerencial" 
                                        value={formData.nivel} 
                                        onChange={handleChange} 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* SALARIO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Salario Referencial</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-money' style={iconStyle}></i>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        name="salario_referencial" 
                                        placeholder="0.00" 
                                        value={formData.salario_referencial} 
                                        onChange={handleChange} 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Descripción del Puesto</label>
                                <textarea 
                                    name="descripcion" 
                                    placeholder="Breve descripción de responsabilidades..." 
                                    value={formData.descripcion} 
                                    onChange={handleChange} 
                                    style={textareaStyle} 
                                />
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/puestos" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Puesto
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL INFO --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-info-circle' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Información</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Asignación de Unidad</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Cada puesto debe pertenecer a una <strong>Unidad Organizacional</strong> específica (ej: Puesto "Contador" en la Unidad "Finanzas").
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Salario Referencial</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Este valor es informativo y sirve como base para las ofertas salariales, pero puede variar al contratar a una persona específica.
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Puesto Creado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>El nuevo cargo ha sido registrado exitosamente en el sistema.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}