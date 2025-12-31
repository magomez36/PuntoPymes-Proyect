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

        <button onClick={() => navigate("/admin/empresas")}>Empresas</button>

        <button onClick={() => navigate("/admin/unidades-organizacionales")}>Unidades Organizacionales</button>

        <button onClick={() => navigate("/admin/puestos")}>Puestos</button>

        <button onClick={() => navigate("/admin/turnos")}>Turnos</button>

        <button onClick={() => navigate("/admin/empleados")}>Empleados</button>

        <button onClick={() => navigate("/admin/reglas-asistencia")}>Reglas de Asistencia</button>

        <button onClick={() => navigate("/admin/tipos-ausencias")}>Tipos de Ausencias</button>

        <button onClick={() => navigate("/admin/kpis")}>KPIs</button>

        <button onClick={() => navigate("/admin/plantillas-kpi")}>Plantillas KPI</button>

        <button onClick={() => navigate("/admin/reportes-programados")}>Reportes Programados</button>

        <button onClick={() => navigate("/admin/usuarios")}>Usuarios</button>

        <button onClick={() => navigate("/admin/roles")}>Roles</button> 

        <button onClick={() => navigate("/admin/permisos")}>Permisos</button>

        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
}
