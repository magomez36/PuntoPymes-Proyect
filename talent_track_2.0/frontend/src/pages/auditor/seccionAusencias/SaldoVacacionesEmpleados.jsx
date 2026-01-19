import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

export default function SaldosVacaciones() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      // Endpoint simulado basado en la estructura de tu API
      const res = await apiFetch("/api/auditor/ausencias/saldos-vacaciones/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando saldos de vacaciones.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getInitials = (name, surname) => {
    const n = name ? name.charAt(0).toUpperCase() : '';
    const s = surname ? surname.charAt(0).toUpperCase() : '';
    return n + s;
  };

  // --- Estilos Consistentes ---
  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const cardBaseStyle = {
    backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '25px', position: 'relative', zIndex: 1
  };

  const tableHeaderStyle = {
    textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #f1f5f9',
    color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase'
  };

  const tableCellStyle = {
    padding: '14px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem'
  };

  const tabsContainerStyle = {
    display: 'flex', gap: '30px', borderBottom: '1px solid #e2e8f0', marginBottom: '25px', marginTop: '25px'
  };

  const tabItemStyle = {
    padding: '10px 0 15px 0', fontSize: '0.95rem', fontWeight: '600', color: '#64748b', cursor: 'pointer',
    borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px'
  };

  const activeTabItemStyle = { ...tabItemStyle, color: '#d51e37', borderBottom: '2px solid #d51e37' };

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Auditoría &gt; Ausencias</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Gestión de Ausencias</h2>
        </div>

        <div style={tabsContainerStyle}>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/ausencias/solicitudes")}>
                <i className='bx bx-file'></i> Solicitudes
            </div>
            <div style={tabItemStyle} onClick={() => navigate("/auditor/ausencias/aprobaciones")}>
                <i className='bx bx-check-shield'></i> Aprobaciones
            </div>
            <div style={activeTabItemStyle}>
                <i className='bx bx-wallet'></i> Saldos Vacaciones
            </div>
        </div>

        {!loading && (
            <div style={cardBaseStyle}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Saldos Disponibles por Empleado</h3>
                    <input 
                        type="text" placeholder="Buscar empleado..." 
                        style={{ padding:'8px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', outline:'none' }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Empleado</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Días Ganados</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Días Usados</th>
                            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Saldo Actual</th>
                            <th style={tableHeaderStyle}>Progreso de Uso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.filter(r => r.nombres.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => {
                            const pct = Math.min((r.dias_usados / r.dias_ganados) * 100, 100) || 0;
                            return (
                                <tr key={r.id}>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                {getInitials(r.nombres, r.apellidos)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{r.nombres} {r.apellidos}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ ...tableCellStyle, textAlign: 'center', fontWeight: '600' }}>{r.dias_ganados}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'center', color: '#b91c1c', fontWeight: '600' }}>{r.dias_usados}</td>
                                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '15px', fontWeight: '800' }}>
                                            {r.dias_disponibles} días
                                        </span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ width: '150px' }}>
                                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', background: '#d51e37' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{Math.round(pct)}% consumido</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </main>
    </div>
  );
}