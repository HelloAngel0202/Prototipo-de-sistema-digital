
import { useState } from "react";
import "./Register.css";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";


function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('cliente');
    const [password, setPassword] = useState('');
    

  const Register = (e) => {
  e.preventDefault();
  axios
    .post("http://localhost:3001/users/register", {
      name,
      email,
      role,
      password,
    })
    .then((response) => {
      console.log("Respuesta del servidor:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
           
       
      }

      Swal.fire({
        title: "Guardado",
        html: response.data.message || "¡Registro exitoso!",
        icon: "success",
        timer: 3000,
        
      });
       <Navigate to="/" />
    })
    .catch((error) => {
      console.error("Error al enviar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo registrar el usuario",
      });
    });
};

    // datosUsuarios sera lo que se envie al backend para registrar
    // const datosUsuarios = {
    //     name,
    //     email,
    //     role,
    //     password
    // };

    return (
       <>
       
        <div className="auth-container">
            <form className="auth-card"  onSubmit={Register}>
                <h2>Crear Cuenta</h2>
                <p className="auth-subtitle">Únete a la red de préstamos más segura</p>

                <div className="input-group">
                    <label>Nombre Completo</label>
                    <input type="text" placeholder="Ej. Juan Pérez" value={name} required onChange={e => (setName(e.target.value))} />
                </div>

                <div className="input-group">
                    <label>Correo Electrónico</label>
                    <input type="email" placeholder="correo@ejemplo.com" value={email} required onChange={e => (setEmail(e.target.value))} />
                </div>

                <div className="input-group">
                    <label>¿Qué deseas hacer?</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="cliente">Solicitar un préstamo (Cliente)</option>
                        <option value="prestamista">Ofrecer préstamos (Prestamista/Banco)</option>
                    </select>
                </div>

                <div className="input-group">
                    <label>Contraseña</label>
                    <input type="password" placeholder="••••••••" value={password} required onChange={e => setPassword(e.target.value)} />
                </div>

                <button type="submit" className="btn-auth">Registrarse</button>

                <p className="auth-switch">
                    ¿Ya tienes cuenta? <Link to={"/login"}> Inicia Sesión</Link>
                </p>
            </form>
        </div>;
        
    
       </>
        );
}

export default Register;