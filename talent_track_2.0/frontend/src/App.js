import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// imports de css y layouts...
import './assets/css/global.css';       // 1. Base
import './assets/css/header.css';       // 2. Header/Footer
import './assets/css/sidebar.css';      // 3. Sidebar (ya lo tenías)
import './assets/css/auth.css';         // 4. Login
import './assets/css/home.css';       // 4. Páginas Públicas
import './assets/css/dashboard.css';    // 5. Dashboard
import './assets/css/admin-ui.css';     // 6. Tablas y Botones
import 'boxicons/css/boxicons.min.css';
import Header from './components/Header';
import Footer from './components/Footer';

// Paginas Publicas
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';

// Paginas de Super Admin
import InicioSuperAdmin from './pages/superAdmin/InicioSuperAdmin';
import EmpresasSuperAdmin from './pages/superAdmin/EmpresasSuperAdmin';
import CrearEmpresaSuperAdmin from './pages/superAdmin/seccionEmpresas/CrearEmpresaSuperAdmin';
import DashboardSuperAdmin from './pages/superAdmin/DashboardSuperAdmin';
import VerEmpresaSuperAdmin from './pages/superAdmin/seccionEmpresas/VerEmpresaSuperAdmin';
import EditarEmpresaSuperAdmin from './pages/superAdmin/seccionEmpresas/EditarEmpresaSuperAdmin';

const PublicLayout = ({ children }) => {
  return (
    // CAMBIO IMPORTANTE:
    // 1. Cambiamos className="layout" por "public-layout".
    // 2. Quitamos el Header y Footer de aquí SI YA LOS TIENES DENTRO DE Home.jsx
    //    (Si Home.jsx ya tiene Header y Footer, bórralos de aquí para no tener duplicados).
    //    Si Home.jsx SOLO tiene el contenido central, déjalos aquí.
    
    <div className="public-layout">
      <Header />
      <main className="public-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          
          {/* ----- RUTAS PÚBLICAS ----- */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          
          {/* Login y Reset no llevan layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ----- RUTAS DE ADMINISTRACIÓN ----- */}
          {/* Aquí cargamos los componentes directamente, sin envolverlos en PrivateLayout */}
          <Route path="/admin/inicio" element={<InicioSuperAdmin />} />
          <Route path="/admin/dashboard" element={<DashboardSuperAdmin />} />
          <Route path="/admin/empresas" element={<EmpresasSuperAdmin />} />

          {/* Rutas con parámetros (ID)*/}
          <Route path="/admin/empresas/crear-empresa" element={<CrearEmpresaSuperAdmin />} />
          <Route path="/admin/empresas/ver-empresa/:id" element={<VerEmpresaSuperAdmin />} />
          <Route path="/admin/empresas/editar-empresa/:id" element={<EditarEmpresaSuperAdmin />} />

          {/* -------RUTA 404 (Cualquier otra cosa)-------- */}
          <Route path="*" element={<div style={{textAlign:'center', marginTop:'50px'}}><h1>404</h1><p>Página no encontrada</p></div>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;