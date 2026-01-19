import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Importamos el logo completo para el encabezado
import logoFull from "../../assets/img/talenTrackLogo_SVG.svg";
// Importamos el icono pequeño para el fondo (marca de agua)
import logoIcon from "../../assets/img/talentrack_small.svg";
import "boxicons/css/boxicons.min.css";

// Importamos el nuevo CSS
import "../../assets/css/login.css";

const API_BASE = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const togglePassword = () => setShowPassword((s) => !s);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getStorage = () => (formData.remember ? localStorage : sessionStorage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      // 1. Petición al Backend
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Credenciales inválidas.");
      }

      // 2. Procesar respuesta
      const data = await res.json();
      const { access, refresh, context } = data;

      if (!access || !refresh || !context?.redirect_to) {
        throw new Error("Respuesta incompleta del servidor.");
      }

      // 3. Guardar en Storage
      const storage = getStorage();
      const otherStorage = storage === localStorage ? sessionStorage : localStorage;
      
      // Limpiar storage contrario para evitar conflictos
      ["tt_access", "tt_refresh", "tt_context", "tt_full_name"].forEach((k) => otherStorage.removeItem(k));

      storage.setItem("tt_access", access);
      storage.setItem("tt_refresh", refresh);
      storage.setItem("tt_context", JSON.stringify(context));

      // 4. Obtener nombre del usuario (Opcional, para mostrar en dashboard)
      const meRes = await fetch(`${API_BASE}/api/auth/me/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${access}` },
      });

      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.full_name) storage.setItem("tt_full_name", me.full_name);
      }

      // 5. Redirigir
      navigate(context.redirect_to, { replace: true });

    } catch (err) {
      setErrorMsg(err?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* IMAGEN DE FONDO (MARCA DE AGUA) - USAMOS EL ICONO PEQUEÑO */}
      <img src={logoIcon} alt="" className="background-watermark" />

      <div className="login-container">
        {/* LOGO Y CABECERA - USAMOS EL LOGO COMPLETO */}
        <div className="logo-container">
          <img src={logoFull} alt="TalentTrack Logo" className="logo-image" />
          <h1 className="login-title">Bienvenido de nuevo</h1>
          <p className="login-subtitle">Accede a tu panel de control RH</p>
        </div>

        {/* MENSAJE ERROR */}
        {errorMsg && (
          <div style={{
            background: "rgba(254, 226, 226, 0.9)", 
            color: "#b91c1c", 
            padding: "10px", /* Reducido un poco */
            borderRadius: "12px", 
            marginBottom: "20px", 
            fontSize: "0.85rem",
            border: "1px solid #fca5a5", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            textAlign: "left"
          }}>
            <i className='bx bx-error-circle' style={{fontSize: '1.1rem'}}></i>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* EMAIL */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-wrapper">
              <i className="bx bxs-envelope input-icon"></i> 
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="ejemplo@talenttrack.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <i className="bx bxs-lock-alt input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <i
                className={`bx ${showPassword ? "bx-show" : "bx-hide"} password-toggle`}
                onClick={togglePassword}
              ></i>
            </div>
          </div>

          {/* OPCIONES (Recordar / Olvidé) */}
          <div className="form-options">
            <label className="checkbox-wrapper" htmlFor="remember">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <span className="checkbox-label">Recordar sesión</span>
            </label>
            
            <Link to="/reset-password" className="forgot-password">
              ¿Olvidaste contraseña?
            </Link>
          </div>

          {/* BOTÓN LOGIN */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <i className='bx bx-loader-alt bx-spin'></i> : "Iniciar Sesión"}
          </button>

        </form>

        {/* FOOTER LINKS */}
        <div className="login-footer-row">
            <Link to="/" className="footer-link">
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        <div className="copyright-text">
          © 2025 Talent Track. Todos los derechos reservados.
        </div>

      </div>
    </div>
  );
};

export default Login;