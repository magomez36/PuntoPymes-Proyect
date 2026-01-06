import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function EditarTipoaAusencia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    afecta_sueldo: false,
    requiere_soporte: false,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/rrhh/tipos-ausencias/${id}/`);
      const data = await res.json();

      setForm({
        nombre: data.nombre || "",
        afecta_sueldo: Boolean(data.afecta_sueldo),
        requiere_soporte: Boolean(data.requiere_soporte),
      });
    } catch (e) {
      setErr(e?.message || "Error cargando tipo de ausencia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

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
      const res = await apiFetch(`/api/rrhh/tipos-ausencias/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Tipo de ausencia actualizado.");
      navigate("/rrhh/tipos-ausencias");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando tipo de ausencia.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Tipo de Ausencia</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
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
              <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
