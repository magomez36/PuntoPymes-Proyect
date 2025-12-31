import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// CSS / Layout
import "./assets/css/global.css";
import "./assets/css/header.css";
import "./assets/css/sidebar.css";
import "./assets/css/auth.css";
import "./assets/css/home.css";
import "./assets/css/dashboard.css";
import "./assets/css/admin-ui.css";
import "boxicons/css/boxicons.min.css";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Páginas públicas
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";

// Páginas por rol (Inicio)
import InicioSuperAdmin from "./pages/superAdmin/InicioSuperAdmin";
import InicioAdminRRHH from "./pages/adminRRHH/InicioAdminRRHH";
import InicioManager from "./pages/manager/InicioManager";
import InicioEmpleado from "./pages/empleado/InicioEmpleado";
import InicioAuditor from "./pages/auditor/InicioAuditor";

// Superadmin - (Estructura actual)
import Empresas from "./pages/superAdmin/seccionEmpresas/Empresas";
import CrearEmpresa from "./pages/superAdmin/seccionEmpresas/CrearEmpresa";
import EditarEmpresa from "./pages/superAdmin/seccionEmpresas/EditarEmpresa";

import UnidadesOrgEmp from "./pages/superAdmin/seccionUnidadesOrgEmp/UnidadesOrgEmp";
import CrearUnidadOrgEmp from "./pages/superAdmin/seccionUnidadesOrgEmp/CrearUnidadOrgEmp";
import EditarUnidadOrgEmp from "./pages/superAdmin/seccionUnidadesOrgEmp/EditarUnidadOrgEmp";

import PuestosEmp from "./pages/superAdmin/seccionPuestosEmp/PuestosEmp";
import CrearPuestoEmp from "./pages/superAdmin/seccionPuestosEmp/CrearPuestoEmp";
import EditarPuestoEmp from "./pages/superAdmin/seccionPuestosEmp/EditarPuestoEmp";

import TurnosEmp from "./pages/superAdmin/seccionTurnosEmp/TurnosEmp";
import CrearTurnoEmp from "./pages/superAdmin/seccionTurnosEmp/CrearTurnoEmp";
import EditarTurnoEmp from "./pages/superAdmin/seccionTurnosEmp/EditarTurnoEmp";

import ReglasAsistenciaEmp from "./pages/superAdmin/seccionReglasAsistenciaEmp/ReglasAsistenciaEmp";
import CrearReglaAsistenciaEmp from "./pages/superAdmin/seccionReglasAsistenciaEmp/CrearReglaAsistenciaEmp";
import EditarReglaAsistenciaEmp from "./pages/superAdmin/seccionReglasAsistenciaEmp/EditarReglaAsistenciaEmp";

import TiposAusenciasEmp from "./pages/superAdmin/seccionTiposAusenciasEmp/TiposAusenciasEmp";
import CrearTipoAusenciaEmp from "./pages/superAdmin/seccionTiposAusenciasEmp/CrearTipoAusenciaEmp";
import EditarTipoAusenciaEmp from "./pages/superAdmin/seccionTiposAusenciasEmp/EditarTipoAusenciaEmp";

import KPIsEmp from "./pages/superAdmin/seccionKPIsEmp/KPIsEmp";
import CrearKPI_Emp from "./pages/superAdmin/seccionKPIsEmp/CrearKPI_Emp";
import EditarKPI_Emp from "./pages/superAdmin/seccionKPIsEmp/EditarKPI_Emp";

import ReportesProgramados from "./pages/superAdmin/seccionReportesProgramados/ReportesProgramados";
import CrearReporteProgramado from "./pages/superAdmin/seccionReportesProgramados/CrearReporteProgramado";
import EditarReporteProgramado from "./pages/superAdmin/seccionReportesProgramados/EditarReporteProgramado";

import RolesEmp from "./pages/superAdmin/seccionRolEmp/RolesEmp";
import CrearRolEmp from "./pages/superAdmin/seccionRolEmp/CrearRolEmp";
import EditarRolEmp from "./pages/superAdmin/seccionRolEmp/EditarRolEmp";

import UsuariosEmp from "./pages/superAdmin/seccionUsuariosEmp/UsuariosEmp";
import CrearUsuarioEmp from "./pages/superAdmin/seccionUsuariosEmp/CrearUsuarioEmp";
import EditarUsuarioEmp from "./pages/superAdmin/seccionUsuariosEmp/EditarUsuarioEmp";

