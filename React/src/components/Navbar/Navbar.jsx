import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";



function Navbar({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <h2>Gestor de prestamos</h2>
        </Link>
      </div>

      <nav className="navbar-links">
        <Link to="/">Inicio</Link>
        {user && <Link to="/dashboard">Mi Panel</Link>}
        <a href="#information">Cómo funciona</a>
        <a href="#banks">Prestamistas</a>
      </nav>

      <div className="navbar-actions">
        {user ? (
          <div className="profile-menu">
            <div
              className="profile-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <img
                src={user.photo || "https://i.pravatar.cc/40"}
                alt="Perfil"
                className="profile-image"
              />

              <span className="profile-name">
                Hola,{" "}
                <strong>{user?.name || user?.username || "Usuario"}</strong>
              </span>
            </div>

            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/profile">Editar perfil</Link>
                <Link to="/notifications">Notificaciones</Link>
                <Link to="/settings">Configuraciones</Link>

                <button
                  className="logout-btn"
                  onClick={() => window.location.reload()}
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Link className="btn-login" to="/login">
              Iniciar Sesión
            </Link>

            <Link className="btn-register" to="/register">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
