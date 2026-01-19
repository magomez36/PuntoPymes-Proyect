import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

export default function Empleados() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/auditor/expedientes/empleados/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando empleados.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = rows.filter(r => 
    r.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name, surname) => {
    const n = name ? name.charAt(0).toUpperCase() : '';
    const s = surname ? surname.charAt(0).toUpperCase() : '';
    return n + s;
  };

  // --- Estilos ---

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '20px',
    marginTop: '20px',
    overflowX: 'auto',
    maxWidth: '95%', 
    margin: '20px auto',
    position: 'relative', 
    zIndex: 1 
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0', 
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginRight: '15px',
    textTransform: 'uppercase'
  };

  const tableHeaderStyle = {
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #f1f5f9',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tableCellStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    fontSize: '0.9rem',
    verticalAlign: 'middle'
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  // --- MODIFICACIÓN DE ESTADO ---
  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : "DESCONOCIDO";
    
    // Configuración de colores (Fondo suave / Texto intenso)
    let bg = '#f1f5f9';     // Gris claro por defecto
    let color = '#475569';  // Gris oscuro por defecto

    if (s === 'ACTIVO' || s === 'ALTA') { 
        bg = '#dcfce7';     // Verde muy suave
        color = '#15803d';  // Verde fuerte (oscuro para leerse bien)
    }
    else if (s === 'INACTIVO' || s === 'BAJA') { 
        bg = '#fee2e2';     // Rojo muy suave
        color = '#b91c1c';  // Rojo fuerte
    }
    else if (s === 'VACACIONES') { 
        bg = '#fef9c3';     // Amarillo suave
        color = '#a16207';  // Ocre fuerte
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: color, 
        padding: '6px 12px',      // Un poco más de espacio interno
        borderRadius: '20px', 
        fontSize: '0.75rem', 
        fontWeight: '800',        // Negrita extra fuerte
        textTransform: 'uppercase',
        letterSpacing: '0.5px',   // Espaciado para mejorar lectura en negrita
        border: `1px solid ${bg}`, // Borde sutil del mismo color que el fondo para definición
        display: 'inline-block'
      }}>
        {s}
      </span>
    );
  };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh' }}>
      <Sidebar />
      
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Encabezado */}
        <div style={{ maxWidth: '95%', margin: '0 auto 20px auto' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Inicio &gt; Expedientes
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Expedientes de Empleados
            </h2>
            <p style={{ color: '#64748b', margin: '5px 0 0' }}>
                Gestión y visualización de legajos del personal.
            </p>
        </div>

        {/* Buscador */}
        <div style={{ ...cardStyle, padding: '15px', marginTop: '0', display:'flex', gap:'10px', marginBottom: '20px' }}>
            <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%', maxWidth: '400px', padding: '10px 15px', 
                    border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none'
                }}
            />
        </div>

        {!loading && (
          <div style={cardStyle}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Empleado</th>
                  <th style={tableHeaderStyle}>Unidad / Puesto</th>
                  <th style={tableHeaderStyle}>Contacto</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Estado</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>
                    <i className='bx bx-code-alt'></i> Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                    
                    <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={avatarStyle}>
                            {getInitials(r.nombres, r.apellidos)}
                          </div>
                          <div style={{ fontWeight: '600' }}>{r.nombres} {r.apellidos}</div>
                        </div>
                    </td>

                    <td style={tableCellStyle}>
                        <div style={{fontWeight:'500'}}>{r.unidad_nombre || "N/A"}</div>
                        <div style={{fontSize:'0.8rem', color:'#64748b'}}>{r.puesto_nombre || "N/A"}</div>
                    </td>

                    <td style={tableCellStyle}>
                        <div>{r.email}</div>
                        <div style={{fontSize:'0.8rem', color:'#64748b'}}>{r.direccion || "Sin dirección"}</div>
                    </td>

                    {/* Estado centrado con negrita y color */}
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                        {getStatusBadge(r.estado_label)}
                    </td>

                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                        <button 
                            onClick={() => navigate(`/auditor/expedientes/empleados/${r.id}`)}
                            style={{ 
                                border: '1px solid #e2e8f0', 
                                background: '#fff', 
                                cursor: 'pointer', 
                                color: '#d51e37', 
                                fontSize: '1.2rem', 
                                padding: '8px', 
                                borderRadius: '8px', 
                                transition: 'all 0.2s', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#d51e37'; 
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff';
                                e.currentTarget.style.borderColor = '#e2e8f0'; 
                            }}
                            title="Ver Expediente Completo"
                        >
                            <i className='bx bx-show'></i>
                        </button>
                    </td>

                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className='bx bx-search' style={{fontSize:'2rem', marginBottom:'10px'}}></i>
                        <p>No se encontraron empleados registrados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}