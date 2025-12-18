import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// imports de css y componentes...
import './assets/css/styles.css';
import Header from './components/Header';
import Home from './pages/public/Home';
import Footer from './components/Footer';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';

const PublicLayout = ({ children }) => {
  return (
    // OJO: Cambié "public-layout" por "layout" porque en tu CSS original
    // la clase que tiene los estilos se llama ".layout".
    <div className="layout">
      <Header />
      <main className="main-content">
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
          {/* 1. HOME: SÍ lleva PublicLayout (queremos menú y footer) */}
          <Route 
            path="/" 
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            } 
          />

          {/* 2. LOGIN: NO lleva PublicLayout (queremos pantalla limpia) */}
          {/* Fíjate que aquí quité las etiquetas <PublicLayout> */}
          <Route path="/login" element={<Login />} />

          {/* 3. RESET PASSWORD: NO lleva PublicLayout */}
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;