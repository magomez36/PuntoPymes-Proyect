import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPOS = [
  { id: 1, label: "asistencia" },
  { id: 2, label: "kpi" },
  { id: 3, label: "ausencias" },
];

const FORMATOS = [
  { id: 1, label: "CSV" },
  { id: 2, label: "XLS" },
  { id: 3, label: "PDF" },
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EditarReporteProgramado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    tipo: 1,
    frecuencia_cron: "",
    formato: 1,
    activo: true,
  });

  const [email, setEmail] = useState("");
  const [destinatarios, setDestinatarios] = useState([]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reportes-programados/${id}/`);
      if (!res.ok) throw new Error("No se pudo cargar el reporte.");
      const data = await res.json();

      setForm({
        nombre: data.nombre || "",
        tipo: Number(data.tipo || 1),
        frecuencia_cron: data.frecuencia_cron || "",
        formato: Number(data.formato || 1),
        activo: Boolean(data.activo),
      });

      setDestinatarios(Array.isArray(data.destinatarios) ? data.destinatarios : []);
    } catch (e) {
      setErr(e?.message || "Error cargando.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addDestinatario = () => {
    const v = email.trim();
    if (!v) return;
    if (!isValidEmail(v)) return alert("Correo inválido.");
    if (destinatarios.includes(v)) return setEmail("");
    setDestinatarios((prev) => [...prev, v]);
    setEmail("");
  };

  const removeDestinatario = (v) => {
    setDestinatarios((prev) => prev.filter((x) => x !== v));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) return setErr("Nombre obligatorio.");
    if (!form.frecuencia_cron.trim()) return setErr("Frecuencia cron obligatoria.");
    if (destinatarios.length === 0) return setErr("Agrega al menos 1 destinatario.");

    const payload = {
      nombre: form.nombre.trim(),
      tipo: Number(form.tipo),
      frecuencia_cron: form.frecuencia_cron.trim(),
      formato: Number(form.formato),
      destinatarios,
      activo: Boolean(form.activo),
    };

    try {
      const res = await apiFetch(`/api/reportes-programados/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const e2 = await res.json().catch(() => ({}));
        throw new Error(e2?.detail || "No se pudo actualizar.");
      }

      alert("Actualizado correctamente.");
      navigate("/admin/reportes-programados");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando.");
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <p>Cargando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Reporte Programado</h2>
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={submit}>
          <div>
            <label>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={onChange} />
          </div>

          <div>
            <label>Tipo *</label>
            <select name="tipo" value={form.tipo} onChange={onChange}>
              {TIPOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Frecuencia cron *</label>
            <input
              name="frecuencia_cron"
              value={form.frecuencia_cron}
              onChange={onChange}
              placeholder="0 8 * * *"
            />
          </div>

          <div>
            <label>Formato *</label>
            <select name="formato" value={form.formato} onChange={onChange}>
              {FORMATOS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <hr />

          <div>
            <label>Destinatarios (correos) *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rrhh@talenttrack.com" />
              <button type="button" onClick={addDestinatario}>
                Agregar
              </button>
            </div>

            {destinatarios.length === 0 ? (
              <p>Sin destinatarios</p>
            ) : (
              <ul>
                {destinatarios.map((d) => (
                  <li key={d}>
                    {d}{" "}
                    <button type="button" onClick={() => removeDestinatario(d)}>
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label>
              <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
              Activo
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/admin/reportes-programados">Cancelar</Link>{" "}
            <button type="submit">Guardar</button>
          </div>
        </form>
      </main>
    </div>
  );
}
