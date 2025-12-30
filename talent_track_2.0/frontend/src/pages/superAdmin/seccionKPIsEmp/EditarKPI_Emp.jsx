import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");
}

const UNIDADES = [
  { id: 1, label: "%" },
  { id: 2, label: "puntos" },
  { id: 3, label: "minutos" },
  { id: 4, label: "horas" },
];

const ORIGEN = [
  { id: 1, label: "asistencia" },
  { id: 2, label: "evaluacion" },
  { id: 3, label: "mixto" },
];

export default function EditarKPI_Emp() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [empresaNombre, setEmpresaNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidad, setUnidad] = useState(1);
  const [origenDatos, setOrigenDatos] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${API}/kpis/${id}/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el KPI");
        const data = await res.json();

        setEmpresaNombre(data.empresa_nombre || "N/A");
        setCodigo(data.codigo || "");
        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setUnidad(Number(data.unidad || 1));
        setOrigenDatos(Number(data.origen_datos || 1));
      } catch (e) {
        setErrorMsg(e.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        unidad: Number(unidad),
        origen_datos: Number(origenDatos),
      };

      const res = await fetch(`${API}/kpis/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "No se pudo actualizar KPI");
      }

      alert("KPI actualizado");
      navigate("/admin/kpis");
    } catch (e) {
      setErrorMsg(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Editar KPI</h2>

      {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
      <p><b>Empresa:</b> {empresaNombre}</p>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Código: </label>
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Nombre: </label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Descripción: </label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Unidad: </label>
          <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
            {UNIDADES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Origen de datos: </label>
          <select value={origenDatos} onChange={(e) => setOrigenDatos(e.target.value)}>
            {ORIGEN.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>{" "}
        <button type="button" onClick={() => navigate("/admin/kpis")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
