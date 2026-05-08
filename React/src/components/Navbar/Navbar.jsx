import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {

    return (
        <header className='navbar'>
            <div className="navbar-logo">
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <h2>Gestor de prestamos</h2>
                </Link>
            </div>
            <nav className="navbar-links">
                <Link to="/">Inicio</Link>
                <a href="#information">Cómo funciona</a>
                <a href="#banks">Prestamistas</a>
            </nav>
            <div className="navbar-actions">
                <Link className='btn-login' to="/login">Iniciar Sesión</Link>
                <Link className='btn-register' to="/register">Registrarse</Link>
            </div>
        </header>
    );

}

export default Navbar;