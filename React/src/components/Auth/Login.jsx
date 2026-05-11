import { useState } from "react";
import "./Login.css";
import { Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function parseJwt(token) {
  // El token tiene 3 partes separadas por "."
  // [header].[payload].[signature]
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginssu, setLoginssu] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/users/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log("Respuesta del servidor:", response.data.token);
        if (response.data.token) {
          console.log(parseJwt(response.data.token));
          localStorage.setItem("token", response.data.token);
          Swal.fire({
            title: "Guardado",
            html: "¡Inicio de sesión exitoso!",
            icon: "success",
            timer: 3000,
          });
          setLoginssu(true);
          navigate("/dashboard");
        } else {
          setLoginssu(false);
        }
      })
      .catch((error) => {
        console.error("Error al enviar los datos:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Correo o contraseña incorrectos",
        });
        // Aquí puedes manejar el error, como mostrar un mensaje de error al usuario
      });
    // alert(`Correo: ${correo}\nContraseña: ${password}`);
    // Aquí luego puedes conectar con tu backend usando axios
  };

  return (
    <>
      {loginssu ? (
        <Navigate to="/dashboard" />
      ) : (
        <div className="auth-container">
          <form className="auth-card" onSubmit={handleLogin}>
            <h2>Bienvenido de nuevo</h2>
            <p className="auth-subtitle">
              Ingresa tus credenciales para acceder a tu panel
            </p>

            <div className="input-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#recuperar" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="btn-auth">
              Entrar al Sistema
            </button>

            <p className="auth-switch">
              ¿Aún no tienes cuenta? <Link to="/register">Registrate</Link>
            </p>
          </form>
        </div>
      )}
    </>
  );
}

export default Login;
