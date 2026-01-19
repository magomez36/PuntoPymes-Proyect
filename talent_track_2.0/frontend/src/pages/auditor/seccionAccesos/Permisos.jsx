import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Quitamos useNavigate ya que usaremos Links en los tabs
import SidebarAuditor from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";

// Estilos globales
import "../../../assets/css/admin-empresas.css";

// Logo Marca de Agua
import logoWatermark from "../../../assets/img/talentrack_small.svg";

export default function Permisos() {
  // const navigate = useNavigate(); // Ya no es necesario
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/accesos/permisos/");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setErr(e?.message || "Error cargando permisos.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- ESTILOS AUXILIARES ---
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

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  // --- ESTILOS PARA LOS TABS ---
  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '30px'
  };

  const tabStyle = {
    padding: '12px 24px',
    textDecoration: 'none',
    color: '#6b7280', // Gris por defecto
    fontWeight: '600',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#d51e37', // Rojo corporativo
    borderBottom: '2px solid #d51e37', // Borde rojo inferior
    cursor: 'default'
  };

  return (
    <div className="layout-wrapper">
      
      <SidebarAuditor />
      
      <main className="page-content-wrapper">
        
        {/* === HEADER PRINCIPAL === */}
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

        {/* === NAVEGACIÓN DE PESTAÑAS (TABS) === */}
        <div style={tabContainerStyle}>
            {/* Pestaña Inactiva: Enlace a Usuarios */}
            <Link 
                to="/auditor/accesos/usuarios" 
                style={tabStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
                Usuarios y Roles
            </Link>
            
            {/* Pestaña Activa: Permisos */}
            <div style={activeTabStyle}>
                Permisos
            </div>
        </div>

        {/* CONTENIDO CENTRADO */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            
            {loading && <div className="loading-box">Cargando permisos...</div>}
            {err && <div className="error-box"><i className='bx bx-error-circle'></i> {err}</div>}

            {!loading && !err && (
                <div style={cardStyle}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#fef2f2', color:'#d51e37', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className='bx bx-key'></i>
                        </div>
                        <h3 style={{ margin:0, fontSize:'1rem', fontWeight:'700', color:'#1e293b' }}>Catálogo de Permisos</h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th style={tableStyles.th}>Código Interno</th>
                                    <th style={tableStyles.th}>Descripción Funcional</th>
                                    <th style={tableStyles.th}>Rol Asociado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((p) => (
                                        <tr key={p.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                            <td style={{...tableStyles.td, fontWeight:'600', color:'#1e293b', fontFamily:'monospace', fontSize:'0.85rem'}}>
                                                {p.codigo}
                                            </td>
                                            <td style={{...tableStyles.td, color:'#64748b', whiteSpace:'normal', maxWidth:'400px'}}>
                                                {p.descripcion || "Sin descripción disponible"}
                                            </td>
                                            <td style={tableStyles.td}>
                                                {p.rol ? (
                                                    <span style={{ background:'#f1f5f9', padding:'4px 10px', borderRadius:'6px', fontSize:'0.8rem', fontWeight:'600', color:'#475569', display:'inline-block' }}>
                                                        <i className='bx bxs-user-badge' style={{marginRight:'4px'}}></i>
                                                        {p.rol}
                                                    </span>
                                                ) : (
                                                    <span style={{ color:'#94a3b8', fontStyle:'italic' }}>Global / Todos</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle:'italic' }}>
                                            No existen permisos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

      </main>

      {/* MARCA DE AGUA */}
      <img src={logoWatermark} alt="Logo Fondo" style={watermarkStyle} />
    </div>
  );
}