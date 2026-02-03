import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000";

const DAYS = [
  { num: 1, nombre: "Lunes", short: "L" },
  { num: 2, nombre: "Martes", short: "M" },
  { num: 3, nombre: "Miércoles", short: "M" },
  { num: 4, nombre: "Jueves", short: "J" },
  { num: 5, nombre: "Viernes", short: "V" },
  { num: 6, nombre: "Sábado", short: "S" },
  { num: 7, nombre: "Domingo", short: "D" },
];

export default function CrearTurnoEmp() {
  const navigate = useNavigate();
  
  // Estados
  const [empresas, setEmpresas] = useState([]);
  const [selectedDays, setSelectedDays] = useState(new Set([1, 2, 3, 4, 5])); // Default L-V
  
  const [form, setForm] = useState({
    empresa: "",
    nombre: "",
    hora_inicio: "",
    hora_fin: "",
    tolerancia_minutos: 0,
    requiere_gps: false,
    requiere_foto: false,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGAR EMPRESAS ---
  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [navigate]);

  // --- HANDLERS ---
  const toggleDay = (num) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const diasSemanaPayload = useMemo(() => {
    const nums = Array.from(selectedDays).sort((a, b) => a - b);
    return nums.map((n) => {
        const dayObj = DAYS.find((d) => d.num === n);
        return { num: dayObj.num, nombre: dayObj.nombre.toLowerCase() };
    }).filter(Boolean);
  }, [selectedDays]);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.empresa) return alert("Seleccione una empresa.");
    if (!form.hora_inicio || !form.hora_fin) return alert("Defina el horario completo.");
    if (selectedDays.size === 0) return alert("Seleccione al menos un día laboral.");

    const payload = {
      empresa: Number(form.empresa),
      nombre: form.nombre.trim(),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      dias_semana: diasSemanaPayload,
      tolerancia_minutos: Number(form.tolerancia_minutos),
      requiere_gps: !!form.requiere_gps,
      requiere_foto: !!form.requiere_foto,
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/api/turnos/crear/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "Error al crear el turno.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/turnos");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  return (
    // AQUÍ: layout-watermark AÑADIDO
    <div className="layout layout-watermark" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/turnos" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Turnos</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Turno</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nuevo Turno Laboral</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define los horarios, días laborales y reglas de validación.</p>
            </div>

            {/* LAYOUT DE 2 COLUMNAS (FLEX) */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- CARD FORMULARIO (Expandible) --- */}
                <div style={{ flex: '1 1 500px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Generales
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPRESA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <select name="empresa" value={form.empresa} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">Seleccionar Empresa...</option>
                                        {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* NOMBRE TURNO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre del Turno <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-tag' style={iconStyle}></i>
                                    <input type="text" name="nombre" placeholder="Ej. Matutino Administrativo" value={form.nombre} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Horario y Días
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* HORA INICIO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Hora Entrada <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-time' style={iconStyle}></i>
                                    <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>

                            {/* HORA FIN */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Hora Salida <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-time-five' style={iconStyle}></i>
                                    <input type="time" name="hora_fin" value={form.hora_fin} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>

                            {/* TOLERANCIA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Tolerancia (Min)</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-timer' style={iconStyle}></i>
                                    <input type="number" min="0" name="tolerancia_minutos" value={form.tolerancia_minutos} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        {/* SELECTOR DE DÍAS (Visual) */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Días Laborales</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {DAYS.map((d) => {
                                    const isSelected = selectedDays.has(d.num);
                                    return (
                                        <button
                                            key={d.num}
                                            type="button"
                                            onClick={() => toggleDay(d.num)}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                                backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                                                color: isSelected ? 'white' : '#64748b',
                                                fontWeight: 'bold', fontSize: '0.9rem',
                                                transition: 'all 0.2s', boxShadow: isSelected ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
                                            }}
                                            title={d.nombre}
                                        >
                                            {d.short}
                                        </button>
                                    );
                                })}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Días seleccionados serán laborables. Deselecciona para días libres.</p>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Validaciones de Asistencia
                        </h4>

                        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" name="requiere_gps" checked={form.requiere_gps} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Geolocalización (GPS)</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Exigir ubicación al marcar.</span>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" name="requiere_foto" checked={form.requiere_foto} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#db2777' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Foto Evidencia</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Exigir selfie al marcar.</span>
                                </div>
                            </label>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/turnos" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Turno
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL INFO (Fijo 320px) --- */}
                <div style={{ flex: '0 0 320px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}><i className='bx bx-bulb' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Tips de Configuración</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Tolerancia</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Minutos permitidos después de la hora de entrada antes de marcar "Atraso". <br/>Ej: Entrada 08:00, Tolerancia 10 min. Marcar 08:09 es puntual.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Días Libres</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Los días <strong>NO seleccionados</strong> se consideran libres. El sistema no generará faltas si no hay marcación en esos días.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>App Móvil</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Si activas <strong>GPS</strong> o <strong>Foto</strong>, los empleados necesitarán la app móvil para registrar su asistencia.
                        </p>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Turno Creado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>El nuevo horario ha sido configurado exitosamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}