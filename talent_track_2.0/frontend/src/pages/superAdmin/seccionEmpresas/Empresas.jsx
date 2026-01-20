import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";
import Sidebar from "../../../components/Sidebar"; 
import logoWatermark from "../../../assets/img/talentrack_small.svg";
import '../../../assets/css/admin-empresas.css'; 
import '../../../assets/css/modal.css';

const Empresas = () => {
  const navigate = useNavigate();
  const API_BASE = "http://127.0.0.1:8000/api";

  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const [showModal, setShowModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [modalAction, setModalAction] = useState(null); 
  const [modalStep, setModalStep] = useState(1); 

  // ... (Fetch y Filtros se mantienen igual) ...
  const fetchEmpresas = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/listado-empresas/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al conectar');
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setEmpresas(lista);
      setFilteredEmpresas(lista); 
    } catch (error) {
      setErrorMsg("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmpresas(); }, []);

  const handleFilter = () => {
    let resultado = empresas;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      resultado = resultado.filter(emp => 
        (emp.nombre_comercial || "").toLowerCase().includes(term) ||
        (emp.razon_social || "").toLowerCase().includes(term) ||
        (emp.ruc_nit || "").toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'todos') {
      resultado = resultado.filter(emp => 
        (emp.estado_nombre || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredEmpresas(resultado);
  };

  useEffect(() => { handleFilter(); }, [searchTerm, statusFilter, empresas]);

  // ... (Funciones de Modal se mantienen igual) ...
  const iniciarAccion = (empresa, accion) => {
    setEmpresaSeleccionada(empresa);
    setModalAction(accion);
    setModalStep(1);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEmpresaSeleccionada(null);
    setModalStep(1);
    setModalAction(null);
  };

  const confirmarAccion = async () => {
    if (!empresaSeleccionada) return;
    if (modalAction === 'delete' && modalStep === 1) { setModalStep(2); return; }

    const { id } = empresaSeleccionada;
    const token = getAccessToken();
    let url = modalAction === 'delete' ? `${API_BASE}/empresas/${id}/` : `${API_BASE}/empresas/${id}/toggle-estado/`;
    let method = modalAction === 'delete' ? "DELETE" : "PATCH";

    try {
      const res = await apiFetch(url, { method: method, headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { await fetchEmpresas(); cerrarModal(); } 
      else { alert("No se pudo completar la acción."); }
    } catch (error) { alert("Error de conexión."); }
  };

  const getInitials = (name) => {
     if(!name) return "EM";
     return name.substring(0, 2).toUpperCase();
  };

  // ... (Render del Modal igual que antes) ...
  const renderModalContent = () => {
      // (Mantén el mismo código de tu modal aquí, no cambia para el diseño compacto)
      if (!empresaSeleccionada) return null;
      if (modalAction === 'toggle') {
        const isActivating = empresaSeleccionada.estado_nombre !== 'activo';
        return (
            <>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: isActivating ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <i className={`bx ${isActivating ? 'bx-check-circle' : 'bx-power-off'}`} style={{ fontSize: '30px', color: isActivating ? '#16a34a' : '#dc2626' }}></i>
            </div>
            <h3 className="modal-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Confirmar cambio</h3>
            <p className="modal-text" style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>
                ¿{isActivating ? 'Activar' : 'Desactivar'} <strong>{empresaSeleccionada.nombre_comercial}</strong>?
            </p>
            <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={cerrarModal} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={confirmarAccion} style={{ padding: '8px 16px', backgroundColor: isActivating ? '#16a34a' : '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirmar</button>
            </div>
            </>
        );
      }
      // Simplificado para brevedad, usa tu logica de delete aquí
      return <div style={{padding: 20}}>Confirmar eliminación... <button onClick={confirmarAccion}>Si</button></div>;
  };

  // --- ESTILOS COMPACTOS ---
  const layoutWrapperStyle = {
    display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%',
  };

  const mainAreaStyle = {
    flex: 1,
    // Reducimos padding: antes 40px, ahora 20px arriba/abajo/derecha
    padding: '25px 25px 25px 110px', 
    position: 'relative', zIndex: 1,
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  return (
    <div style={layoutWrapperStyle}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />

      <main style={mainAreaStyle}>
        
        {/* Header Compacto */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Gestión de Empresas</h1>
            <p style={{ color: '#64748b', marginTop: '2px', fontSize: '0.95rem' }}>Administración de organizaciones.</p>
          </div>
          <button 
            onClick={() => navigate("/admin/empresas/crear")}
            style={{ 
              backgroundColor: '#dc2626', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: '8px', fontWeight: '600', // Botón más compacto
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.9rem', boxShadow: '0 4px 10px -3px rgba(220, 38, 38, 0.2)'
            }}
          >
            <i className='bx bx-plus-circle' style={{ fontSize: '1.2rem' }}></i> Nueva Empresa
          </button>
        </div>

        {errorMsg && <div style={{ marginBottom: 15, color: 'white', background: '#ef4444', padding: 10, borderRadius: 6, fontSize: '0.9rem' }}>{errorMsg}</div>}

        {/* Card Principal Compacta */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow:'hidden' }}>
            
            {/* Filtros Compactos */}
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#fff' }}>
                <div style={{ position: 'relative' }}>
                    <i className='bx bx-search' style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }}></i>
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ padding: '8px 15px 8px 35px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '250px', outline: 'none', fontSize: '0.85rem' }}
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569', backgroundColor: 'white', cursor: 'pointer', outline:'none', fontSize: '0.85rem' }}
                >
                    <option value="todos">Todos</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                
                {/* Header Gris y Compacto */}
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Empresa</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Razón Social</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RUC / NIT</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ubicación</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Estado</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                
                <tbody>
                    {loading && <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color: '#64748b', fontSize:'0.9rem'}}>Cargando...</td></tr>}
                    {!loading && filteredEmpresas.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'30px', color: '#64748b', fontSize:'0.9rem'}}>Sin resultados.</td></tr>}

                    {!loading && filteredEmpresas.map((empresa) => (
                    // Reducimos el padding de las celdas (antes 20px, ahora 12px)
                    <tr key={empresa.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fcfcfc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        
                        <td style={{ padding: '12px 20px', color: '#1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Avatar más pequeño (36px en vez de 45px) */}
                                <div style={{ 
                                    width: '36px', height: '36px', 
                                    backgroundColor: '#be185d', color: 'white', borderRadius: '8px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontSize: '0.85rem', fontWeight: '700',
                                    boxShadow: '0 2px 4px rgba(190, 24, 93, 0.2)'
                                }}>
                                    {getInitials(empresa.nombre_comercial)}
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{empresa.nombre_comercial}</span>
                            </div>
                        </td>

                        <td style={{ padding: '12px 20px', color: '#475569', fontSize: '0.85rem' }}>
                            {empresa.razon_social}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#64748b', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {empresa.ruc_nit}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                            {empresa.pais_nombre ?? empresa.pais}
                        </td>
                        
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <span style={{ 
                                backgroundColor: (empresa.estado_nombre || '').toLowerCase() === 'activo' ? '#dcfce7' : '#fee2e2', 
                                color: (empresa.estado_nombre || '').toLowerCase() === 'activo' ? '#166534' : '#b91c1c', 
                                padding: '3px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase'
                            }}>
                                {empresa.estado_nombre ?? empresa.estado}
                            </span>
                        </td>
                        
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                <button onClick={() => navigate(`/admin/empresas/editar/${empresa.id}`)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#6366f1', display:'flex' }} title="Editar">
                                    <i className='bx bx-edit-alt' style={{ fontSize: '1.1rem' }}></i>
                                </button>
                                <button onClick={() => iniciarAccion(empresa, 'toggle')} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#f59e0b', display:'flex' }} title="Estado">
                                    <i className='bx bx-power-off' style={{ fontSize: '1.1rem' }}></i>
                                </button>
                                <button onClick={() => iniciarAccion(empresa, 'delete')} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', display:'flex' }} title="Eliminar">
                                    <i className='bx bx-trash' style={{ fontSize: '1.1rem' }}></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>

      </main>

      {/* Modal Overlay (se mantiene igual, no afecta espacios de la tabla) */}
      {showModal && empresaSeleccionada && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)' }}>
             {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Empresas;