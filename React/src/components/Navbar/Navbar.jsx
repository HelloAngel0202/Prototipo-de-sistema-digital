import './Navbar.css';

function Navbar() {

    return (
        <header className='navbar'>
            <div className="navbar-logo">
                {/* Aqui poner el logo que usaremos en la pagina */}
                <h2>Gestor de préstamos</h2>
            </div>
            <nav className="navbar-links">
                <a href="#Dashboard">Inicio</a>
                <a href="#information">Cómo funciona</a>
                <a href="#banks">Prestamistas</a>
            </nav>
            <div className="navbar-actions">
                <button className='btn-login'>Iniciar Sesión</button>
                <button className='btn-register'>Registrarse</button>
            </div>
        </header>
    );

}

export default Navbar;