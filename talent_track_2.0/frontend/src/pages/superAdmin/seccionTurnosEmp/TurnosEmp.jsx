import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  const ls = localStorage.getItem("tt_access");
  const ss = sessionStorage.getItem("tt_access");
  return ls || ss || null;
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDias(dias) {
  if (!Array.isArray(dias) || dias.length === 0) return "";
  const names = dias
    .map((d) => (d && typeof d === "object" ? d.nombre : ""))
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1));
  return names.join(", ");
}

export default function TurnosEmp() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchEmpresas = async () => {
    const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, {
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    if (!res.ok) throw new Error("No se pudo cargar empresas.");
    return res.json();
  };

  const fetchTurnos = async (empresaIdParam = "") => {
    const q = empresaIdParam ? `?empresa_id=${empresaIdParam}` : "";
    const res = await apiFetch(`${API_BASE}/api/turnos/${q}`, {
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    if (!res.ok) throw new Error("No se pudo cargar turnos.");
    return res.json();
  };

  const cargarTodo = async () => {
    setLoading(true);
    setErr("");
    try {
      const [empData, turData] = await Promise.all([
        fetchEmpresas(),
        fetchTurnos(empresaId),
      ]);
      setEmpresas(empData);
      setTurnos(turData);
    } catch (e) {
      setErr(e.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar turno?")) return;

    try {
      const res = await apiFetch(`${API_BASE}/api/turnos/${id}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await cargarTodo();
    } catch (e) {
      alert(e.message || "Error eliminando.");
    }
  };

  const sortedTurnos = useMemo(() => {
    // Orden “bonito”: Empresa, Nombre, Hora inicio
    return [...turnos].sort((a, b) => {
      const ea = (a.empresa_razon_social || "").toLowerCase();
      const eb = (b.empresa_razon_social || "").toLowerCase();
      if (ea !== eb) return ea.localeCompare(eb);
      const na = (a.nombre || "").toLowerCase();
      const nb = (b.nombre || "").toLowerCase();
      if (na !== nb) return na.localeCompare(nb);
      return (a.hora_inicio || "").localeCompare(b.hora_inicio || "");
    });
  }, [turnos]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Turnos</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>Empresa:</label>
        <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
          <option value="">(Todas)</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.razon_social}
            </option>
          ))}
        </select>

        <button onClick={() => navigate("/admin/turnos/crear")}>Crear Turno</button>

        <Link to="/superadmin/inicio">Volver a Inicio</Link>
      </div>

      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Empresa</th>
              <th>Hora inicio</th>
              <th>Hora fin</th>
              <th>Días</th>
              <th>Tolerancia (min)</th>
              <th>GPS</th>
              <th>Foto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedTurnos.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>{t.empresa_razon_social || t.empresa}</td>
                <td>{t.hora_inicio}</td>
                <td>{t.hora_fin}</td>
                <td>{t.dias_semana_texto || formatDias(t.dias_semana)}</td>
                <td>{t.tolerancia_minutos}</td>
                <td>{t.requiere_gps ? "Sí" : "No"}</td>
                <td>{t.requiere_foto ? "Sí" : "No"}</td>
                <td>
                  <button onClick={() => navigate(`/admin/turnos/editar/${t.id}`)}>Editar</button>{" "}
                  <button onClick={() => handleDelete(t.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {sortedTurnos.length === 0 && (
              <tr>
                <td colSpan="9">No hay turnos.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
