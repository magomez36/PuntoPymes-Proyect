import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

const ESTADO = { 1: "Activo", 2: "Suspendido", 3: "Baja" };

function fmtDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Empleados() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/empleados/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Error cargando empleados.");
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

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      const res = await apiFetch(`/api/rrhh/empleados/${idToDelete}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error");
      await load();
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (e) {
      alert("Error eliminando.");
    }
  };

  // --- Estilos de Layout ---
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

  const renderEstadoBadge = (estadoCode, estadoLabel) => {
    const label = ESTADO[estadoCode] || estadoLabel || "N/A";
    let bg = label.toLowerCase() === "activo" ? "#dcfce7" : "#fee2e2";
    let color = label.toLowerCase() === "activo" ? "#166534" : "#b91c1c";
    return (
      <span style={{ backgroundColor: bg, color: color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />
      
      <main style={mainAreaStyle}>
        {/* Header similar a la imagen */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Directorio de Empleados</h1>
            <p style={{ color: '#64748b', marginTop: '5px', fontSize: '1.05rem' }}>Gestión integral de colaboradores y perfiles.</p>
          </div>
          <button 
            onClick={() => navigate("/rrhh/empleados/crear")}
            style={{ backgroundColor: '#d51e37', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <i className='bx bx-user-plus'></i> Crear Empleado
          </button>
        </div>

        {/* Card de Tabla Estilo Profesional */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', padding: '35px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ position: 'relative' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '12px 20px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '320px', outline: 'none', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Cargando datos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Colaborador</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Puesto</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Área</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Ingreso</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Estado</th>
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
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{r.puesto_nombre || "-"}</td>
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{r.unidad_nombre || "-"}</td>
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>{fmtDate(r.fecha_ingreso)}</td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        {renderEstadoBadge(r.estado, r.estado_label)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => navigate(`/rrhh/empleados/editar/${r.id}`)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#3b82f6' }}>
                            <i className='bx bx-pencil'></i>
                          </button>
                          <button onClick={() => { setIdToDelete(r.id); setShowConfirmModal(true); }} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' }}>
                            <i className='bx bx-trash'></i>
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

      {/* Aquí reinsertarías los componentes de Modal si los necesitas */}
    </div>
  );
}