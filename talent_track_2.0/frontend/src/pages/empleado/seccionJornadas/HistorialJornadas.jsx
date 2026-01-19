import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function fmtMinToH(min) {
  const m = Number(min || 0);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r}m`;
}

export default function HistorialJornadas() {
  const [month, setMonth] = useState(currentMonthStr());
  const [rows, setRows] = useState([]);
  const [resumen, setResumen] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (m) => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/empleado/jornadas/?month=${m}`);
      const data = await safeJson(res);

      if (!res.ok) {
        const msg =
          data?._non_json ? "Backend devolvió HTML (revisa ruta/auth)." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      setResumen(data?.resumen || null);
      setRows(Array.isArray(data?.jornadas) ? data.jornadas : []);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas.");
      setResumen(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(month);
    // eslint-disable-next-line
  }, []);

  const onBuscar = async (e) => {
    e.preventDefault();
    await load(month);
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Historial de Jornadas</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onBuscar} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <label>Mes: </label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <button type="submit">Buscar</button>
        </form>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            {resumen && (
              <div style={{ marginBottom: 12 }}>
                <p><strong>Mes:</strong> {resumen.month} | <strong>Días:</strong> {resumen.dias}</p>
                <p>
                  <strong>Minutos trabajados:</strong> {resumen.total_minutos_trabajados} ({fmtMinToH(resumen.total_minutos_trabajados)}){" "}
                  | <strong>Tardanza:</strong> {resumen.total_minutos_tardanza} ({fmtMinToH(resumen.total_minutos_tardanza)}){" "}
                  | <strong>Extras:</strong> {resumen.total_minutos_extra} ({fmtMinToH(resumen.total_minutos_extra)})
                </p>
              </div>
            )}

            <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Primera entrada</th>
                  <th>Última salida</th>
                  <th>Minutos trabajados</th>
                  <th>Minutos tardanza</th>
                  <th>Minutos extra</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fecha}</td>
                    <td>{r.hora_primera_entrada || "—"}</td>
                    <td>{r.hora_ultimo_salida || "—"}</td>
                    <td>{r.minutos_trabajados ?? 0}</td>
                    <td>{r.minutos_tardanza ?? 0}</td>
                    <td>{r.minutos_extra ?? 0}</td>
                    <td>{r.estado_label || r.estado}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="7">No hay jornadas calculadas para este mes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/empleado/inicio">Volver</Link>
        </div>
      </main>
    </div>
  );
}
