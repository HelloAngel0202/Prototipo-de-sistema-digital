import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar({ user }) {

    return (
        <header className='navbar'>
            <div className="navbar-logo">
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
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
                    <div className="user-profile-nav">
                        <span>Hola, <strong>{user.name}</strong></span>
                        <button className='btn-logout' onClick={() => window.location.reload()}> Salir </button>
                    </div>
                ) : (
                    <div>
                        <Link className='btn-login' to="/login">Iniciar Sesión</Link>
                        <Link className='btn-register' to="/register">Registrarse</Link>
                    </div>
                )}
            </div >
        </header >
    );

}

export default Navbar;