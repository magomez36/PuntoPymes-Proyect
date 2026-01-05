import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// 1. IMPORTAMOS EL SIDEBAR
import Sidebar from "../../../components/Sidebar";

// 2. REUTILIZAMOS ESTILOS DE EMPRESAS
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000";

const CrearUnidadOrgEmp = () => {
  const navigate = useNavigate();
  
  // Estados
  const [empresas, setEmpresas] = useState([]);
  const [unidadesPadre, setUnidadesPadre] = useState([]); 
  
  const [formData, setFormData] = useState({
    empresa: "",
    unidad_padre: "",
    nombre: "",
    tipo: "3", // Default: Departamento
    ubicacion: "",
  });

  // Opciones para el select de Tipo
  const tiposOrganizacion = [
    { id: "1", label: "Sede / Sucursal" },
    { id: "2", label: "Área / División" },
    { id: "3", label: "Departamento" },
    { id: "4", label: "Equipo / Unidad" },
  ];

  // --- CARGAR EMPRESAS AL INICIO ---
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
                setEmpresas(data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchEmpresas();
  }, [navigate]);

  // --- CARGAR PADRES AL CAMBIAR EMPRESA ---
  useEffect(() => {
    const fetchUnidadesPorEmpresa = async () => {
        if (!formData.empresa) {
            setUnidadesPadre([]);
            return;
        }
        try {
            const token = getAccessToken();
            const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?empresa_id=${formData.empresa}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnidadesPadre(data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchUnidadesPorEmpresa();
  }, [formData.empresa]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "empresa") {
        setFormData(prev => ({ ...prev, empresa: value, unidad_padre: "" }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.empresa) return alert("Seleccione una empresa.");
    if (!formData.nombre.trim()) return alert("El nombre es obligatorio.");

    const payload = {
        empresa: parseInt(formData.empresa, 10),
        unidad_padre: formData.unidad_padre ? parseInt(formData.unidad_padre, 10) : null,
        nombre: formData.nombre,
        tipo: parseInt(formData.tipo, 10),
        ubicacion: formData.ubicacion,
    };

    try {
        const token = getAccessToken();
        const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/`, {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            navigate("/admin/unidades-organizacionales");
        } else {
            const errorData = await res.json().catch(() => ({}));
            alert(errorData?.detail || "Error al crear la unidad.");
        }
    } catch (error) {
        alert("Error de conexión");
    }
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      
      {/* 3. AQUÍ VA EL SIDEBAR */}
      <Sidebar />

      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/unidades-organizacionales" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Unidades Org.</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Unidad</span>
            </nav>
        </header>

        {/* CONTENIDO */}
        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nueva Unidad Organizacional</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define la estructura jerárquica (departamentos, áreas) de la empresa.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* CARD IZQUIERDA: FORMULARIO */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Datos Básicos</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Selector Empresa */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <select name="empresa" value={formData.empresa} onChange={handleChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">Seleccionar Empresa...</option>
                                        {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* Input Nombre */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre de Unidad <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-sitemap' style={iconStyle}></i>
                                    <input type="text" name="nombre" placeholder="Ej. Recursos Humanos" value={formData.nombre} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Jerarquía y Ubicación</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* Selector Padre */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Unidad Padre (Opcional)</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-git-branch' style={iconStyle}></i>
                                    <select name="unidad_padre" value={formData.unidad_padre} onChange={handleChange} disabled={!formData.empresa} style={{ ...inputStyle, appearance: 'none', backgroundColor: formData.empresa ? 'white' : '#f3f4f6', cursor: formData.empresa ? 'pointer' : 'not-allowed' }}>
                                        <option value="">Ninguna (Nivel Raíz)</option>
                                        {unidadesPadre.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* Selector Tipo */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Tipo de Unidad <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-tag-alt' style={iconStyle}></i>
                                    <select name="tipo" value={formData.tipo} onChange={handleChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                        {tiposOrganizacion.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* Input Ubicación */}
                            <div style={{ gridColumn: '1 / -1' }}> 
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Ubicación Física</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-map' style={iconStyle}></i>
                                    <input type="text" name="ubicacion" placeholder="Ej. Edificio A, Piso 2, Oficina 204" value={formData.ubicacion} onChange={handleChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/unidades-organizacionales" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Cancelar</Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Unidad
                            </button>
                        </div>
                    </form>
                </div>

                {/* CARD DERECHA: INFO */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}><i className='bx bx-network-chart' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Ayuda Rápida</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Estructura Jerárquica</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Al seleccionar una <strong>Unidad Padre</strong>, estás creando una sub-unidad. Ejemplo: "Recursos Humanos" (Hijo) dentro de "Gerencia Administrativa" (Padre).
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Selección de Empresa</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Primero elige la empresa. El sistema cargará automáticamente las unidades padre disponibles.
                        </p>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '16px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <i className='bx bx-info-circle' style={{ color: '#dc2626', fontSize: '1.1rem', marginTop: '1px' }}></i>
                            <span>El tipo de unidad define el nivel en el organigrama.</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default CrearUnidadOrgEmp;