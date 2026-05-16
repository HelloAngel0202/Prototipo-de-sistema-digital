import "./BankDashboard.css";
import axios from "axios";
import { useState, useEffect } from "react";

function BankDashboard({ user }) {
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const getInformationRequest = async (solicitud_id, lender_id) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/users/getRequestInfo?request_id=${solicitud_id}&lender_id=${lender_id}`,
        {
          request_id: solicitud_id,
          lender_id: lender_id
        }
      );
    } catch (error) {
      console.error("Error obteniendo información de la solicitud:", error);
    }
  };

  useEffect(() => {
    const obtenerSolicitudes = async () => {

      try {
        const response = await axios.get(
          "http://localhost:3001/users/brpublic"
        );


        setPublications(response.data);
      } catch (error) {
        console.error("Error obteniendo publicaciones:", error);
      }
    };
    const obtenerNotificaciones = async () => {


      try {
        console.log(user.id);
        const response = await axios.get(
          `http://localhost:3001/users/sended-notifications?lender_id=${user.id}`
        );
        console.log(response.data);
        setNotifications(response.data);
      } catch (error) {
        console.error("Error obteniendo notificaciones:", error);
      }
    };

    obtenerSolicitudes();
    obtenerNotificaciones();
  }, []);

  return (
    <div className="lender-container">
      <header className="lender-header">
        <div>
          <h1>Panel de Inversiones</h1>
          <p>
            Bienvenido, representante de <strong>{user.name}</strong>
          </p>
        </div>
      </header>

      <section className="market-feed">
        <h2>Oportunidades de Préstamos</h2>

        {publications.map((solicitud) => (
          <div key={solicitud.id} className="request-feed-card">
            <div className="card-top">
              <span className="amount-tag">
                RD$ {Number(solicitud.amount).toLocaleString()}
              </span>
              <p>{solicitud.reason}</p>
              <p>
                <button onClick={() => { getInformationRequest(solicitud.user_id, user.id) }}>Solicitar información</button>
              </p>
            </div>
            <p className="publication-meta">
              Publicada el {new Date(solicitud.created_at).toLocaleDateString('es-DO')}
            </p>
          </div>
        ))}
      </section>

      <section className="accepted-request-notice">
        <div className="accepted-request-card">
          <h2>Solicitudes enviadas</h2>
          {notifications.map((notification) => (
            <div key={notification.id} className="request-feed-card">
              <div className="card-top">
                <span className="amount-tag">
                  <h2>{notification.client_name}</h2>
                </span>
                <p>
                  <button onClick={() => { getInformationRequest(notification.client_id, user.id) }}>Solicitar información</button>
                </p>
              </div>
              <p className="publication-meta">
                Publicada el {new Date(notification.created_at).toLocaleDateString('es-DO')}
              </p>
            </div>
          ))}
          <p>
            Solicitud de información aceptada, el cliente ha permitido el acceso a su información financiera.
            Puedes revisar los detalles en la sección de solicitudes aceptadas.
          </p>
        </div>
      </section>
    </div>
  );
}

export default BankDashboard;