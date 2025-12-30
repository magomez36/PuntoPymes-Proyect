import React from "react";
import { useNavigate } from "react-router-dom";
import { getFullName, clearSession } from "../../services/session";

export default function InicioAuditor() {
  const navigate = useNavigate();
  const fullName = getFullName();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido{fullName ? `, ${fullName}` : ""}</h1>
      <p>Panel de Auditor: acceso de solo lectura para auditorías.</p>

      <button
        onClick={logout}
        style={{
          marginTop: "12px",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
