import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access") || null;
}
function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DAYS = [
  { num: 1, nombre: "lunes" },
  { num: 2, nombre: "martes" },
  { num: 3, nombre: "miércoles" },
  { num: 4, nombre: "jueves" },
  { num: 5, nombre: "viernes" },
  { num: 6, nombre: "sábado" },
  { num: 7, nombre: "domingo" },
];

export default function EditarTurnoEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [empresaTexto, setEmpresaTexto] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    hora_inicio: "",
    hora_fin: "",
    tolerancia_minutos: 0,
    requiere_gps: false,
    requiere_foto: false,
  });

  const [selectedDays, setSelectedDays] = useState(() => new Set());

  const diasSemanaPayload = useMemo(() => {
    const nums = Array.from(selectedDays).sort((a, b) => a - b);
    return nums.map((n) => DAYS.find((d) => d.num === n)).filter(Boolean);
  }, [selectedDays]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/turnos/${id}/`, {
          headers: { "Content-Type": "application/json", ...authHeaders() },
        });
        if (!res.ok) throw new Error("No se pudo cargar el turno.");

        const data = await res.json();

        setEmpresaTexto(data.empresa_razon_social || "");

        setForm({
          nombre: data.nombre || "",
          hora_inicio: data.hora_inicio || "",
          hora_fin: data.hora_fin || "",
          tolerancia_minutos: data.tolerancia_minutos ?? 0,
          requiere_gps: !!data.requiere_gps,
          requiere_foto: !!data.requiere_foto,
        });

        const nums = Array.isArray(data.dias_semana)
          ? data.dias_semana
              .map((d) => (d && typeof d === "object" ? d.num : null))
              .filter((n) => Number.isInteger(n))
          : [];

        setSelectedDays(new Set(nums));
      } catch (e) {
        setErr(e.message || "Error cargando turno.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const tol = Number(form.tolerancia_minutos);
    if (Number.isNaN(tol) || tol < 0) {
      setErr("tolerancia_minutos debe ser >= 0");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      dias_semana: diasSemanaPayload,
      tolerancia_minutos: tol,
      requiere_gps: !!form.requiere_gps,
      requiere_foto: !!form.requiere_foto,
    };

    try {
      const res = await fetch(`${API_BASE}/api/turnos/${id}/actualizar/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Error actualizando turno.");
      }
      alert("Turno actualizado.");
      navigate("/admin/turnos");
    } catch (e2) {
      setErr(e2.message || "Error actualizando turno.");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Editar Turno</h2>

      <div style={{ marginBottom: 10 }}>
        <Link to="/admin/turnos">← Volver</Link>
      </div>

      {empresaTexto && (
        <p>
          <b>Empresa:</b> {empresaTexto}
        </p>
      )}

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Nombre: </label>
          <input name="nombre" value={form.nombre} onChange={onChange} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Hora inicio: </label>
          <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={onChange} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Hora fin: </label>
          <input type="time" name="hora_fin" value={form.hora_fin} onChange={onChange} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Días de la semana:</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {DAYS.map((d) => (
              <button
                key={d.num}
                type="button"
                onClick={() => toggleDay(d.num)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background: selectedDays.has(d.num) ? "#ddd" : "white",
                }}
              >
                {d.nombre}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Tolerancia (min): </label>
          <input
            type="number"
            min="0"
            name="tolerancia_minutos"
            value={form.tolerancia_minutos}
            onChange={onChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            <input type="checkbox" name="requiere_gps" checked={form.requiere_gps} onChange={onChange} /> Requiere GPS
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            <input type="checkbox" name="requiere_foto" checked={form.requiere_foto} onChange={onChange} /> Requiere Foto
          </label>
        </div>

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
