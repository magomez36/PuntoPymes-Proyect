import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function calcDias(fi, ff) {
  if (!fi) return 0;
  const start = new Date(fi);
  const end = new Date(ff || fi);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

export default function EditarSolicitudAusencia() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [tipos, setTipos] = useState([]);

  const [form, setForm] = useState({
    id_tipo_ausencia: "",
    fecha_inicio: "",
    fecha_fin: "",
    motivo: "",
    estado: null,
    estado_label: "",
  });

  const diasPreview = useMemo(() => {
    const fi = form.fecha_inicio;
    const ff = form.fecha_fin || form.fecha_inicio;
    return calcDias(fi, ff);
  }, [form.fecha_inicio, form.fecha_fin]);

  const loadTipos = async () => {
    const res = await apiFetch("/api/empleado/tipos-ausencia/");
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.detail || "Error cargando tipos.");
    setTipos(Array.isArray(data) ? data : []);
  };

  const loadSolicitud = async () => {
    // Como el backend de empleado lista TODO, lo más simple es buscarlo por lista
    // (sin crear un endpoint extra). Pero si prefieres endpoint detalle GET, lo hacemos luego.
    const res = await apiFetch("/api/empleado/ausencias/");
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.detail || "Error cargando solicitudes.");

    const found = Array.isArray(data) ? data.find((x) => String(x.id) === String(id)) : null;
    if (!found) throw new Error("Solicitud no encontrada.");

    // Solo se edita si está pendiente
    if (Number(found.estado) !== 1) {
      throw new Error("Solo puedes editar solicitudes en estado pendiente.");
    }

    setForm({
      id_tipo_ausencia: String(found.tipo_ausencia || ""),
      fecha_inicio: found.fecha_inicio || "",
      fecha_fin: found.fecha_fin || "",
      motivo: found.motivo || "",
      estado: found.estado,
      estado_label: found.estado_label || "",
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadTipos();
        await loadSolicitud();
      } catch (e) {
        setErr(e?.message || "Error cargando solicitud.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === "fecha_inicio" && next.fecha_fin) {
        if (new Date(next.fecha_fin) < new Date(value)) next.fecha_fin = "";
      }
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.id_tipo_ausencia) return setErr("Selecciona un tipo de ausencia.");
    if (!form.fecha_inicio) return setErr("Selecciona fecha de inicio.");
    if (!form.motivo.trim()) return setErr("Motivo es obligatorio.");
    if (form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
      return setErr("fecha_fin no puede ser menor a fecha_inicio.");
    }

    const payload = {
      id_tipo_ausencia: Number(form.id_tipo_ausencia),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin ? form.fecha_fin : null,
      motivo: form.motivo.trim(),
    };

    try {
      const res = await apiFetch(`/api/empleado/ausencias/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        const msg = data?._non_json ? "Backend devolvió HTML." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      alert("Solicitud actualizada.");
      nav("/empleado/ausencias");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando solicitud.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Solicitud de Ausencia</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Tipo de ausencia *</label>
              <select name="id_tipo_ausencia" value={form.id_tipo_ausencia} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Fecha inicio *</label>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={onChange} />
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Fecha fin (opcional)</label>
              <input
                type="date"
                name="fecha_fin"
                value={form.fecha_fin}
                onChange={onChange}
                min={form.fecha_inicio || undefined}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Motivo *</label>
              <textarea name="motivo" value={form.motivo} onChange={onChange} rows="3" />
            </div>

            <div style={{ marginTop: 8 }}>
              <strong>Vista previa:</strong>{" "}
              {diasPreview > 0 ? `${diasPreview} día(s) solicitados` : "Completa fechas para calcular"}
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/empleado/ausencias">Cancelar</Link>{" "}
              <button type="submit">Guardar cambios</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
