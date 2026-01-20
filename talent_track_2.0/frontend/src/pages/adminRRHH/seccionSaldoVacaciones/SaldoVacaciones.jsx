import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; 

// --- HELPERS ---
// Función para quitar decimales innecesarios (15.00 -> 15, pero 15.5 -> 15.5)
const fmtNum = (val) => {
    if (val === null || val === undefined) return "0";
    return Number(val); 
};

export default function SaldoVacaciones() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); 

  const [modalConfig, setModalConfig] = useState({ show: false, type: '', title: '', message: '', action: null });
  const [editModal, setEditModal] = useState({ show: false, row: null, nuevoPeriodo: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/vacaciones/saldos/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "No se pudo cargar saldos.");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      showModal('error', 'Error', e?.message || "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
      const s = q.toLowerCase();
      if (!s) return rows;
      return rows.filter(r => 
          (r.empleado_nombres + " " + r.empleado_apellidos).toLowerCase().includes(s) ||
          (r.empleado_email || "").toLowerCase().includes(s)
      );
  }, [rows, q]);

  const showModal = (type, title, message, action = null) => {
      setModalConfig({ show: true, type, title, message, action });
  };
  
  const closeModal = () => setModalConfig({ ...modalConfig, show: false });

  const openEdit = (row) => {
      setEditModal({ show: true, row, nuevoPeriodo: row.periodo });
  };

  const saveEdit = async (e) => {
      e.preventDefault();
      const periodo = editModal.nuevoPeriodo.trim();
      if (!periodo) return alert("El periodo es obligatorio"); 

      try {
          const res = await apiFetch(`/api/rrhh/vacaciones/saldos/${editModal.row.id}/`, {
            method: "PATCH",
            body: JSON.stringify({ periodo }),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(out?.detail || "Error al actualizar.");
          
          await load();
          setEditModal({ show: false, row: null, nuevoPeriodo: "" });
          showModal('success', 'Actualizado', 'El periodo ha sido modificado correctamente.');
      } catch (e) {
          showModal('error', 'Error', e.message);
      }
  };

  const requestDelete = (id) => {
      showModal('confirm', '¿Eliminar Saldo?', 'Esta acción borrará el registro de saldo para este empleado. ¿Estás seguro?', () => executeDelete(id));
  };

  const executeDelete = async (id) => {
      try {
          const res = await apiFetch(`/api/rrhh/vacaciones/saldos/${id}/`, { method: "DELETE" });
          if (!res.ok) {
            const out = await res.json().catch(() => ({}));
            throw new Error(out?.detail || "No se pudo eliminar.");
          }
          await load();
          showModal('success', 'Eliminado', 'El registro ha sido eliminado.');
      } catch (e) {
          showModal('error', 'Error', e.message);
      }
  };

  const getBalanceStyle = (dias) => {
      if (dias >= 15) return { color: '#166534', bg: '#dcfce7' }; 
      if (dias >= 5) return { color: '#0f172a', bg: '#f1f5f9' }; 
      return { color: '#991b1b', bg: '#fee2e2' }; 
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' };
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Saldos de Vacaciones</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Administra los días disponibles por periodo.</p>
            </div>
            
            <button 
                onClick={() => navigate("/rrhh/vacaciones/saldos/crear")}
                style={{ 
                    padding: '12px 24px', backgroundColor: '#D51F36', color: 'white', 
                    border: 'none', borderRadius: '10px', fontWeight: '600', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(213, 31, 54, 0.2)'
                }}
            >
                <i className='bx bx-plus-circle' style={{ fontSize:'1.2rem' }}></i> Asignar Nuevo Saldo
            </button>
        </div>

        {/* CARD PRINCIPAL */}
        <div style={cardStyle}>
            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}></i>
                    <input 
                        placeholder="Buscar por empleado..." 
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Empleado</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Periodo</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Asignados</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tomados</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Disponible</th>
                            <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Cargando saldos...</td></tr>}
                        
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No se encontraron registros.</td></tr>
                        )}

                        {!loading && filtered.map((r) => {
                            const badgeStyle = getBalanceStyle(r.dias_disponibles);
                            return (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor='#fcfcfc'} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor='white'}>
                                    
                                    <td style={{ padding: '15px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                                                {r.empleado_nombres?.charAt(0)}{r.empleado_apellidos?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{r.empleado_nombres} {r.empleado_apellidos}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.empleado_email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>
                                        {r.periodo}
                                    </td>

                                    {/* APLICANDO fmtNum PARA QUITAR DECIMALES */}
                                    <td style={{ padding: '15px 20px', textAlign: 'center', color: '#64748b' }}>
                                        {fmtNum(r.dias_asignados)}
                                    </td>

                                    <td style={{ padding: '15px 20px', textAlign: 'center', color: '#64748b' }}>
                                        {fmtNum(r.dias_tomados)}
                                    </td>

                                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                        <span style={{ 
                                            backgroundColor: badgeStyle.bg, color: badgeStyle.color,
                                            padding: '4px 10px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem'
                                        }}>
                                            {fmtNum(r.dias_disponibles)}
                                        </span>
                                    </td>

                                    <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={() => openEdit(r)}
                                                style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#0ea5e9' }}
                                                title="Editar Periodo"
                                            >
                                                <i className='bx bx-edit-alt' style={{ fontSize: '1.2rem' }}></i>
                                            </button>
                                            <button 
                                                onClick={() => requestDelete(r.id)}
                                                style={{ border: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
                                                title="Eliminar Saldo"
                                            >
                                                <i className='bx bx-trash' style={{ fontSize: '1.2rem' }}></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MODAL DE CONFIRMACIÓN */}
        {modalConfig.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        backgroundColor: modalConfig.type === 'confirm' ? '#fef3c7' : modalConfig.type === 'error' ? '#fee2e2' : '#dcfce7', 
                        color: modalConfig.type === 'confirm' ? '#d97706' : modalConfig.type === 'error' ? '#dc2626' : '#16a34a', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <i className={`bx ${modalConfig.type === 'confirm' ? 'bx-question-mark' : modalConfig.type === 'error' ? 'bx-x' : 'bx-check'}`} style={{ fontSize: '48px' }}></i>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{modalConfig.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>{modalConfig.message}</p>
                    
                    {modalConfig.type === 'confirm' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={closeModal} style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                            <button 
                                onClick={() => { modalConfig.action(); closeModal(); }} 
                                style={{ flex: 1, padding: '12px', backgroundColor: '#dc2626', border: 'none', color: 'white', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    ) : (
                        <button onClick={closeModal} style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Entendido</button>
                    )}
                </div>
            </div>
        )}

        {/* MODAL DE EDICIÓN */}
        {editModal.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>Editar Periodo</h3>
                    <form onSubmit={saveEdit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Nombre del Empleado</label>
                            <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#334155', fontSize: '0.95rem' }}>
                                {editModal.row?.empleado_nombres} {editModal.row?.empleado_apellidos}
                            </div>
                        </div>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' }}>Periodo (Año/Ciclo)</label>
                            <input 
                                value={editModal.nuevoPeriodo}
                                onChange={(e) => setEditModal({...editModal, nuevoPeriodo: e.target.value})}
                                placeholder="Ej: 2025-2026"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setEditModal({ show: false, row: null, nuevoPeriodo: "" })} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}