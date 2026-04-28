import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../utils/api";
import "./login.css";

function Login() {

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🔥 SI YA HAY TOKEN → NO DEJAR ENTRAR AL LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const loginValue = correo.trim().toLowerCase();
    const passwordValue = password;

    if (!loginValue || !passwordValue) {
      setError("Correo y contraseña son obligatorios");
      return;
    }

    try {

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ correo: loginValue, password: passwordValue })
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.warn("Login response no es JSON:", parseError, text);
      }

      if (!res.ok) {
        setError(data.message || text || "Credenciales incorrectas ❌");
        return;
      }

      // 🔐 VALIDACIÓN EXTRA
      if (!data.token || !data.user) {
        setError("Respuesta inválida del servidor ❌");
        return;
      }

      // 🔐 GUARDAR TOKEN
      localStorage.setItem("token", data.token);

      // 🔥 NORMALIZAR USUARIO (IMPORTANTE CON SUPABASE)
      const userData = {
        id: data.user.empleado_id || data.user.id,
        rol: data.user.rol,
        nombre: data.user.nombre
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // 🔥 REDIRECCIÓN SEGÚN ROL (MEJORA PRO)
      if (userData.rol === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/empleado"); // opcional si tienes vista empleado
      }

    } catch (err) {
      console.error("ERROR LOGIN:", err);
      setError("No se pudo conectar con el servidor ❌");
    }
  };

  return (

    <div className="login-container">

      <form className="login-box" onSubmit={handleLogin}>

        <h2>Iniciar Sesión</h2>

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Ingresar</button>

        <p style={{ marginTop: "10px" }}>
          <a href="/forgot-password" style={{ color: "#007bff", textDecoration: "none" }}>
            ¿Olvidaste tu contraseña?
          </a>
        </p>

      </form>

    </div>

  );
}

export default Login;