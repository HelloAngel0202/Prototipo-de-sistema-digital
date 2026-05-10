import './ClientDashboard.css';
import { Link } from 'react-router-dom';
import OfferList from '../Offers/OfferList';

function ClientDashboard({ user }) {

  // Datos simulados hasta que se conecte con el backend de angel 
  const stats = {
    valoracion: 4.8,
    prestamosActivos: 1,
    proximoPago: "15 de Mayo, 2026",
    montoPendiente: "12,500.00"
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido de nuevo, <strong>{user.name}</strong></p>
      </header>

      {/* Sección de Tarjetas de Resumen */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div className="stat-info">
            <h3>Tu Valoración</h3>
            <p className="stat-value">{stats.valoracion} / 5.0</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-info">
            <h3>Próximo Pago</h3>
            <p className="stat-value">{stats.proximoPago}</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div className="stat-info">
            <h3>Deuda Actual</h3>
            <p className="stat-value">RD$ {stats.montoPendiente}</p>
          </div>
        </div>
      </section>

      {/* Sección de Acciones Principales */}
      <section className="main-actions">
        <div className="action-card primary">
          <h2>¿Necesitas financiamiento?</h2>
          <p>Crea una nueva solicitud anónima y recibe ofertas de bancos verificados.</p>
          <Link to="/new-request" className='btn-action'>Nueva Solicitud Anónima</Link>
        </div>
      </section>

      {/* Lista de Préstamos Activos (Simulada) */}
      <section className="active-loans">
        <h3>Tus Préstamos Activos</h3>
        <div className="loan-item">
          <div className="loan-header">
            <span className="bank-name">Banco Verificado A</span>
            <span className="status-badge approved">En curso</span>
          </div>
          <div className="loan-details">
            <p>Monto original: <strong>RD$ 30,000</strong></p>
            <p>Cuotas restantes: <strong>4 de 12</strong></p>
          </div>
        </div>
      </section>

      <OfferList />
    </div>
  );
}

export default ClientDashboard;