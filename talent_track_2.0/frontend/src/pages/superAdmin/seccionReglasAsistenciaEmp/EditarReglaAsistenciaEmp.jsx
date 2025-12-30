import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  return (
    localStorage.getItem("tt_access") ||
    sessionStorage.getItem("tt_access") ||
    ""
  );
}

export default function EditarReglaAsistenciaEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [empresaLabel, setEmpresaLabel] = useState("");
  const [form, setForm] = useState({
    considera_tardanza_desde_min: 0,
    calculo_horas_extra: 1,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/${id}/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar");
        const data = await res.json();

        setEmpresaLabel(data.empresa_razon_social || "");
        setForm({
          considera_tardanza_desde_min: data.considera_tardanza_desde_min ?? 0,
          calculo_horas_extra: data.calculo_horas_extra ?? 1,
        });
      } catch (e) {
        alert(e.message || "Error");
        navigate("/admin/reglas-asistencia");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

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

    const payload = {
      considera_tardanza_desde_min: tardanza,
      calculo_horas_extra: parseInt(form.calculo_horas_extra, 10),
    };

    const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/${id}/actualizar/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      alert("Error actualizando (revisa consola)");
      return;
    }

    alert("Regla actualizada");
    navigate("/admin/reglas-asistencia");
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Editar Regla de Asistencia</h2>
      <p><b>Empresa:</b> {empresaLabel}</p>

      <form onSubmit={submit}>
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

        <button type="submit">Guardar cambios</button>{" "}
        <button type="button" onClick={() => navigate("/admin/reglas-asistencia")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
