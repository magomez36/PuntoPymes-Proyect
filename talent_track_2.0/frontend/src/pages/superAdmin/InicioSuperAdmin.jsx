import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../../services/session";

export default function InicioSuperAdmin() {
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido</h1>
      <p>Panel de SuperAdmin (configuración global, multiempresa).</p>

      {/* Navegación a la sección Empresas */}
      <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>

        <button onClick={() => navigate("/admin/empresas")}>Gestionar Empresas</button>

        <button onClick={() => navigate("/admin/unidades-organizacionales")}>Gestionar Unidades Organizacionales</button>

        <button onClick={() => navigate("/admin/puestos")}>Gestionar Puestos</button>

        <button onClick={() => navigate("/admin/turnos")}>Gestionar Turnos</button>

        <button onClick={() => navigate("/admin/reglas-asistencia")}>Gestionar Reglas de Asistencia</button>

        <button onClick={() => navigate("/admin/tipos-ausencias")}>Gestionar Tipos de Ausencias</button>

        <button onClick={() => navigate("/admin/kpis")}>Gestionar KPIs</button>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
}
