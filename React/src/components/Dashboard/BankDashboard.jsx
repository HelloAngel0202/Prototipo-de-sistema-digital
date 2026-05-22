import "./BankDashboard.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

function BankDashboard({ user }) {
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // CORRECCIÓN AQUÍ: Pasamos el id de la solicitud para removerlo del estado
  const getInformationRequest = async (
    client_request_id,
    lender_id,
    client_id,
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/users/getRequestInfo?client_request_id=${client_request_id}&lender_id=${lender_id}&client_id=${client_id}`,
        {
          client_request_id: client_request_id,
          lender_id: lender_id,
          client_id: client_id,
        },
      );

      // 1. Mostrar alerta de éxito
      Swal.fire({
        title: "Aceptado",
        html: "¡Solicitud enviada exitosamente!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // 2. ACTUALIZACIÓN DEL ESTADO: Filtramos la publicación para que desaparezca de la vista del Lender
      setPublications((prevPublications) =>
        prevPublications.filter(
          (solicitud) => solicitud.id !== client_request_id,
        ),
      );

      // 3. OPCIONAL: Si quieres que aparezca inmediatamente abajo en "Solicitudes enviadas" sin recargar la página,
      // puedes volver a ejecutar la función de cargar notificaciones:
      obtenerNotificaciones();
    } catch (error) {
      console.error("Error obteniendo información de la solicitud:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar la solicitud.",
        icon: "error",
      });
    }
  };

  // Extraemos las funciones del useEffect para poder reutilizarlas si es necesario
  const obtenerNotificaciones = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users/sended-notifications?lender_id=${user.id}`,
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
    }
  };

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/users/brpublic",
        );
        console.log("Publicaciones obtenidas:", response.data);
        setPublications(response.data);
      } catch (error) {
        console.error("Error obteniendo publicaciones:", error);
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

        {publications
          .filter(
            (solicitud) =>
              !notifications.some((n) => n.client_request_id === solicitud.id),
          )
          .map((solicitud) => (
            <div key={solicitud.id} className="request-feed-card">
              <div className="card-top">
                <span className="amount-tag">
                  RD$ {Number(solicitud.amount).toLocaleString()}
                </span>
                <p>{solicitud.reason}</p>
                <p>
                  <button
                    onClick={() => {
                      getInformationRequest(
                        solicitud.id,
                        user.id,
                        solicitud.user_id,
                      );
                    }}
                  >
                    Solicitar información
                  </button>
                </p>
              </div>
              <p className="publication-meta">
                Publicada el{" "}
                {new Date(solicitud.created_at).toLocaleDateString("es-DO")}
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
                <span className="amount-tag">
                  <h2>
                    {notification.state == 2
                      ? "Información disponible"
                      : "Pendiente"}
                  </h2>
                </span>
                <div>
                  {notification.state == 2 ? (
                    <div>
                      <Link
                        to="/client-info"
                        state={{
                          lender_id: user.id,
                          request_id:
                            notification.client_request_id ||
                            notification.request_id ||
                            notification.id,
                          notification_id: notification.id,
                          client_id: notification.client_id,
                        }}
                        className="btn-action"
                      >
                        Ver información
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <button disabled className="btn-waiting">
                        {" "}
                        Espera a que el cliente acepte su solicitud
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="publication-meta">
                Publicada el{" "}
                {new Date(notification.created_at).toLocaleDateString("es-DO")}
              </p>
            </div>
          ))}
          <p style={{ marginTop: "20px", fontStyle: "italic", color: "#666" }}>
            Solicitud de información aceptada, el cliente ha permitido el acceso
            a su información financiera. Puedes revisar los detalles en la
            sección de solicitudes aceptadas.
          </p>
        </div>
      </section>
    </div>
  );
}

export default BankDashboard;
