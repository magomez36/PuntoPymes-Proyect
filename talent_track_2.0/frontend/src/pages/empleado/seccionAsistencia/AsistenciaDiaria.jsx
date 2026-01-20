import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/SidebarEmpleado"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

const TIPO = {
  1: "Entrada",
  2: "Salida",
  3: "Pausa IN",
  4: "Pausa OUT",
};

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

export default function AsistenciaDiaria() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [obs, setObs] = useState("");
  const [rows, setRows] = useState([]);

  // --- Reloj en tiempo real ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadHoy = async () => {
    setErr("");
    try {
      const res = await apiFetch("/api/empleado/asistencia/hoy/");
      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?._non_json ? "Error de servidor." : JSON.stringify(data || {});
        throw new Error(msg);
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando registros de hoy.");
      setRows([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadHoy();
      setLoading(false);
    })();
  }, []);

  const registrar = async (tipo) => {
    setErr("");
    try {
      const payload = {
        tipo,
        observaciones: obs?.trim() ? obs.trim() : null,
      };

      const res = await apiFetch("/api/empleado/asistencia/registrar/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg = data?._non_json ? "Error de conexión." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      setObs("");
      await loadHoy();
    } catch (e) {
      setErr(e?.message || "No se pudo registrar.");
    }
  };

  // --- FORMATOS ---
  const timeString = currentTime.toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString("es-EC", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const fmtHoraTabla = (iso) => {
      if(!iso) return "--:--";
      return new Date(iso).toLocaleTimeString("es-EC", { hour: '2-digit', minute: '2-digit' });
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = {
    display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%',
  };

  const mainAreaStyle = {
    flex: 1,
    padding: '30px 30px 30px 110px', 
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: '30px'
  };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      
      <main style={mainAreaStyle}>
        
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Mi Reloj</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Gestiona tu asistencia diaria.</p>
            </div>
            <Link to="/empleado/inicio" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* --- CARD RELOJ Y ACCIONES --- */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center' }}>
            
            {/* Reloj Digital */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: 'monospace', letterSpacing: '-2px' }}>
                    {timeString}
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '5px', textTransform: 'capitalize' }}>
                    {dateString}
                </p>
            </div>

            {/* Input Observación */}
            <div style={{ maxWidth: '500px', margin: '0 auto 30px auto' }}>
                <div style={{ position: 'relative' }}>
                    <i className='bx bx-pencil' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                    <input
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        placeholder="Añadir observación (opcional)..."
                        style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    />
                </div>
            </div>

            {/* BOTONES CON NUEVOS ICONOS */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* ENTRADA: Play Circle */}
                <button 
                    onClick={() => registrar(1)}
                    style={{ 
                        padding: '15px 40px', borderRadius: '12px', border: 'none', 
                        backgroundColor: '#0f172a', color: 'white', fontWeight: '700', fontSize: '1rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: '0 4px 15px rgba(15, 23, 42, 0.3)', transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <i className='bx bx-play-circle' style={{ fontSize: '1.6rem' }}></i> MARCAR ENTRADA
                </button>

                {/* SALIDA: Stop Circle */}
                <button 
                    onClick={() => registrar(2)}
                    style={{ 
                        padding: '15px 40px', borderRadius: '12px', border: 'none', 
                        backgroundColor: '#D51F36', color: 'white', fontWeight: '700', fontSize: '1rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: '0 4px 15px rgba(213, 31, 54, 0.3)', transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <i className='bx bx-stop-circle' style={{ fontSize: '1.6rem' }}></i> MARCAR SALIDA
                </button>
            </div>

            {err && <p style={{ color: "#D51F36", marginTop: '20px', fontWeight: '600' }}>{err}</p>}
        </div>

        {/* --- TABLA DE REGISTROS DEL DÍA --- */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Historial del Día</h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tipo</th>
                            <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Hora</th>
                            <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fuente</th>
                            <th style={{ padding: '15px 25px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Observación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Cargando registros...</td></tr>}
                        
                        {!loading && rows.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No has registrado actividad hoy.</td></tr>
                        )}

                        {!loading && rows.map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '15px 25px' }}>
                                    {/* Ajuste de colores en badges para coincidir con la imagen */}
                                    <span style={{ 
                                        backgroundColor: r.tipo === 1 ? '#e0f2fe' : r.tipo === 2 ? '#fef2f2' : '#f3f4f6',
                                        color: r.tipo === 1 ? '#0284c7' : r.tipo === 2 ? '#D51F36' : '#4b5563', // Azul fuerte y Rojo fuerte
                                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase'
                                    }}>
                                        {r.tipo_label || TIPO[r.tipo]}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 25px', color: '#1e293b', fontWeight: '600', fontSize: '0.95rem' }}>
                                    {fmtHoraTabla(r.registrado_el)}
                                </td>
                                <td style={{ padding: '15px 25px', color: '#64748b', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <i className='bx bx-devices'></i> {r.fuente_label || r.fuente}
                                    </div>
                                </td>
                                <td style={{ padding: '15px 25px', color: '#64748b', fontSize: '0.9rem', fontStyle: r.observaciones ? 'normal' : 'italic' }}>
                                    {r.observaciones || "Sin observaciones"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </main>
    </div>
  );
}