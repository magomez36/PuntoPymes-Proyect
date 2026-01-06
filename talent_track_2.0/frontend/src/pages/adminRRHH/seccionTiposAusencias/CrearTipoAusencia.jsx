import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function CrearTipoAusencia() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    afecta_sueldo: false,
    requiere_soporte: false,
  });

  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");

    const payload = {
      nombre: form.nombre.trim(),
      afecta_sueldo: Boolean(form.afecta_sueldo),
      requiere_soporte: Boolean(form.requiere_soporte),
    };

    try {
      const res = await apiFetch("/api/rrhh/tipos-ausencias/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Tipo de ausencia creado.");
      navigate("/rrhh/tipos-ausencias");
    } catch (e2) {
      setErr(e2?.message || "Error creando tipo de ausencia.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Tipo de Ausencia</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit}>
          <div>
            <label>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={onChange} />
          </div>

          <div>
            <label>
              <input type="checkbox" name="afecta_sueldo" checked={form.afecta_sueldo} onChange={onChange} /> Afecta sueldo
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="requiere_soporte"
                checked={form.requiere_soporte}
                onChange={onChange}
              />{" "}
              Requiere soporte
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/rrhh/tipos-ausencias">Cancelar</Link>{" "}
            <button type="submit">Crear</button>
          </div>
        </form>
      </main>
    </div>
  );
}
