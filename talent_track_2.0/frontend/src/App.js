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

// Superadmin - Empresas (tu estructura actual)
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
          {/* =========================
              RUTAS PÚBLICAS
          ========================== */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />

          {/* Login y Reset sin layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* =========================
              RUTAS PRIVADAS POR ROL
          ========================== */}
          <Route
            path="/superadmin/inicio"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <InicioSuperAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rrhh/inicio"
            element={
              <ProtectedRoute allowedRoles={["rrhh"]}>
                <InicioAdminRRHH />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/inicio"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <InicioManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/empleado/inicio"
            element={
              <ProtectedRoute allowedRoles={["empleado"]}>
                <InicioEmpleado />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/inicio"
            element={
              <ProtectedRoute allowedRoles={["auditor"]}>
                <InicioAuditor />
              </ProtectedRoute>
            }
          />

          {/* =========================
              SUPERADMIN - EPICA 2: EMPRESAS
          ========================== */}
          <Route
            path="/admin/empresas"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <Empresas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/empresas/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearEmpresa />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/empresas/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarEmpresa />
              </ProtectedRoute>
            }
          />

          {/* =========================
              SUPERADMIN - EPICA 3: UNIDADES ORGANIZACIONALES
          ========================== */}
        
          <Route
            path="/admin/unidades-organizacionales"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <UnidadesOrgEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/unidades-organizacionales/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearUnidadOrgEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/unidades-organizacionales/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarUnidadOrgEmp />
              </ProtectedRoute>
            }
          />

          {/* SUPERADMIN - Puestos (EPICA 4) */}
          <Route
            path="/admin/puestos"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <PuestosEmp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/puestos/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearPuestoEmp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/puestos/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarPuestoEmp />
              </ProtectedRoute>
            }
          />

            {/* SUPERADMIN - Turnos (EPICA 5) */}

          <Route
            path="/admin/turnos"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <TurnosEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/turnos/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearTurnoEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/turnos/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarTurnoEmp />
              </ProtectedRoute>
            }
          />

          {/* SUPERADMIN - Reglas de Asistencia (EPICA 6) */}

          <Route
            path="/admin/reglas-asistencia"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <ReglasAsistenciaEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reglas-asistencia/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearReglaAsistenciaEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reglas-asistencia/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarReglaAsistenciaEmp />
              </ProtectedRoute>
            }
          />

          {/* SUPERADMIN - Tipos de Ausencias (EPICA 7) */}

          <Route
            path="/admin/tipos-ausencias"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <TiposAusenciasEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tipos-ausencias/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearTipoAusenciaEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tipos-ausencias/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarTipoAusenciaEmp />
              </ProtectedRoute>
            }
          />
          {/* SUPERADMIN - KPIs (EPICA 8) */}
          
          <Route
            path="/admin/kpis"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <KPIsEmp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/kpis/crear"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <CrearKPI_Emp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/kpis/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <EditarKPI_Emp />
              </ProtectedRoute>
            }
          />


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
