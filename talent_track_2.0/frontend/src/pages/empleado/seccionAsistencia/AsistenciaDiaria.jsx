// frontend/src/pages/empleado/seccionAsistencia/AsistenciaDiaria.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPO = {
  1: "Entrada (check_in)",
  2: "Salida (check_out)",
  3: "Pausa IN",
  4: "Pausa OUT",
};

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    // Si llega HTML, lo devolvemos como texto para debug
    return { _non_json: true, raw: text };
  }
}

export default function AsistenciaDiaria() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [obs, setObs] = useState("");
  const [rows, setRows] = useState([]);

  const loadHoy = async () => {
    setErr("");
    try {
      const res = await apiFetch("/api/empleado/asistencia/hoy/");
      const data = await safeJson(res);

      if (!res.ok) {
        const msg =
          data?._non_json ? "Backend devolvió HTML (revisa ruta/auth)." : JSON.stringify(data || {});
        throw new Error(msg);
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando registros de hoy.");
      setRows([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadHoy();
      setLoading(false);
    })();
  }, []);

  const registrar = async (tipo) => {
    setErr("");
    try {
      const payload = {
        tipo,
        observaciones: obs?.trim() ? obs.trim() : null,

        // Si tú “quieres” mandar estos, puedes agregarlos desde contexto,
        // pero backend NO los necesita. Por seguridad, backend decide por token.
        // id_empresa: ...,
        // id_empleado: ...,
      };

      const res = await apiFetch("/api/empleado/asistencia/registrar/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        const msg =
          data?._non_json ? "Backend devolvió HTML (revisa ruta/auth)." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      setObs("");
      await loadHoy();
      alert("Registro creado.");
    } catch (e) {
      setErr(e?.message || "No se pudo registrar.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Mi asistencia de hoy</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <div style={{ marginBottom: 12 }}>
          <label>Observación (opcional): </label>
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ej: Llegué temprano por reunión..."
            style={{ width: 420 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => registrar(1)}>Registrar Entrada</button>
          <button onClick={() => registrar(2)}>Registrar Salida</button>
        </div>

        <h3>Registros del día</h3>

        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Registrado el</th>
              <th>Fuente</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.tipo_label || TIPO[r.tipo] || `tipo(${r.tipo})`}</td>
                <td>{r.registrado_el}</td>
                <td>{r.fuente_label || r.fuente}</td>
                <td>{r.observaciones || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4">Aún no tienes registros hoy.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 12 }}>
          <Link to="/empleado/inicio">Volver</Link>
        </div>
      </main>
    </div>
  );
}
