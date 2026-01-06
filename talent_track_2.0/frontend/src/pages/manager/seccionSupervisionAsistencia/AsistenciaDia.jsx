import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPO = {
  1: "check_in",
  2: "check_out",
  3: "pausa_in",
  4: "pausa_out",
};

const FUENTE = {
  1: "app",
  2: "web",
  3: "lector",
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AsistenciaDia() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(todayISO());
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (f) => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/supervision-asistencia/eventos/?fecha=${encodeURIComponent(f)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));

      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setRows([]);
      setErr(e?.message || "Error cargando eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // carga inicial (hoy)
    if (fecha) load(fecha);
    // eslint-disable-next-line
  }, []);

  const onBuscar = (e) => {
    e.preventDefault();
    if (!fecha) return setErr("Debes seleccionar una fecha.");
    load(fecha);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Supervisión Asistencia — Eventos por día</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/manager/supervision/jornadas")}>Ver Jornadas del Día</button>
          <Link to="/manager/inicio">Volver al inicio</Link>
        </div>

        <form onSubmit={onBuscar} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <label>
            Fecha *{" "}
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </label>
          <button type="submit">Buscar</button>
        </form>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Registrado</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{TIPO[r.tipo] || r.tipo_label || r.tipo}</td>
                  <td>{fmtDT(r.registrado_el)}</td>
                  <td>{FUENTE[r.fuente] || r.fuente_label || r.fuente}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="6">No existen eventos para la fecha seleccionada.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
