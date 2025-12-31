import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPOS = { 1: "asistencia", 2: "kpi", 3: "ausencias" };
const FORMATOS = { 1: "CSV", 2: "XLS", 3: "PDF" };

function showJson(obj) {
  if (!obj) return "";
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}

function showDestinatarios(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function ReportesProgramados() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/reportes-programados/");
      if (!res.ok) throw new Error("No se pudo cargar.");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar reporte programado?")) return;
    try {
      const res = await apiFetch(`/api/reportes-programados/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  const toggleActivo = async (id) => {
    try {
      const res = await apiFetch(`/api/reportes-programados/${id}/toggle-activo/`, { method: "PATCH" });
      if (!res.ok) throw new Error("No se pudo cambiar estado.");
      await load();
    } catch (e) {
      alert(e?.message || "Error cambiando estado.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Reportes Programados</h2>

        <div style={{ marginBottom: 10 }}>
          <Link to="/admin/reportes-programados/crear">
            <button type="button">Crear</button>
          </Link>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="8" cellSpacing="0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Parámetros</th>
                <th>Frecuencia cron</th>
                <th>Formato</th>
                <th>Destinatarios</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan="9">Sin registros</td>
                </tr>
              )}

              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombre}</td>
                  <td>{r.empresa_razon_social || "—"}</td>
                  <td>{r.tipo_nombre || TIPOS[r.tipo] || r.tipo}</td>
                  <td>{r.parametros_texto || showJson(r.parametros)}</td>
                  <td>{r.frecuencia_cron}</td>
                  <td>{r.formato_nombre || FORMATOS[r.formato] || r.formato}</td>
                  <td>{r.destinatarios_texto || showDestinatarios(r.destinatarios)}</td>
                  <td>{r.activo ? "Sí" : "No"}</td>
                  <td>
                    <Link to={`/admin/reportes-programados/editar/${r.id}`}>
                      <button type="button">Editar</button>
                    </Link>{" "}
                    <button type="button" onClick={() => eliminar(r.id)}>
                      Eliminar
                    </button>{" "}
                    <button type="button" onClick={() => toggleActivo(r.id)}>
                      Cambiar estado
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
