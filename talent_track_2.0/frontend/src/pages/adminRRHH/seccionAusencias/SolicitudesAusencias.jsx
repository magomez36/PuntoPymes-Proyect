import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC", { dateStyle: 'medium', timeStyle: 'short' });
};

export default function SolicitudesAusencias() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/ausencias/solicitudes/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Error cargando solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : "";
    const a = apellido ? apellido.charAt(0).toUpperCase() : "";
    return n + a;
  };

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
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Solicitudes de Ausencias</h1>
            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1.05rem' }}>Gestión de permisos, vacaciones y justificaciones pendientes.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={load}
              style={{ backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className='bx bx-refresh'></i> Actualizar
            </button>
            <button 
              onClick={() => navigate("/rrhh/ausencias/aprobaciones")}
              style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
            >
              Historial de Aprobaciones
            </button>
          </div>
        </div>

        {/* Card de Tabla */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', padding: '35px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ position: 'relative' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Buscar por colaborador..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '12px 20px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '320px', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando solicitudes...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Colaborador</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Tipo</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Periodo</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Días</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => (r.nombres + r.apellidos).toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                    <tr key={r.id} style={{ transition: 'all 0.2s' }}>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#475569', border: '1px solid #e2e8f0' }}>
                            {getInitials(r.nombres, r.apellidos)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{r.nombres} {r.apellidos}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: '#475569', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                        {r.tipo_ausencia}
                      </td>
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span><strong>Desde:</strong> {fmtDate(r.fecha_inicio)}</span>
                          <span><strong>Hasta:</strong> {fmtDate(r.fecha_fin)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                        {r.dias_habiles}
                      </td>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                          {r.estado_label}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <button 
                          onClick={() => navigate(`/rrhh/ausencias/solicitudes/${r.id}`)} 
                          style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', color: '#3b82f6', fontWeight: '600', fontSize: '0.85rem' }}
                        >
                          Revisar Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No hay solicitudes pendientes de revisión.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '20px' }}>
            <Link to="/rrhh/inicio" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='bx bx-left-arrow-alt'></i> Volver al panel principal
            </Link>
        </div>
      </main>
    </div>
  );
}