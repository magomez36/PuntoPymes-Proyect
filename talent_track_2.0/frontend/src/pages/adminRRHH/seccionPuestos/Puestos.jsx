import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

export default function Puestos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/puestos/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Error cargando puestos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setShowConfirmModal(true);
  };

  // --- Utilidades de Formato ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getLevelBadge = (level) => {
    const l = level?.toUpperCase() || "N/A";
    let bg = "#f1f5f9";
    let color = "#475569";
    
    if (l === 'ESTRATÉGICO') { bg = "#e0e7ff"; color = "#4338ca"; }
    else if (l === 'TÁCTICO') { bg = "#fef9c3"; color = "#854d0e"; }
    else if (l === 'OPERATIVO') { bg = "#dcfce7"; color = "#166534"; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, padding: '4px 12px', 
        borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px' 
      }}>
        {l}
      </span>
    );
  };

  // --- Estilos de Layout ---
  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    width: '100%'
  };

  const mainContentStyle = {
    flex: 1,
    padding: '40px 60px 40px 110px', // El 110px asegura que nada quede tras el Sidebar
    position: 'relative',
    zIndex: 1
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', 
    opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />
      
      <main style={mainContentStyle}>
        
        {/* Header de Página */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Gestión de Puestos</h1>
            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1.1rem' }}>Estructura de cargos y rangos salariales.</p>
          </div>
          <button 
            onClick={() => navigate("/rrhh/puestos/crear")}
            style={{ 
              backgroundColor: '#d51e37', color: 'white', border: 'none', 
              padding: '14px 28px', borderRadius: '12px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 10px 15px -3px rgba(213, 30, 55, 0.2)'
            }}
          >
            <i className='bx bx-plus' style={{ fontSize: '1.2rem' }}></i> Crear Puesto
          </button>
        </div>

        {/* Card de Tabla */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', padding: '35px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ position: 'relative' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '12px 20px 12px 45px', borderRadius: '12px', 
                  border: '1px solid #e2e8f0', width: '320px', outline: 'none',
                  fontSize: '0.95rem', backgroundColor: '#fcfcfd'
                }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando datos...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Nombre del Puesto</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Unidad</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Nivel</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Salario</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                    <tr key={r.id} style={{ transition: 'all 0.2s' }}>
                      <td style={{ padding: '20px 15px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.nombre}</td>
                      <td style={{ padding: '20px 15px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                           <i className='bx bx-building-house' style={{ color:'#94a3b8' }}></i>
                           {r.unidad_nombre || "General"}
                        </div>
                      </td>
                      <td style={{ padding: '20px 15px', borderBottom: '1px solid #f1f5f9' }}>
                        {getLevelBadge(r.nivel)}
                      </td>
                      <td style={{ padding: '20px 15px', color: '#059669', fontWeight: '800', fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9' }}>
                        {formatCurrency(r.salario_referencial)}
                      </td>
                      <td style={{ padding: '20px 15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => navigate(`/rrhh/puestos/editar/${r.id}`)}
                            style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#3b82f6' }}
                          >
                            <i className='bx bx-pencil' style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button 
                            onClick={() => openDeleteModal(r.id)}
                            style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' }}
                          >
                            <i className='bx bx-trash' style={{ fontSize: '1.2rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}