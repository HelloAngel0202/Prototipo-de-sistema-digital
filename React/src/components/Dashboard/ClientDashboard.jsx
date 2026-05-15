import './ClientDashboard.css';
import { Link } from 'react-router-dom';
import OfferList from '../Offers/OfferList';
import axios from 'axios';
import { useEffect, useState } from 'react';

function ClientDashboard({ user }) {
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lenderInfos, setLenderInfos] = useState({}); // Cambiado a objeto para múltiples lenders
  const [loading, setLoading] = useState(true);

  const getLenderInfo = async (lender_id) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users/lender-info?lender_id=${lender_id}`
      );
      console.log("Información del prestamista obtenida:", response.data);
      setLenderInfos(prev => ({ ...prev, [lender_id]: response.data })); // Almacena por id
    } catch (error) {
      console.error("Error obteniendo información del prestamista:", error);
    }
  };

  useEffect(() => {
    const obtenerPublicaciones = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3001/users/my-publications?user_id=${user.id}`,
        );
        setPublications(response.data);
      } catch (error) {
        console.error('Error obteniendo tus solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };
    const notifications = async (client_id) => {
      try {
        const response = await axios.get(
          `http://localhost:3001/users/notifications?client_id=${user.id}`
        ).then((response) => {
          setNotifications(response.data);
        });

        // Handle notifications data
      } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
      }

    };

    notifications();
    obtenerPublicaciones();
    
  }, [user]);

  // Nuevo useEffect para cargar lenderInfos cuando notifications cambie
  useEffect(() => {
    notifications.forEach(notif => {
      if (notif.lender_id && !lenderInfos[notif.lender_id]) {
        getLenderInfo(notif.lender_id);
      }
    });
  }, [notifications]); // Depende solo de notifications

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
        <h1>Panel de Controls</h1>
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

      <section className="user-publications">
        <h3>Tus solicitudes publicadas</h3>
        {loading ? (
          <p>Cargando tus solicitudes...</p>
        ) : publications.length === 0 ? (
          <p>No has publicado ninguna solicitud aún.</p>
        ) : (
          publications.map((solicitud) => (
            <div key={solicitud.id} className="publication-card">
              <div className="publication-header">
                <span className="amount-tag">
                  RD$ {Number(solicitud.amount).toLocaleString()}
                </span>
                <span className={`status-badge ${solicitud.state}`}>{solicitud.state}</span>
              </div>
              <p>{solicitud.reason}</p>
              <p className="publication-meta">
                Publicada el {new Date(solicitud.created_at).toLocaleDateString('es-DO')}
              </p>
            </div>
          ))
        )}
      </section>
      <div className="offers-container">
        <h3>Ofertas Recibidas</h3>
        <p className="offers-subtitle">Compara las condiciones y elige la que prefieras</p>

        <div className="offers-grid">
          {notifications.map(notificacion => (
            <div key={notificacion.id} className="offer-card">
              <div className="offer-header">
                <span className="bank-badge">{lenderInfos[notificacion.lender_id]?.name || 'Nombre no disponible'}</span>
                <span className="rating">5⭐ {notificacion.puntos}</span>
              </div>

              <div className="offer-footer">
                <span className="type-tag">{notificacion.tipo}</span>
                <button className="btn-accept" onClick={() => alert(`Has seleccionado a ${notificacion.lender_id}`)}>
                  Permitir acceso a mi información
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;