import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  return (
    localStorage.getItem("tt_access") ||
    sessionStorage.getItem("tt_access") ||
    ""
  );
}

export default function CrearReglaAsistenciaEmp() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [form, setForm] = useState({
    empresa: "",
    considera_tardanza_desde_min: 0,
    calculo_horas_extra: 1, // 1 diario, 2 semanal
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/listado-empresas/`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      const data = await res.json();
      setEmpresas(data);
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const tardanza = parseInt(form.considera_tardanza_desde_min, 10);
    if (Number.isNaN(tardanza) || tardanza < 0) {
      alert("considera_tardanza_desde_min debe ser >= 0");
      return;
    }

    if (!form.empresa) {
      alert("Selecciona una empresa");
      return;
    }

    const payload = {
      empresa: parseInt(form.empresa, 10),
      considera_tardanza_desde_min: tardanza,
      calculo_horas_extra: parseInt(form.calculo_horas_extra, 10),
      // geocerca e ip_permitidas NO se envían (backend los pone NULL)
    };

    const res = await fetch(`${API_BASE}/api/reglas-asistencia/crear/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      alert("Error creando regla (revisa consola)");
      return;
    }

    alert("Regla creada");
    navigate("/admin/reglas-asistencia");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Crear Regla de Asistencia</h2>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Empresa: </label>
          <select name="empresa" value={form.empresa} onChange={onChange}>
            <option value="">-- Selecciona --</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razon_social}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>considera_tardanza_desde_min: </label>
          <input
            type="number"
            name="considera_tardanza_desde_min"
            min="0"
            value={form.considera_tardanza_desde_min}
            onChange={onChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>calculo_horas_extra: </label>
          <select
            name="calculo_horas_extra"
            value={form.calculo_horas_extra}
            onChange={onChange}
          >
            <option value="1">Tope diario</option>
            <option value="2">Tope semanal</option>
          </select>
        </div>

        <button type="submit">Guardar</button>{" "}
        <button type="button" onClick={() => navigate("/admin/reglas-asistencia")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
