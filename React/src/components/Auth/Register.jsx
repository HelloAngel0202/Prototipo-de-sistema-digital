import { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("cliente");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // ==========================
  // REGISTRO
  // ==========================

  const Register = async (e) => {
    e.preventDefault();

    try {
      // ==========================
      // ENVIAR DATOS AL BACKEND
      // ==========================

      const response = await axios.post(
        "http://localhost:3001/users/register",
        {
          name,
          email,
          role,
          password,
        },
      );

      // ==========================
      // ALERTA CÓDIGO
      // ==========================

      const result = await Swal.fire({
        title: "Verificación requerida",

        input: "text",

        inputLabel:
          "Introduce el código de 6 dígitos enviado a tu correo",

        inputPlaceholder: "Ej. 123456",

        showCancelButton: true,

        confirmButtonText: "Verificar",

        confirmButtonColor: "#2563eb",

        cancelButtonText: "Cancelar",

        inputValidator: (value) => {
          if (!value) {
            return "Debes escribir el código";
          }

          if (value.length !== 6) {
            return "El código debe tener 6 dígitos";
          }
        },
      });

      // ==========================
      // SI CANCELA
      // ==========================

      if (!result.isConfirmed) {
        return;
      }

      // ==========================
      // VERIFICAR CÓDIGO
      // ==========================

      const verifyResponse = await axios.post(
        "http://localhost:3001/users/verify-email",
        {
          email,
          code: result.value,
        },
      );

      // ==========================
      // ÉXITO
      // ==========================

      await Swal.fire({
        icon: "success",

        title: "Cuenta verificada",

        text:
          verifyResponse.data.message ||
          "Usuario creado correctamente",
      });

      // ==========================
      // LIMPIAR FORMULARIO
      // ==========================

      setName("");
      setEmail("");
      setRole("cliente");
      setPassword("");

      // ==========================
      // REDIRECCIÓN
      // ==========================

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error en registro/verificación:",
        error,
      );

      Swal.fire({
        icon: "error",

        title: "Oops...",

        text:
          error.response?.data?.message ||
          "Ocurrió un error",
      });
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-card"
        onSubmit={Register}
      >
        <h2>Crear Cuenta</h2>

        <p className="auth-subtitle">
          Únete a la red de préstamos más segura
        </p>

        {/* NOMBRE */}

        <div className="input-group">
          <label>Nombre Completo</label>

          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            value={name}
            required
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </div>

        {/* EMAIL */}

        <div className="input-group">
          <label>Correo Electrónico</label>

          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            required
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        {/* ROLE */}

        <div className="input-group">
          <label>
            ¿Qué deseas hacer?
          </label>

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="cliente">
              Solicitar un préstamo
              (Cliente)
            </option>

            <option value="prestamista">
              Ofrecer préstamos
              (Prestamista/Banco)
            </option>
          </select>
        </div>

        {/* PASSWORD */}

        <div className="input-group">
          <label>Contraseña</label>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            required
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        {/* BOTÓN */}

        <button
          type="submit"
          className="btn-auth"
        >
          Registrarse
        </button>

        {/* LOGIN */}

        <p className="auth-switch">
          ¿Ya tienes cuenta?

          <Link to={"/login"}>
            {" "}
            Inicia Sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;