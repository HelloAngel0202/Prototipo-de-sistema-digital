import "./BankDashboard.css";
import axios from "axios";
import { useState, useEffect } from "react";
import LenderConditionsModal from "../LenderConditions/LenderConditionsModal";
import LenderPaymentsModal from "../LenderConditions/LenderPaymentsModal";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

function parseJwt(token) {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

function BankDashboard({ user }) {
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // CORRECCIÓN AQUÍ: Pasamos el id de la solicitud para removerlo del estado
  const getInformationRequest = async (
    client_request_id,
    lender_id,
    client_id,
  ) => {
    try {
      console.log("Solicitando información para la solicitud ID:", client_request_id, lender_id, client_id); // Log para depuración
      const rawToken = localStorage.getItem("token");
      const payload = parseJwt(rawToken);

      const now = new Date().getTime();
      const tokenValido = payload?.exp * 1000 > now;
      if (!tokenValido) {
        Swal.fire({
          title: "Sesión expirada",
          text: "Tu sesión ha expirado, inicia sesión nuevamente.",
          icon: "warning",
        });
        navigate("/login");
        return;
      }

      const check = await axios.get(
        "http://localhost:3001/users/checkClientData",
        {
          params: { id: payload.id, clid: payload.clid, role: payload.role },
          headers: { Authorization: `Bearer ${rawToken}` },
        },
      );

      if (check.data === false) {
        Swal.fire({
          title: "Datos incompletos",
          text: "Debes completar todos sus datos antes de hacer realizar solicitudes.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Completar mis datos",
          cancelButtonText: "Ir al dashboard",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/profile");
          } else {
            navigate("/dashboard");
          }
        });
        return;
      }

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

  const [modalConditionId, setModalConditionId] = useState(null);
  const [paymentsModalConditionId, setPaymentsModalConditionId] = useState(null);

  const openConditionsForNotification = async (notification) => {
    try {
      if (notification.lender_conditions_id) {
        setModalConditionId(notification.lender_conditions_id);
        return;
      }

      // Intentar resolver vía endpoint si falta el id
      const reqId = notification.client_request_id || notification.request_id;
      const res = await axios.get(
        `http://localhost:3001/users/get-lender-conditions-by-request?request_id=${reqId}&lender_id=${user.id}`,
      );
      if (res.data && res.data.id) {
        setModalConditionId(res.data.id);
      } else if (res.data && res.data.lender_conditions_id) {
        setModalConditionId(res.data.lender_conditions_id);
      } else {
        Swal.fire({ title: "No encontrado", text: "No se encontró condiciones para esta solicitud.", icon: "warning" });
      }
    } catch (err) {
      console.error("Error resolviendo condiciones:", err);
      Swal.fire({ title: "Error", text: "No se pudo obtener las condiciones.", icon: "error" });
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
        <p className="offers-subtitle">
          Descubre las solicitudes de financiamiento que se ajustan a tus criterios
        </p>
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
          {notifications.length === 0 ? (
            <p className="no-notifications">No has enviado solicitudes aún.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="request-feed-card">
                <div className="card-top">
                  <span className="amount-tag">
                    {notification.state == 2 || notification.state == 3 ? (<h2>{notification.client_name}</h2>) : (
                      <h2>Cliente anónimo</h2>
                    )}

                  </span>
                  <span className="amount-tag">
                    <p>
                      {notification.state == 2
                        ? "Ya puedes ver la información del cliente"
                        : notification.state == 3
                        ? "Préstamo activo"
                        : "Pendiente"}
                    </p>
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
                      notification.state == 0 ? (
                        <div className="">
                          <p>Visita programada</p>
                          <button
                            onClick={() =>
                              navigate("/confirm-loan", {
                                state: {
                                  lender_conditions_id:
                                    notification.lender_conditions_id,
                                  notification_id: notification.id,
                                  client_request_id: notification.client_request_id,
                                  client_id: notification.client_id,
                                  lender_id: user.id,
                                },
                              })
                            }
                          >
                            Confirmar préstamo
                          </button>
                        </div>
                      ) : (
                        <div className="">
                          <div>
                            {notification.state == 3 ? (
                              <>
                                <div className="status-active">
                                  <strong>Préstamo activo</strong>
                                </div>
                                <div style={{ display: 'inline-flex', gap: 8 }}>
                                  <button
                                    className="btn-action"
                                    onClick={() => openConditionsForNotification(notification)}
                                  >
                                    Ver condiciones actuales
                                  </button>
                                  <button
                                    className="btn-action"
                                    onClick={() => setPaymentsModalConditionId({
                                      lender_conditions_id: notification.lender_conditions_id,
                                      request_id: notification.client_request_id || notification.request_id,
                                      lender_id: user.id,
                                    })}
                                  >
                                    Registrar pago
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button disabled className="btn-waiting">
                                Es espera a que el cliente acepte su solicitud
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <p className="publication-meta">
                  Publicada el{" "}
                  {new Date(notification.created_at).toLocaleDateString("es-DO")}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      {modalConditionId && (
        <LenderConditionsModal
          lenderConditionsId={modalConditionId}
          onClose={() => setModalConditionId(null)}
        />
      )}
      {paymentsModalConditionId && (
        <LenderPaymentsModal
          lenderConditionsId={paymentsModalConditionId}
          onClose={() => setPaymentsModalConditionId(null)}
        />
      )}
    </div>
  );
}

export default BankDashboard;
