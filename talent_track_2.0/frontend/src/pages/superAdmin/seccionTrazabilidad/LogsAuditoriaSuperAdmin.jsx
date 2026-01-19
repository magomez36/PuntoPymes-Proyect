import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../services/api";

export default function LogsAuditoriaSuperAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [usuariosToggle, setUsuariosToggle] = useState([]);
  const [usuarioEmail, setUsuarioEmail] = useState("");

  const [fecha, setFecha] = useState(""); // YYYY-MM-DD

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------
  // Helpers
  // ----------------------------
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (empresaId) params.append("empresa_id", empresaId);
    if (usuarioEmail) params.append("usuario_email", usuarioEmail);
    if (fecha) params.append("fecha", fecha);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  // ----------------------------
  // Cargar empresas (para filtro multiempresa)
  // Nota: asumo que ya tienes endpoint de empresas en apps.core.
  // Si tu ruta real difiere, solo cambia el path aquí.
  // ----------------------------
  const loadEmpresas = async () => {
    try {
      // Muy probable: /api/empresas/ (si tu core ya lo expone).
      // Si no existe, lo dejas comentado y trabajas sin selector de empresa.
      const res = await apiFetch("/api/empresas/");
      if (!res.ok) return;
      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (e) {
      // silencioso: no rompemos la vista si no existe endpoint
    }
  };

  // ----------------------------
  // Cargar usuarios para toggle (dependen de empresaId)
  // ----------------------------
  const loadUsuariosToggle = async (empresaIdValue) => {
    try {
      const qs = empresaIdValue ? `?empresa_id=${empresaIdValue}` : "";
      const res = await apiFetch(`/api/auditoria/superadmin/helpers/usuarios/${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsuariosToggle(Array.isArray(data) ? data : []);
    } catch (e) {
      // no romper UI
    }
  };

  // ----------------------------
  // Cargar logs
  // ----------------------------
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

  // ----------------------------
  // Effects
  // ----------------------------
  useEffect(() => {
    loadEmpresas();
    loadUsuariosToggle("");
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // cuando cambia empresa: refrescar usuarios toggle y limpiar usuario seleccionado
    setUsuarioEmail("");
    loadUsuariosToggle(empresaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  // aplicar ambos filtros al mismo tiempo (usuario + fecha + empresa)
  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, usuarioEmail, fecha]);

  // ----------------------------
  // UI data
  // ----------------------------
  const empresaOptions = useMemo(() => {
    // soporta ambos formatos:
    // - {id, razon_social}
    // - {id, nombre_comercial}
    return empresas.map((e) => ({
      id: e.id,
      label: e.razon_social || e.nombre_comercial || `Empresa #${e.id}`,
    }));
  }, [empresas]);

  return (
    <div className="admin-ui">
      <div className="admin-ui__header">
        <h2>EPICA 42 - Trazabilidad y evidencia interna (SuperAdmin)</h2>
        <p style={{ marginTop: 6 }}>
          Logs globales del sistema (todas las empresas) con filtros dinámicos.
        </p>
      </div>

      {/* Filtros */}
      <div className="admin-ui__card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Empresa (solo SuperAdmin) */}
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              style={{ padding: 8, minWidth: 240 }}
            >
              <option value="">Todas</option>
              {empresaOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ padding: 8 }}
            />
          </div>

          {/* Clear */}
          <div style={{ marginTop: 18 }}>
            <button
              className="btn"
              onClick={() => {
                setEmpresaId("");
                setUsuarioEmail("");
                setFecha("");
              }}
              style={{ padding: "8px 12px" }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Toggle usuarios */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            Filtrar por usuario (toggle):
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn"
              onClick={() => setUsuarioEmail("")}
              style={{
                padding: "6px 10px",
                border: usuarioEmail ? "1px solid #ddd" : "2px solid #333",
              }}
            >
              Todos
            </button>

            {usuariosToggle.map((u) => (
              <button
                key={u.email}
                className="btn"
                onClick={() => setUsuarioEmail(u.email)}
                style={{
                  padding: "6px 10px",
                  border: usuarioEmail === u.email ? "2px solid #333" : "1px solid #ddd",
                }}
                title={u.email}
              >
                {u.email}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estado */}
      {loading && <p>Cargando logs...</p>}
      {error && (
        <div className="admin-ui__alert" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="admin-ui__card">
        <h3 style={{ marginBottom: 10 }}>Registro de Auditoría</h3>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Usuario</th>
                <th>Entidad</th>
                <th>Entidad ID</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>IP</th>
                <th>Empresa</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 14 }}>
                    No hay logs para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                logs.map((row) => (
                  <tr key={row.id}>
                    <td>{row.accion}</td>
                    <td>{row.usuario}</td>
                    <td>{row.entidad}</td>
                    <td>{row.entidad_id}</td>
                    <td>{row.fecha}</td>
                    <td>{row.hora}</td>
                    <td>{row.ip}</td>
                    <td>{row.empresa_razon_social || `Empresa #${row.empresa_id}`}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          *HU02 “Detalle” lo tienes listo en backend (endpoint detail). Si luego quieres modal al hacer click en una fila, lo agregamos rápido.
        </p>
      </div>
    </div>
  );
}
