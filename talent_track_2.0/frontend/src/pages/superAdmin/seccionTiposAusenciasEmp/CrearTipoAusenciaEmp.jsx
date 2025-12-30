import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");
}

export default function CrearTipoAusenciaEmp() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [nombre, setNombre] = useState("");
  const [afectaSueldo, setAfectaSueldo] = useState(false);
  const [requiereSoporte, setRequiereSoporte] = useState(false);

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

    if (!empresaId) {
      setErrorMsg("Selecciona una empresa.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        empresa: Number(empresaId),
        nombre: nombre.trim(),
        afecta_sueldo: Boolean(afectaSueldo),
        requiere_soporte: Boolean(requiereSoporte),
      };

      const res = await apiFetch(`${API}/tipos-ausencias/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "No se pudo crear");
      }

      alert("Tipo de ausencia creado");
      navigate("/admin/tipos-ausencias");
    } catch (e) {
      setErrorMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Crear Tipo de Ausencia</h2>

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
          <label>Nombre: </label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={afectaSueldo}
              onChange={(e) => setAfectaSueldo(e.target.checked)}
            />
            {" "}Afecta sueldo
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={requiereSoporte}
              onChange={(e) => setRequiereSoporte(e.target.checked)}
            />
            {" "}Requiere soporte
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Crear"}
        </button>{" "}
        <button type="button" onClick={() => navigate("/admin/tipos-ausencias")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
