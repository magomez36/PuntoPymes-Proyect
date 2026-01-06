import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function CrearPuesto() {
  const navigate = useNavigate();

  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    unidad_id: "",
    nombre: "",
    descripcion: "",
    nivel: "",
    salario_referencial: "0.00",
  });

  const loadUnidades = async () => {
    const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadUnidades();
      } catch (e) {
        setErr(e?.message || "Error cargando unidades organizacionales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unidadOptions = useMemo(() => {
    return unidades.map((u) => ({
      id: u.id,
      label: `${u.nombre || "N/A"} (${u.tipo_label || "N/A"})`,
    }));
  }, [unidades]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "salario_referencial") {
      // Solo permitir >= 0
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onBlurSalary = () => {
    const n = Number(form.salario_referencial);
    if (Number.isNaN(n) || n < 0) return;
    setForm((p) => ({ ...p, salario_referencial: n.toFixed(2) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.unidad_id) return setErr("Selecciona una unidad organizacional.");
    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");
    if (!form.descripcion.trim()) return setErr("Descripción es obligatoria.");
    if (!form.nivel.trim()) return setErr("Nivel es obligatorio.");

    const nSalary = Number(form.salario_referencial);
    if (Number.isNaN(nSalary) || nSalary < 0) return setErr("Salario referencial inválido.");

    const payload = {
      unidad_id: Number(form.unidad_id),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      nivel: form.nivel.trim(),
      salario_referencial: nSalary.toFixed(2),
    };

    try {
      const res = await apiFetch("/api/rrhh/puestos/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Puesto creado.");
      navigate("/rrhh/puestos");
    } catch (e2) {
      setErr(e2?.message || "Error creando puesto.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Puesto</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Unidad Organizacional *</label>
              <select name="unidad_id" value={form.unidad_id} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {unidadOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
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
              <label>Nivel *</label>
              <input name="nivel" value={form.nivel} onChange={onChange} />
            </div>

            <div>
              <label>Salario referencial (= 0, 2 decimales) *</label>
              <input
                type="number"
                name="salario_referencial"
                min="0"
                step="0.01"
                value={form.salario_referencial}
                onChange={onChange}
                onBlur={onBlurSalary}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/rrhh/puestos">Cancelar</Link>{" "}
              <button type="submit">Crear</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
