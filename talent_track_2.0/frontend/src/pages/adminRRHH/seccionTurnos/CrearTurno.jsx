import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const DAYS = [
  { num: 1, nombre: "lunes" },
  { num: 2, nombre: "martes" },
  { num: 3, nombre: "miércoles" },
  { num: 4, nombre: "jueves" },
  { num: 5, nombre: "viernes" },
  { num: 6, nombre: "sábado" },
  { num: 7, nombre: "domingo" },
];

export default function CrearTurno() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    hora_inicio: "08:00",
    hora_fin: "17:00",
    tolerancia_minutos: 0,
    requiere_gps: false,
    requiere_foto: false,
  });

  const [diasSeleccionados, setDiasSeleccionados] = useState([1, 2, 3, 4, 5]); // por defecto lun-vie

  const diasPayload = useMemo(() => {
    const nums = [...new Set(diasSeleccionados)].sort((a, b) => a - b);
    return nums.map((n) => {
      const found = DAYS.find((d) => d.num === n);
      return found ? { num: found.num, nombre: found.nombre } : { num: n, nombre: `dia(${n})` };
    });
  }, [diasSeleccionados]);

  const toggleDia = (num) => {
    setDiasSeleccionados((prev) => (prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num]));
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
      return;
    }

    if (name === "tolerancia_minutos") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: n }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");
    if (!form.hora_inicio) return setErr("Hora inicio es obligatoria.");
    if (!form.hora_fin) return setErr("Hora fin es obligatoria.");
    if (!diasSeleccionados.length) return setErr("Debes seleccionar al menos 1 día.");
    if (Number(form.tolerancia_minutos) < 0) return setErr("Tolerancia no puede ser negativa.");

    const payload = {
      nombre: form.nombre.trim(),
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin,
      dias_semana: diasPayload, // FORMATO requerido
      tolerancia_minutos: Number(form.tolerancia_minutos),
      requiere_gps: Boolean(form.requiere_gps),
      requiere_foto: Boolean(form.requiere_foto),
    };

    try {
      const res = await apiFetch("/api/rrhh/turnos/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Turno creado.");
      navigate("/rrhh/turnos");
    } catch (e2) {
      setErr(e2?.message || "Error creando turno.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Turno</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit}>
          <div>
            <label>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={onChange} />
          </div>

          <div>
            <label>Hora inicio *</label>
            <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={onChange} />
          </div>

          <div>
            <label>Hora fin *</label>
            <input type="time" name="hora_fin" value={form.hora_fin} onChange={onChange} />
          </div>

          <div>
            <label>Días de la semana (mínimo 1) *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
              {DAYS.map((d) => (
                <label key={d.num} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={diasSeleccionados.includes(d.num)}
                    onChange={() => toggleDia(d.num)}
                  />
                  {d.nombre}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 12 }}>
            Seleccionados: <strong>{diasPayload.map((d) => d.nombre).join(", ") || "N/A"}</strong>
          </div>

          <div>
            <label>Tolerancia (min, entero = 0) *</label>
            <input
              type="number"
              name="tolerancia_minutos"
              min="0"
              step="1"
              value={form.tolerancia_minutos}
              onChange={onChange}
            />
          </div>

          <div>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" name="requiere_gps" checked={form.requiere_gps} onChange={onChange} />
              Requiere GPS
            </label>
          </div>

          <div>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" name="requiere_foto" checked={form.requiere_foto} onChange={onChange} />
              Requiere Foto
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/rrhh/turnos">Cancelar</Link> <button type="submit">Crear</button>
          </div>
        </form>
      </main>
    </div>
  );
}