import EmpleadosEmp from "./pages/superAdmin/seccionEmpleadosEmp/EmpleadosEmp";
import CrearEmpleadoEmp from "./pages/superAdmin/seccionEmpleadosEmp/CrearEmpleadoEmp";
import EditarEmpleadoEmp from "./pages/superAdmin/seccionEmpleadosEmp/EditarEmpleadoEmp";

import PermisosRolEmp from "./pages/superAdmin/seccionPermisosRolEmp/PermisosRolEmp";
import CrearPermisoRolEmp from "./pages/superAdmin/seccionPermisosRolEmp/CrearPermisoRolEmp";
import EditarPermisoRolEmp from "./pages/superAdmin/seccionPermisosRolEmp/EditarPermisoRolEmp";

import PlantillasKPIsEmp from "./pages/superAdmin/seccionPlantillasKPIsEmp/PlantillasKPIsEmp";
import CrearPlantillaKPI_Emp from "./pages/superAdmin/seccionPlantillasKPIsEmp/CrearPlantillaKPI_Emp";
import EditarPlantillaKPI_Emp from "./pages/superAdmin/seccionPlantillasKPIsEmp/EditarPlantillaKPI_Emp";

// Guard
import ProtectedRoute from "./routes/ProtectedRoute";

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Header />
      <main className="public-content">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* ======== RUTAS PÚBLICAS ======== */}

          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ======== RUTAS PRIVADAS POR ROL ======== */}

          {/* EPICA 1 - Login Roles */}

          <Route path="/superadmin/inicio" element={<ProtectedRoute allowedRoles={["superadmin"]}><InicioSuperAdmin /></ProtectedRoute>} />
          <Route path="/rrhh/inicio" element={<ProtectedRoute allowedRoles={["rrhh"]}><InicioAdminRRHH /></ProtectedRoute>} />
          <Route path="/manager/inicio" element={<ProtectedRoute allowedRoles={["manager"]}><InicioManager /></ProtectedRoute>} />
          <Route path="/empleado/inicio" element={<ProtectedRoute allowedRoles={["empleado"]}><InicioEmpleado /></ProtectedRoute>} />
          <Route path="/auditor/inicio" element={<ProtectedRoute allowedRoles={["auditor"]}><InicioAuditor /></ProtectedRoute>} />

          {/* ======== RUTAS SUPERADMIN ======== */}

          {/* EPICA 2 - Empresas */}
          <Route path="/admin/empresas" element={<ProtectedRoute allowedRoles={["superadmin"]}><Empresas /></ProtectedRoute>} />
          <Route path="/admin/empresas/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearEmpresa /></ProtectedRoute>} />
          <Route path="/admin/empresas/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarEmpresa /></ProtectedRoute>} />

          {/* EPICA 3 - Unidades Organizacionales Empresa */}
          <Route path="/admin/unidades-organizacionales" element={<ProtectedRoute allowedRoles={["superadmin"]}><UnidadesOrgEmp /></ProtectedRoute>} />
          <Route path="/admin/unidades-organizacionales/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearUnidadOrgEmp /></ProtectedRoute>} />
          <Route path="/admin/unidades-organizacionales/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarUnidadOrgEmp /></ProtectedRoute>} />

          {/* EPICA 4 - Puestos Empresa */}
          <Route path="/admin/puestos" element={<ProtectedRoute allowedRoles={["superadmin"]}><PuestosEmp /></ProtectedRoute>} />
          <Route path="/admin/puestos/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearPuestoEmp /></ProtectedRoute>} />
          <Route path="/admin/puestos/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarPuestoEmp /></ProtectedRoute>} />

          {/* EPICA 5 - Turnos Empresa */}
          <Route path="/admin/turnos" element={<ProtectedRoute allowedRoles={["superadmin"]}><TurnosEmp /></ProtectedRoute>} />
          <Route path="/admin/turnos/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearTurnoEmp /></ProtectedRoute>} />
          <Route path="/admin/turnos/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarTurnoEmp /></ProtectedRoute>} />

          {/* EPICA 6 - Reglas de Asistencia */}
          <Route path="/admin/reglas-asistencia" element={<ProtectedRoute allowedRoles={["superadmin"]}><ReglasAsistenciaEmp /></ProtectedRoute>} />
          <Route path="/admin/reglas-asistencia/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearReglaAsistenciaEmp /></ProtectedRoute>} />
          <Route path="/admin/reglas-asistencia/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarReglaAsistenciaEmp /></ProtectedRoute>} />

          {/* EPICA 7 - Tipos de Ausencias */}
          <Route path="/admin/tipos-ausencias" element={<ProtectedRoute allowedRoles={["superadmin"]}><TiposAusenciasEmp /></ProtectedRoute>} />
          <Route path="/admin/tipos-ausencias/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearTipoAusenciaEmp /></ProtectedRoute>} />
          <Route path="/admin/tipos-ausencias/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarTipoAusenciaEmp /></ProtectedRoute>} />

          {/* EPICA 8 - KPIs */}
          <Route path="/admin/kpis" element={<ProtectedRoute allowedRoles={["superadmin"]}><KPIsEmp /></ProtectedRoute>} />
          <Route path="/admin/kpis/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearKPI_Emp /></ProtectedRoute>} />
          <Route path="/admin/kpis/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarKPI_Emp /></ProtectedRoute>} />

          {/* EPICA 9 - Reportes Programados */}
          <Route path="/admin/reportes-programados" element={<ProtectedRoute allowedRoles={["superadmin"]}><ReportesProgramados /></ProtectedRoute>} />
          <Route path="/admin/reportes-programados/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearReporteProgramado /></ProtectedRoute>} />
          <Route path="/admin/reportes-programados/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarReporteProgramado /></ProtectedRoute>} />

          {/* EPICA 10 - Roles Empresa */}
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["superadmin"]}><RolesEmp /></ProtectedRoute>} />
          <Route path="/admin/roles/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearRolEmp /></ProtectedRoute>} />
          <Route path="/admin/roles/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarRolEmp /></ProtectedRoute>} />

          {/* EPICA 11 - Usuarios Empresa */}
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={["superadmin"]}><UsuariosEmp /></ProtectedRoute>} />
          <Route path="/admin/usuarios/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearUsuarioEmp /></ProtectedRoute>} />
          <Route path="/admin/usuarios/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarUsuarioEmp /></ProtectedRoute>} />

          {/* EPICA 12 - Empleados Empresa */}
          <Route path="/admin/empleados" element={<ProtectedRoute allowedRoles={["superadmin"]}><EmpleadosEmp /></ProtectedRoute>} />
          <Route path="/admin/empleados/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearEmpleadoEmp /></ProtectedRoute>} />
          <Route path="/admin/empleados/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarEmpleadoEmp /></ProtectedRoute>} />

          {/* EPICA 13 - Permisos por Rol */}
          <Route path="/admin/permisos" element={<ProtectedRoute allowedRoles={["superadmin"]}><PermisosRolEmp /></ProtectedRoute>} />
          <Route path="/admin/permisos/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearPermisoRolEmp /></ProtectedRoute>} />
          <Route path="/admin/permisos/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarPermisoRolEmp /></ProtectedRoute>} />

          {/* EPICA 14 - Plantillas KPI */}
          <Route path="/admin/plantillas-kpi" element={<ProtectedRoute allowedRoles={["superadmin"]}><PlantillasKPIsEmp /></ProtectedRoute>} />
          <Route path="/admin/plantillas-kpi/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearPlantillaKPI_Emp /></ProtectedRoute>} />
          <Route path="/admin/plantillas-kpi/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarPlantillaKPI_Emp /></ProtectedRoute>} />


          {/* ======== RUTAS EMPLEADO ======== */}



          {/* ======== RUTAS ADMIN RRHH ======== */}



          {/* ======== RUTAS MANAGER ======== */}



          {/* ======== RUTAS AUDITOR ======== */} 




          {/* =========================
              COMPATIBILIDAD (rutas viejas)
              Para no romper enlaces existentes
          ========================== */}
          <Route path="/admin/inicio" element={<Navigate to="/superadmin/inicio" replace />} />

          {/* Si tu InicioSuperAdmin tiene botón que iba a /admin/empresas/crear-empresa */}
          <Route path="/admin/empresas/crear-empresa" element={<Navigate to="/admin/empresas/crear" replace />} />

          {/* Si tenías /admin/empresas/editar-empresa/:id */}
          <Route
            path="/admin/empresas/editar-empresa/:id"
            element={<Navigate to="/admin/empresas/editar/:id" replace />}
          />

          {/* =========================
              404
          ========================== */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h1>404</h1>
                <p>Página no encontrada</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
