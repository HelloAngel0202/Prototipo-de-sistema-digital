import './ClientDashboard.css';
import { Link } from 'react-router-dom';
import OfferList from '../Offers/OfferList';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from "sweetalert2";

function ClientDashboard({ user }) {
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lenderInfo, setLenderInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [prestamos, setPrestamos] = useState([]);

  const acceptOffer = (offer) => {
    try {
      axios.get(`http://localhost:3001/users/accept-offer?offerId=${offer.id}&clientRequestId=${offer.client_request_id}`)
        .then(response => {
          setNotifications(prev => prev.filter(notificacion => notificacion.id !== offer.id));

          Swal.fire({
            title: "Aceptado",
            html: "¡Oferta aceptada exitosamente!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        })
        .catch(error => {
          console.error('Error al aceptar la oferta:', error);
          Swal.fire({
            title: "Error",
            html: "Hubo un error al aceptar la oferta. Por favor, intenta nuevamente.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false,
          });
        });
    } catch (error) {
      console.error('Error al aceptar la oferta:', error);
      alert('Hubo un error al aceptar la oferta. Por favor, intenta nuevamente.2');
    }
  }

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
    const obtenerNotificaciones = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3001/users/notifications?client_id=${user.id}`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
      }
    };
    const obtenerPrestamos = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/users/my-loans?user_id=${user.id}`
        );
        console.log('Préstamos obtenidos:', response.data);
        setPrestamos(response.data);
      } catch (error) {
        console.error('Error obteniendo préstamos:', error);
      }

    }

    obtenerPrestamos();
    obtenerNotificaciones();
    obtenerPublicaciones();

  }, [user]);

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const fetchLenders = async () => {
      const uniqueLenderIds = [...new Set(notifications.map(n => n.lender_id))];

      try {
        const responses = await Promise.all(
          uniqueLenderIds.map(id =>
            axios.get(`http://localhost:3001/users/lender-info?lender_id=${id}`)
          )
        );

        const infoMap = responses.reduce((acc, response, index) => {
          const lenderId = uniqueLenderIds[index];
          return {
            ...acc,
            [lenderId]: response.data,
          };
        }, {});

        setLenderInfo(infoMap);
      } catch (error) {
        console.error('Error obteniendo información de prestamistas:', error);
      }
    };

    fetchLenders();
  }, [notifications]);

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
                <span className={`status-badge ${solicitud.state}`}>{solicitud.state == 1 ? "Pendiente" : "Aceptada"}</span>
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
                <span className="bank-badge">{lenderInfo[notificacion.lender_id]?.name || 'Nombre no disponible'}</span>
                <span className="rating">5⭐ {notificacion.puntos}</span>
              </div>

              <div className="offer-footer">
                <span className="type-tag">{notificacion.tipo}</span>
                <button className="btn-accept" onClick={() => acceptOffer(notificacion)}>
                  Permitir acceso a mi información
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="offers-container">
        <h3>Préstamos</h3>
        <p className="offers-subtitle">Aquí se mostrarán los préstamos activos y pendientes</p>

        <div className="offers-grid">
          {prestamos.map(prestamo => (
            <div key={prestamo.id} className="offer-card">
              <div className="offer-header">
                <span className="bank-badge">{prestamo.bank_name}</span>
                <span className="rating">5⭐ {prestamo.puntos}</span>
              </div>

              <div className="offer-footer">
                <span className="type-tag">{prestamo.tipo}</span>
                <Link
                  to="/show-lender-conditions"
                  state={{
                    lender_conditions_id: prestamo.lender_conditions_id
                  }}
                  className='btn-action'
                >
                  Ver condiciones del préstamo
                </Link> 
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;