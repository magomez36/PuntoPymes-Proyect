import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function EditarTurno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    hora_inicio: "08:00",
    hora_fin: "17:00",
    tolerancia_minutos: 0,
    requiere_gps: false,
    requiere_foto: false,
  });

  const [diasSeleccionados, setDiasSeleccionados] = useState([]);

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

  const loadDetalle = async () => {
    const res = await apiFetch(`/api/rrhh/turnos/${id}/`);
    const data = await res.json();

    setForm({
      nombre: data.nombre || "",
      hora_inicio: data.hora_inicio || "08:00",
      hora_fin: data.hora_fin || "17:00",
      tolerancia_minutos: Number(data.tolerancia_minutos ?? 0),
      requiere_gps: Boolean(data.requiere_gps),
      requiere_foto: Boolean(data.requiere_foto),
    });

    const raw = Array.isArray(data.dias_semana) ? data.dias_semana : [];
    const nums = raw
      .filter((x) => x && typeof x === "object" && x.num)
      .map((x) => Number(x.num))
      .filter((n) => !Number.isNaN(n));

    setDiasSeleccionados([...new Set(nums)].sort((a, b) => a - b));
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadDetalle();
      } catch (e) {
        setErr(e?.message || "Error cargando turno.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

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
      dias_semana: diasPayload,
      tolerancia_minutos: Number(form.tolerancia_minutos),
      requiere_gps: Boolean(form.requiere_gps),
      requiere_foto: Boolean(form.requiere_foto),
    };

    try {
      const res = await apiFetch(`/api/rrhh/turnos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Turno actualizado.");
      navigate("/rrhh/turnos");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando turno.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Turno</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
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
              <Link to="/rrhh/turnos">Cancelar</Link> <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
