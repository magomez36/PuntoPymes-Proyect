import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarAuditor from "../../../components/SidebarAuditor"; 
import { apiFetch } from "../../../services/api";

import "../../../assets/css/admin-empresas.css";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC", { dateStyle: 'short', timeStyle: 'short' });
};

// Función para obtener iniciales
const getAvatarInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function ControlAccesosUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [resU, resR] = await Promise.all([
        apiFetch("/api/auditor/accesos/usuarios/"),
        apiFetch("/api/auditor/accesos/roles/"),
      ]);

      const dataU = await resU.json().catch(() => ({}));
      const dataR = await resR.json().catch(() => ({}));

      if (!resU.ok) throw new Error(dataU?.detail || JSON.stringify(dataU));
      if (!resR.ok) throw new Error(dataR?.detail || JSON.stringify(dataR));

      setUsuarios(Array.isArray(dataU?.results) ? dataU.results : []);
      setRoles(Array.isArray(dataR?.results) ? dataR.results : []);
    } catch (e) {
      setErr(e?.message || "Error cargando accesos.");
      setUsuarios([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- ESTILOS ---
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '30px'
  };

  const tableStyles = {
    table: { width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' },
    th: { padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '16px', fontSize: '0.9rem', color: '#111827', verticalAlign: 'middle', borderBottom: '1px solid #f3f4f6' }
  };

  const avatarCircleStyle = {
      width: '36px', 
      height: '36px', 
      borderRadius: '50%', 
      backgroundColor: '#fef2f2', 
      color: '#d51e37',           
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '0.85rem', 
      fontWeight: '700',
      border: '1px solid #fee2e2',
      flexShrink: 0
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const renderEstado = (labelRaw) => {
    const labelStr = String(labelRaw || "").trim().toUpperCase();
    const esActivo = labelStr === "ACTIVO" || labelStr === "ACTIVA";
    return (
        <span style={{
            backgroundColor: esActivo ? '#dcfce7' : '#fee2e2',
            color: esActivo ? '#16a34a' : '#dc2626',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase'
        }}>
            {esActivo ? "ACTIVO" : "INACTIVO"}
        </span>
    );
  };

  // --- ESTILOS TABS (NUEVO) ---
  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '30px'
  };

  const tabStyle = {
    padding: '12px 24px',
    textDecoration: 'none',
    color: '#6b7280',
    fontWeight: '600',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#d51e37',
    borderBottom: '2px solid #d51e37',
    cursor: 'default'
  };

  return (
    <div className="layout-wrapper">
      <SidebarAuditor />
      
      <main className="page-content-wrapper">
        
        {/* HEADER */}
        <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/auditor/inicio" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                    Inicio
                </Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem' }}></i>
                <span style={{ color: '#d51e37', fontWeight: '600', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px' }}>
                    Control de Accesos
                </span>
            </div>
            <h1 className="page-header-title" style={{ fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                Control de Accesos
            </h1>
            <p className="page-header-desc" style={{marginBottom:0}}>
                Gestione usuarios, roles y permisos de seguridad del sistema.
            </p>
        </div>

        {/* --- NAVEGACIÓN TABS --- */}
        <div style={tabContainerStyle}>
            {/* Pestaña Activa: Usuarios */}
            <div style={activeTabStyle}>
                Usuarios y Roles
            </div>
            
            {/* Pestaña Inactiva: Permisos */}
            <Link 
                to="/auditor/accesos/permisos" 
                style={tabStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
                Permisos
            </Link>
        </div>

        {/* CONTENIDO (Ancho 1400px) */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            
            {loading && <div className="loading-box">Cargando datos de seguridad...</div>}
            {err && <div className="error-box"><i className='bx bx-error-circle'></i> {err}</div>}

            {!loading && !err && (
                <>
                    {/* TABLA DE USUARIOS */}
                    <div style={cardStyle}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#eff6ff', color:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <i className='bx bx-user'></i>
                            </div>
                            <h3 style={{ margin:0, fontSize:'1rem', fontWeight:'700', color:'#1e293b' }}>Usuarios del Sistema</h3>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={tableStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={tableStyles.th}>Usuario / Empleado</th>
                                        <th style={tableStyles.th}>Email</th>
                                        <th style={tableStyles.th}>Rol Asignado</th>
                                        <th style={tableStyles.th}>Teléfono</th>
                                        <th style={tableStyles.th}>MFA</th>
                                        <th style={tableStyles.th}>Estado</th>
                                        <th style={tableStyles.th}>Último Acceso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length > 0 ? (
                                        usuarios.map((u) => {
                                            const displayName = u.empleado && u.empleado !== "-" ? u.empleado : u.email;
                                            return (
                                                <tr key={u.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                                    
                                                    {/* Avatar + Nombre */}
                                                    <td style={{...tableStyles.td, padding:'12px 16px'}}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={avatarCircleStyle}>
                                                                {getAvatarInitials(displayName)}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                                    {u.empleado && u.empleado !== "-" ? u.empleado : "Sin Empleado"}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {u.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td style={{...tableStyles.td, color:'#64748b'}}>{u.email}</td>
                                                    
                                                    <td style={tableStyles.td}>
                                                        <span style={{ background:'#f1f5f9', padding:'4px 10px', borderRadius:'6px', fontSize:'0.85rem', fontWeight:'500', color:'#475569', display:'inline-block' }}>
                                                            {u.roles_asignados || "Sin Rol"}
                                                        </span>
                                                    </td>
                                                    <td style={tableStyles.td}>{u.phone || "-"}</td>
                                                    <td style={tableStyles.td}>
                                                        {u.mfa_habilitado_label === "Sí" ? 
                                                            <span style={{color:'#16a34a', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px'}}><i className='bx bx-check-shield'></i> Activo</span> : 
                                                            <span style={{color:'#94a3b8'}}>Inactivo</span>
                                                        }
                                                    </td>
                                                    <td style={tableStyles.td}>{renderEstado(u.estado_label)}</td>
                                                    <td style={{...tableStyles.td, fontSize:'0.85rem', color:'#64748b'}}>{fmtDT(u.ultimo_acceso)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle:'italic' }}>
                                                No se encontraron usuarios registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TABLA DE ROLES */}
                    <div style={{ ...cardStyle }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px' }}>
                             <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#f0fdf4', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <i className='bx bx-badge-check'></i>
                            </div>
                            <h3 style={{ margin:0, fontSize:'1rem', fontWeight:'700', color:'#1e293b' }}>Catálogo de Roles Definidos</h3>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={tableStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={tableStyles.th}>Nombre del Rol</th>
                                        <th style={tableStyles.th}>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.length > 0 ? (
                                        roles.map((r) => (
                                            <tr key={r.id}>
                                                <td style={{...tableStyles.td, fontWeight:'600', width:'250px'}}>{r.nombre}</td>
                                                <td style={{...tableStyles.td, color:'#64748b', whiteSpace:'normal'}}>{r.descripcion || "Sin descripción"}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                                No hay roles definidos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>

      </main>

      <img src={logoWatermark} alt="Logo Fondo" style={watermarkStyle} />
    </div>
  );
}