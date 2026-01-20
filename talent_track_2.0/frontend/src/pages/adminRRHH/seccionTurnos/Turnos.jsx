import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

export default function Turnos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/turnos/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Error cargando turnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar turno? (esto también elimina contratos relacionados)")) return;
    try {
      const res = await apiFetch(`/api/rrhh/turnos/${id}/`, { method: "DELETE" });
      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: está siendo usado.");
        return;
      }
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert("Error eliminando.");
    }
  };

  const siNoBadge = (b) => (
    <span style={{ 
      color: b ? '#166534' : '#64748b', 
      backgroundColor: b ? '#dcfce7' : '#f1f5f9',
      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
    }}>
      {b ? "SÍ" : "NO"}
    </span>
  );

  // --- Estilos de Layout Uniformes ---
  const mainAreaStyle = {
    flex: 1,
    paddingLeft: '110px', 
    paddingRight: '40px',
    paddingTop: '40px',
    paddingBottom: '40px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    position: 'relative'
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px',
    opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />
      
      <main style={mainAreaStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Gestión de Turnos</h1>
            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1.05rem' }}>Configuración de horarios laborales y requisitos de asistencia.</p>
          </div>
          <button 
            onClick={() => navigate("/rrhh/turnos/crear")}
            style={{ 
              backgroundColor: '#d51e37', color: 'white', border: 'none', 
              padding: '14px 28px', borderRadius: '12px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 10px 15px -3px rgba(213, 30, 55, 0.2)'
            }}
          >
            <i className='bx bx-plus' style={{ fontSize: '1.2rem' }}></i> Crear Turno
          </button>
        </div>

        {/* Card de Tabla */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', padding: '35px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ position: 'relative' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Buscar turno..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '12px 20px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '320px', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando turnos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Nombre</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Horario</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Días</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>GPS</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Foto</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                    <tr key={r.id} style={{ transition: 'all 0.2s' }}>
                      <td style={{ padding: '15px', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.nombre}</td>
                      <td style={{ padding: '15px', color: '#15803d', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                        {r.hora_inicio} - {r.hora_fin}
                      </td>
                      <td style={{ padding: '15px', color: '#475569', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                        {r.dias_semana_label}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        {siNoBadge(r.requiere_gps)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        {siNoBadge(r.requiere_foto)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => navigate(`/rrhh/turnos/editar/${r.id}`)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#3b82f6' }}>
                            <i className='bx bx-pencil' style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button onClick={() => eliminar(r.id)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' }}>
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
        <div style={{ marginTop: '20px' }}>
            <Link to="/rrhh/inicio" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='bx bx-left-arrow-alt'></i> Volver al inicio
            </Link>
        </div>
      </main>
    </div>
  );
}