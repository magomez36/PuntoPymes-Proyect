import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const UNIDADES = [
  { id: 1, label: "%" },
  { id: 2, label: "puntos" },
  { id: 3, label: "minutos" },
  { id: 4, label: "horas" },
];

const ORIGENES = [
  { id: 1, label: "asistencia" },
  { id: 2, label: "evaluacion" },
  { id: 3, label: "mixto" },
];

export default function CrearKPI() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidad: 1,
    origen_datos: 1,
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.codigo.trim()) return setErr("Código es obligatorio.");
    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");
    if (!form.descripcion.trim()) return setErr("Descripción es obligatoria.");

    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      unidad: Number(form.unidad),
      origen_datos: Number(form.origen_datos),
      // formula NO se envía (backend lo deja NULL)
    };

    try {
      const res = await apiFetch("/api/rrhh/kpis/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("KPI creado.");
      navigate("/rrhh/kpis");
    } catch (e2) {
      setErr(e2?.message || "Error creando KPI.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear KPI</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit}>
          <div>
            <label>Código *</label>
            <input name="codigo" value={form.codigo} onChange={onChange} />
          </div>

          <div>
            <label>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={onChange} />
          </div>

          <div>
            <label>Descripción *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} />
          </div>

          <div>
            <label>Unidad *</label>
            <select name="unidad" value={form.unidad} onChange={onChange}>
              {UNIDADES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Origen datos *</label>
            <select name="origen_datos" value={form.origen_datos} onChange={onChange}>
              {ORIGENES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/rrhh/kpis">Cancelar</Link>{" "}
            <button type="submit">Crear</button>
          </div>
        </form>
      </main>
    </div>
  );
}
