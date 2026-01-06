import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPOS = [
  { id: 1, label: "sede" },
  { id: 2, label: "area" },
  { id: 3, label: "depto" },
];

const ESTADOS = [
  { id: 1, label: "activa" },
  { id: 2, label: "inactiva" },
];

export default function EditarUnidadOrg() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    unidad_padre_id: "",
    nombre: "",
    tipo: 1,
    ubicacion: "",
    estado: 1,
  });

  const loadUnidades = async () => {
    const res = await apiFetch("/api/rrhh/unidades-organizacionales/");
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  const loadDetalle = async () => {
    const res = await apiFetch(`/api/rrhh/unidades-organizacionales/${id}/`);
    const data = await res.json();

    setForm({
      unidad_padre_id: data.unidad_padre_id ? String(data.unidad_padre_id) : "",
      nombre: data.nombre || "",
      tipo: Number(data.tipo || 1),
      ubicacion: data.ubicacion || "",
      estado: Number(data.estado || 1),
    });
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadUnidades();
        await loadDetalle();
      } catch (e) {
        setErr(e?.message || "Error cargando unidad.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const parentOptions = useMemo(() => {
    const myId = Number(id);
    return unidades
      .filter((u) => u.id !== myId) // no permitimos elegirse como padre desde el front (igual backend lo valida)
      .map((u) => ({ id: u.id, label: `${u.nombre || "N/A"} (${u.tipo_label})` }));
  }, [unidades, id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");
    if (!form.ubicacion.trim()) return setErr("Ubicación es obligatoria.");

    const payload = {
      nombre: form.nombre.trim(),
      tipo: Number(form.tipo),
      ubicacion: form.ubicacion.trim(),
      estado: Number(form.estado),
      unidad_padre_id: form.unidad_padre_id ? Number(form.unidad_padre_id) : null,
    };

    try {
      const res = await apiFetch(`/api/rrhh/unidades-organizacionales/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Unidad organizacional actualizada.");
      navigate("/rrhh/unidades-organizacionales");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Unidad Organizacional</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Unidad Padre (opcional)</label>
              <select name="unidad_padre_id" value={form.unidad_padre_id} onChange={onChange}>
                <option value="">-- Sin padre --</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

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
              <label>Ubicación *</label>
              <input name="ubicacion" value={form.ubicacion} onChange={onChange} />
            </div>

            <div>
              <label>Estado *</label>
              <select name="estado" value={form.estado} onChange={onChange}>
                {ESTADOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/rrhh/unidades-organizacionales">Cancelar</Link>{" "}
              <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
