import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";

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

export default function CrearKPI_Emp() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidad, setUnidad] = useState(1);
  const [origenDatos, setOrigenDatos] = useState(1);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const res = await apiFetch(`${API}/listado-empresas/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        if (!res.ok) throw new Error("No se pudieron cargar empresas");
        const data = await res.json();
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrorMsg(e.message || "Error cargando empresas");
      }
    };
    loadEmpresas();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!empresaId) return setErrorMsg("Selecciona una empresa.");

    setLoading(true);
    try {
      const payload = {
        empresa: Number(empresaId),
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        unidad: Number(unidad),
        origen_datos: Number(origenDatos),
        // formula NO va, back lo deja NULL
      };

      const res = await apiFetch(`${API}/kpis/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "No se pudo crear KPI");
      }

      alert("KPI creado");
      navigate("/admin/kpis");
    } catch (e) {
      setErrorMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Crear KPI</h2>
      {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Empresa: </label>
          <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
            <option value="">-- Seleccionar --</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razon_social}
              </option>
            ))}
          </select>
        </div>

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

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear"}
        </button>{" "}
        <button type="button" onClick={() => navigate("/admin/kpis")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
