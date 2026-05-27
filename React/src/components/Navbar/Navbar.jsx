import "./css/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Navbar({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  // referencia al menú
  const menuRef = useRef(null);

  const handleLogout = () => {
    setMenuOpen(false);

    localStorage.removeItem("token");
    setUser(null);

    navigate("/login");
  };

  // cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <div className="profile-menu" ref={menuRef}>
            <div
              className="profile-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <img
                src={
                  user.photo
                    ? `${user.photo}?t=${new Date().getTime()}`
                    : "/default-avatar.png"
                }
                alt="Perfil"
                className="profile-image"
              />

              <span className="profile-name">
                Hola, <strong>{user?.name || "Usuario"}</strong>
              </span>
            </div>

            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  Editar perfil
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => navigate("/dashboard")}
                >
                  Notificaciones
                </Link>

                <Link to="/settings" onClick={() => setMenuOpen(false)}>
                  Configuraciones
                </Link>

                <button className="logout-btn" onClick={handleLogout}>
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
