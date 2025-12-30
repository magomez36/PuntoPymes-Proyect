import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");
}

export default function EditarTipoAusenciaEmp() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [empresaNombre, setEmpresaNombre] = useState("");
  const [nombre, setNombre] = useState("");
  const [afectaSueldo, setAfectaSueldo] = useState(false);
  const [requiereSoporte, setRequiereSoporte] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await apiFetch(`${API}/tipos-ausencias/${id}/`, {
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el registro");
        const data = await res.json();

        setEmpresaNombre(data.empresa_nombre || "N/A");
        setNombre(data.nombre || "");
        setAfectaSueldo(Boolean(data.afecta_sueldo));
        setRequiereSoporte(Boolean(data.requiere_soporte));
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
        nombre: nombre.trim(),
        afecta_sueldo: Boolean(afectaSueldo),
        requiere_soporte: Boolean(requiereSoporte),
      };

      const res = await apiFetch(`${API}/tipos-ausencias/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "No se pudo actualizar");
      }

      alert("Actualizado correctamente");
      navigate("/admin/tipos-ausencias");
    } catch (e) {
      setErrorMsg(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Editar Tipo de Ausencia</h2>

      {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

      <p><b>Empresa:</b> {empresaNombre}</p>

      <form onSubmit={submit}>
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

        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>{" "}
        <button type="button" onClick={() => navigate("/admin/tipos-ausencias")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
