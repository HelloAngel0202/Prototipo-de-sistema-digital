import { useState } from 'react';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión con:", email);
    // Aquí tengo que conectarlo con el backend de angel.
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Bienvenido de nuevo</h2>
        <p className="auth-subtitle">Ingresa tus credenciales para acceder a tu panel</p>
        
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
          <a href="#recuperar" className="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" className="btn-auth">Entrar al Sistema</button>
        
        <p className="auth-switch">
          ¿Aún no tienes cuenta? <a href="#register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
}

export default Login;