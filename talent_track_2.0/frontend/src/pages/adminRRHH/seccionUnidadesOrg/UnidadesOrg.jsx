import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarRRHH from "../../../components/SidebarRRHH";
import { apiFetch } from "../../../services/api";

// Importamos estilos globales
import "../../../assets/css/admin-empresas.css";

// Importamos el logo para la marca de agua
import logoWatermark from "../../../assets/img/talentrack_small.svg";

export default function UnidadesOrg() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- MODALES ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // --- CARGA DE DATOS ---
  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- HANDLERS ---
  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      const res = await apiFetch(`/api/rrhh/unidades-organizacionales/${idToDelete}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: está siendo usada.");
        closeConfirmModal();
        return;
      }

      if (!res.ok) throw new Error("No se pudo eliminar.");
      
      await load();
      closeConfirmModal();
      setShowSuccessModal(true);
      
    } catch (e) {
      alert(e?.message || "Error eliminando.");
      closeConfirmModal();
    }
  };

  const formatTipo = (tipoRaw) => {
    if (!tipoRaw) return "N/A";
    const str = String(tipoRaw).trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const renderEstado = (labelRaw) => {
    const labelStr = String(labelRaw || "").trim().toUpperCase();
    const esActivo = labelStr === "ACTIVO" || labelStr === "ACTIVA";
    
    return (
        <span style={{
            backgroundColor: esActivo ? '#dcfce7' : '#fee2e2',
            color: esActivo ? '#16a34a' : '#dc2626',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase'
        }}>
            {esActivo ? "ACTIVA" : "INACTIVA"}
        </span>
    );
  };

  // --- ESTILO MARCA DE AGUA (Estilo Login) ---
  const watermarkStyle = {
    position: 'fixed',
    bottom: '-80px',
    right: '-80px',
    width: '450px',
    height: 'auto',
    opacity: '0.04',
    zIndex: 0,
    pointerEvents: 'none'
  };

  return (
    <div className="layout-wrapper">
      
      <SidebarRRHH />
      
      {/* Mantenemos page-content-wrapper SOLO para el margen izquierdo del menú, 
          pero NO limitamos el ancho de la tabla. */}
      <main className="page-content-wrapper">
        
        {/* === HEADER SUPERIOR === */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            
            {/* IZQUIERDA: Títulos y Ruta */}
            <div>
                <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/rrhh" style={{ textDecoration: 'none', color: '#6b7280', fontWeight: '500' }}>
                        Inicio
                    </Link>
                    <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem' }}></i>
                    <span style={{ color: '#d51e37', fontWeight: '600', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px' }}>
                        Unidades Org.
                    </span>
                </div>

                <h1 className="page-header-title" style={{ fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                    Unidades Organizacionales
                </h1>
                <p className="page-header-desc" style={{marginBottom:0}}>
                    Gestión de departamentos y estructura jerárquica.
                </p>
            </div>
            
            {/* DERECHA: Botón Crear */}
            <button 
                className="btn-primary-save"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: 'fit-content' }} 
                onClick={() => navigate("/rrhh/unidades-organizacionales/crear")}
            >
                <i className='bx bx-plus' style={{fontSize: '1.2rem'}}></i> Crear Unidad
            </button>
        </div>

        {/* === TABLA DE ANCHO COMPLETO === */}
        {/* Quitamos el maxWidth: 1200px para que ocupe todo el espacio natural */}
        <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
            
            <div className="form-card-container" style={{ padding: 0, overflow: 'hidden' }}> 
                {loading && <div className="loading-box">Cargando datos...</div>}
                {err && <div className="error-box" style={{margin: '20px'}}>{err}</div>}

                {!loading && !err && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th style={tableStyles.th}>Unidad</th>
                                    <th style={tableStyles.th}>Dependencia (Padre)</th>
                                    <th style={tableStyles.th}>Tipo</th>
                                    <th style={tableStyles.th}>Ubicación</th>
                                    <th style={{...tableStyles.th, textAlign: 'center'}}>Estado</th>
                                    <th style={{...tableStyles.th, textAlign: 'center'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((r) => (
                                        <tr key={r.id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                            <td style={{...tableStyles.td, fontWeight:'600'}}>{r.nombre}</td>
                                            <td style={{...tableStyles.td, color:'#6b7280'}}>{r.unidad_padre_nombre || "-"}</td>
                                            <td style={tableStyles.td}>{formatTipo(r.tipo_label)}</td>
                                            <td style={tableStyles.td}>{r.ubicacion || "-"}</td>
                                            
                                            <td style={{...tableStyles.td, textAlign: 'center'}}>
                                                {renderEstado(r.estado_label)}
                                            </td>
                                            
                                            <td style={{...tableStyles.td, textAlign: 'center'}}>
                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button 
                                                        style={{...tableStyles.actionBtn, color: '#4f46e5'}} 
                                                        onClick={() => navigate(`/rrhh/unidades-organizacionales/editar/${r.id}`)}
                                                        title="Editar"
                                                    >
                                                        <i className='bx bx-pencil'></i>
                                                    </button>
                                                    <button 
                                                        style={{...tableStyles.actionBtn, color: '#dc2626'}} 
                                                        onClick={() => openDeleteModal(r.id)}
                                                        title="Eliminar"
                                                    >
                                                        <i className='bx bx-trash'></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontStyle:'italic' }}>
                                            No hay registros disponibles.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {/* --- MODAL CONFIRMACIÓN --- */}
        {showConfirmModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                        <i className='bx bx-error-circle'></i>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¿Eliminar unidad?</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '24px' }}>
                        Esta acción es irreversible. ¿Estás seguro de continuar?
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={closeConfirmModal} className="btn-secondary-cancel" style={{flex:1, cursor:'pointer'}}>
                            Cancelar
                        </button>
                        <button onClick={confirmDelete} style={{ flex: 1, padding: '9px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL ÉXITO --- */}
        {showSuccessModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>¡Eliminado!</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '24px' }}>
                        La unidad organizacional se ha eliminado correctamente.
                    </p>
                    <button onClick={closeSuccessModal} className="btn-primary-save" style={{ width: '100%' }}>
                        Aceptar
                    </button>
                </div>
            </div>
        )}

      </main>

      {/* === LOGO MARCA DE AGUA === */}
      <img 
        src={logoWatermark} 
        alt="Logo Fondo" 
        style={watermarkStyle} 
      />

    </div>
  );
}

// --- ESTILOS DE TABLA ---
const tableStyles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        whiteSpace: 'nowrap'
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
    },
    td: {
        padding: '16px',
        fontSize: '0.9rem',
        color: '#111827',
        verticalAlign: 'middle'
    },
    actionBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginLeft: '6px'
    }
};