import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";
// import "../../../assets/css/detalle-empleado.css";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function DetalleEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/mi-equipo/empleados/${id}/`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar el detalle.");
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando detalle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  // Styles
  const styles = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px',
      marginLeft: '80px', // Adjusted for fixed sidebar
      width: 'calc(100% - 80px)', // Ensure correct width calculation if needed, though flex handles it mostly
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '40px',
      border: '1px solid #e2e8f0',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#64748b',
      marginTop: '4px'
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '40px',
    },
    infoGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    label: {
      fontSize: '0.85rem',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    value: {
      fontSize: '1rem',
      color: '#0f172a',
      fontWeight: '500',
    },
    buttonPrimary: {
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none'
    },
    buttonSecondary: {
      backgroundColor: 'white',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      padding: '8px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '0.9rem',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    badge: (status) => {
      const s = (status || '').toLowerCase();
      let bg = '#f1f5f9';
      let text = '#475569';
      if (s === 'activo') { bg = '#dcfce7'; text = '#166534'; }
      else if (s === 'inactivo') { bg = '#fee2e2'; text = '#991b1b'; }

      return {
        backgroundColor: bg,
        color: text,
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '600',
        display: 'inline-block',
        textTransform: 'capitalize'
      };
    }
  };

  return (
    <div style={styles.layout}>
      <SidebarManager />
      <main style={styles.main}>
        <div style={styles.container}>
          {/* 1. Header Section */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={styles.title}>Perfil del Empleado</h2>
              <div style={styles.subtitle}>{data ? `${data.nombres} ${data.apellidos}` : 'Cargando...'}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.buttonSecondary} onClick={() => navigate(`/manager/mi-equipo/empleados/${id}/jornadas`)}>
                <i className='bx bx-time'></i> Ver Jornadas
              </button>
              <button style={styles.buttonSecondary} onClick={() => navigate("/manager/mi-equipo/empleados")}>
                <i className='bx bx-arrow-back'></i> Volver a la Lista
              </button>
            </div>
          </div>

          {/* 2. Main Content Card */}
          <div style={styles.card}>
            {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Cargando información del empleado...</div>}
            {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>{err}</div>}

            {!loading && data && (
              <div style={styles.grid}>

                {/* Column 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Datos Laborales */}
                  <div>
                    <div style={styles.sectionTitle}>
                      <i className='bx bx-briefcase' style={{ color: '#dc2626' }}></i>
                      Datos Laborales
                    </div>
                    <div style={styles.infoGroup}>
                      <div style={styles.field}>
                        <span style={styles.label}>Departamento (Unidad Organizacional)</span>
                        <span style={styles.value}>{data.unidad_organizacional || "N/A"}</span>
                      </div>
                      <div style={styles.field}>
                        <span style={styles.label}>Puesto / Cargo</span>
                        <span style={styles.value}>{data.puesto || "N/A"}</span>
                      </div>
                      <div style={styles.field}>
                        <span style={styles.label}>Manager Directo</span>
                        <span style={styles.value}>{data.manager || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <div style={styles.sectionTitle}>
                      <i className='bx bx-toggle-right' style={{ color: '#dc2626' }}></i>
                      Estado del Empleado
                    </div>
                    <div style={styles.infoGroup}>
                      <div style={styles.field}>
                        <span style={styles.label}>Estado Actual</span>
                        <div><span style={styles.badge(data.estado_label)}>{data.estado_label || "Desconocido"}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Información Personal y Fechas */}
                  <div>
                    <div style={styles.sectionTitle}>
                      <i className='bx bx-calendar' style={{ color: '#dc2626' }}></i>
                      Fechas Importantes
                    </div>
                    <div style={styles.infoGroup}>
                      <div style={styles.field}>
                        <span style={styles.label}>Fecha de Nacimiento</span>
                        <span style={styles.value}>{fmtDate(data.fecha_nacimiento)}</span>
                      </div>
                      <div style={styles.field}>
                        <span style={styles.label}>Fecha de Ingreso</span>
                        <span style={styles.value}>{fmtDate(data.fecha_ingreso)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div>
                    <div style={styles.sectionTitle}>
                      <i className='bx bx-id-card' style={{ color: '#dc2626' }}></i>
                      Información de Contacto
                    </div>
                    <div style={styles.infoGroup}>
                      <div style={styles.field}>
                        <span style={styles.label}>Correo Electrónico</span>
                        <span style={styles.value}>{data.email}</span>
                      </div>
                      <div style={styles.field}>
                        <span style={styles.label}>Teléfono</span>
                        <span style={styles.value}>{data.telefono || "No registrado"}</span>
                      </div>
                      <div style={styles.field}>
                        <span style={styles.label}>Dirección Domiciliaria</span>
                        <span style={styles.value}>{data.direccion || "No registrada"}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
