import './Home.css';
import { Link } from 'react-router-dom';


function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <h1>Tu Préstamo, Tus Reglas, <span className="highlight">Tu Privacidad</span></h1>
        <p>
          La primera red social financiera donde tú decides quién ve tu información. 
          Solicita préstamos de forma anónima y recibe ofertas de bancos verificados.
        </p>
        <div className="hero-btns">
          <Link to="/register" className="btn-primary-home">Solicitar mi Préstamo</Link>
          <Link to="/login" className="btn-secondary-home">Explorar Ofertas</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="icon">🔒</div>
          <h3>100% Anónimo</h3>
          <p>Los bancos solo ven tu perfil financiero, no tu nombre ni tu cara, hasta que tú decidas.</p>
        </div>
        <div className="feature-card">
          <div className="icon">📊</div>
          <h3>Mejor Valoración</h3>
          <p>Paga a tiempo y construye una reputación que te dará acceso a mejores tasas.</p>
        </div>
        <div className="feature-card">
          <div className="icon">🤝</div>
          <h3>Tú Eliges</h3>
          <p>Recibe múltiples ofertas y acepta la que mejor se adapte a tus necesidades.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;