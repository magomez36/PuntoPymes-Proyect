import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar"; 
import logoWatermark from "../../../assets/img/talentrack_small.svg";

export default function LogsAuditoriaSuperAdmin() {
  // --- ESTADOS ---
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [usuariosOptions, setUsuariosOptions] = useState([]); // Antes usuariosToggle
  const [usuarioEmail, setUsuarioEmail] = useState("");

  const [fecha, setFecha] = useState(""); 
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- LÓGICA DE CARGA ---
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (empresaId) params.append("empresa_id", empresaId);
    if (usuarioEmail) params.append("usuario_email", usuarioEmail);
    if (fecha) params.append("fecha", fecha);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const loadEmpresas = async () => {
    try {
      const res = await apiFetch("/api/empresas/"); 
      if (!res.ok) return;
      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  const loadUsuarios = async (empresaIdValue) => {
    try {
      const qs = empresaIdValue ? `?empresa_id=${empresaIdValue}` : "";
      const res = await apiFetch(`/api/auditoria/superadmin/helpers/usuarios/${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsuariosOptions(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/auditoria/superadmin/logs/${buildQuery()}`);
      if (!res.ok) {
        const t = await res.text();
        setError(t || "No se pudo cargar logs.");
        setLogs([]);
        return;
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Error de red al cargar logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    loadEmpresas();
    loadUsuarios("");
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUsuarioEmail(""); // Reset usuario si cambia la empresa
    loadUsuarios(empresaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, usuarioEmail, fecha]);

  const empresaOptions = useMemo(() => {
    return empresas.map((e) => ({
      id: e.id,
      label: e.razon_social || e.nombre_comercial || `Empresa #${e.id}`,
    }));
  }, [empresas]);

  // --- ESTILOS DE LAYOUT ---
  const layoutWrapperStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    width: '100%',
  };

  const mainAreaStyle = {
    flex: 1,
    paddingLeft: '110px', 
    paddingRight: '40px',
    paddingTop: '40px',
    paddingBottom: '40px',
    position: 'relative',
    zIndex: 1,
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px',
    opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  // Estilo input unificado
  const inputStyle = {
    width: '100%', 
    padding: '10px 12px', 
    borderRadius: '8px', 
    border: '1px solid #d1d5db', 
    outline: 'none', 
    color: '#1f2937',
    fontSize: '0.9rem',
    backgroundColor: '#fff'
  };

  const labelStyle = {
    display: 'block', 
    fontSize: '0.8rem', 
    fontWeight: '700', 
    color: '#374151', 
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div style={layoutWrapperStyle}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />

      <main style={mainAreaStyle}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
            Trazabilidad Global
          </h1>
          <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1rem' }}>
            Auditoría técnica y evidencia de actividad en todas las empresas.
          </p>
        </div>

        {/* Card de Filtros UNIFICADA Y LIMPIA */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                
                {/* 1. Filtro Empresa */}
                <div>
                    <label style={labelStyle}>Empresa</label>
                    <select
                        value={empresaId}
                        onChange={(e) => setEmpresaId(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">Todas las empresas</option>
                        {empresaOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Filtro Usuario (Dropdown en lugar de botones) */}
                <div>
                    <label style={labelStyle}>Usuario</label>
                    <select
                        value={usuarioEmail}
                        onChange={(e) => setUsuarioEmail(e.target.value)}
                        style={inputStyle}
                        disabled={usuariosOptions.length === 0}
                    >
                        <option value="">Todos los usuarios</option>
                        {usuariosOptions.map((u) => (
                            <option key={u.email} value={u.email}>
                                {u.email}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Filtro Fecha */}
                <div>
                    <label style={labelStyle}>Fecha</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Botón Limpiar */}
                <div>
                    <button
                        onClick={() => { setEmpresaId(""); setUsuarioEmail(""); setFecha(""); }}
                        style={{ 
                            width: '100%',
                            padding: '10px', 
                            backgroundColor: '#f3f4f6', 
                            color: '#4b5563', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    >
                        <i className='bx bx-eraser' style={{ marginRight:'5px' }}></i> Limpiar
                    </button>
                </div>
            </div>
        </div>

        {error && (
            <div style={{ marginBottom: 20, color: 'white', background: '#ef4444', padding: '15px', borderRadius: '8px', fontWeight: '500', display:'flex', alignItems:'center', gap:'10px' }}>
                <i className='bx bx-error-circle'></i> {error}
            </div>
        )}

        {/* Tabla de Logs */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', padding: '30px', border: '1px solid #f1f5f9' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Registro Detallado</h3>
                <div style={{ fontSize:'0.85rem', color:'#94a3b8' }}>
                    Mostrando últimos {logs.length} eventos
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                    <p>Cargando registros...</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '0 15px 15px 15px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Acción</th>
                                <th style={{ padding: '0 15px 15px 15px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Usuario</th>
                                <th style={{ padding: '0 15px 15px 15px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Objetivo</th>
                                <th style={{ padding: '0 15px 15px 15px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Fecha</th>
                                <th style={{ padding: '0 15px 15px 15px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>IP</th>
                                <th style={{ padding: '0 15px 15px 15px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Empresa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: '40px', color: '#94a3b8' }}>
                                        No se encontraron eventos con los filtros actuales.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((row) => (
                                    <tr key={row.id} style={{ transition: 'all 0.2s' }}>
                                        <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontWeight: '600' }}>
                                            {row.accion}
                                        </td>
                                        <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#4b5563', fontSize: '0.9rem' }}>
                                            {row.usuario}
                                        </td>
                                        <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#6b7280', fontSize: '0.85rem' }}>
                                            {row.entidad} <span style={{ opacity: 0.6 }}>#{row.entidad_id}</span>
                                        </td>
                                        <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#4b5563', fontFamily: 'monospace' }}>
                                            {row.fecha} <span style={{ color: '#9ca3af', marginLeft: '5px' }}>{row.hora}</span>
                                        </td>
                                        <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#6b7280', fontSize: '0.85rem' }}>
                                            {row.ip}
                                        </td>
                                        <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                            <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#374151', fontWeight: '600' }}>
                                                {row.empresa_razon_social || `ID ${row.empresa_id}`}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}