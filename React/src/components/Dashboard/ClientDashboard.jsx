import "./ClientDashboard.css";
import { useNavigate, Link } from "react-router-dom";
import OfferList from "../Offers/OfferList";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import LenderConditionsModal from "../LenderConditions/LenderConditionsModal";
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

function ClientDashboard({ user }) {
  const [publications, setPublications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lenderInfo, setLenderInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [prestamos, setPrestamos] = useState([]);
  const [datachek, setDatachek] = useState([]);
  const [modalConditionId, setModalConditionId] = useState(null);
  const navigate = useNavigate();

  const rawToken = localStorage.getItem("token");
  const payload = useMemo(() => parseJwt(rawToken), [rawToken]);
  const clid = payload?.clid;

  const showProfileReminder = async () => {
    const result = await Swal.fire({
      title: "🚀 ¡Ya casi estás listo!",
      html: `
      <div style="text-align:center">
        <div style="font-size:60px;margin-bottom:10px;">🧑‍💼</div>
        <p>
          Ya estás más cerca de obtener nuevas oportunidades de préstamo.
        </p>
        <p>
          Solo falta completar tu información personal para que podamos
          conectarte con más opciones de financiamiento.
        </p>
      </div>
    `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Completar mis datos",
      cancelButtonText: "Más tarde",
    });

    if (result.isConfirmed) {
      navigate("/profile");
    }
  };

  const validateProfileData = async () => {
    try {
      const check = await axios.get(
        "http://localhost:3001/users/checkClientData",
        {
          params: {
            id: payload.id,
            clid: payload.clid,
            role: payload.role,
          },
          headers: {
            Authorization: `Bearer ${rawToken}`,
          },
        },
      );

      if (!check.data) {
        const result = await Swal.fire({
          title: "🚀 ¡Ya casi estás listo!",
          html: `
      <div style="text-align:center">
        <div style="font-size:60px;margin-bottom:10px;">🧑‍💼</div>
        <p>
          Ya estás más cerca de obtener nuevas oportunidades de préstamo.
        </p>
        <p>
          Solo falta completar tu información personal para que podamos
          conectarte con más opciones de financiamiento.
        </p>
      </div>
    `,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Completar mis datos",
          cancelButtonText: "Más tarde",
        });

        if (result.isConfirmed) {
          navigate("/profile");
        } else {
          setDatachek(false);
        }

        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validando datos:", error);

      Swal.fire({
        title: "Error",
        text: "No se pudo verificar tu información.",
        icon: "error",
      });

      return false;
    }
  };

  const acceptAccess = (offer) => {
    try {
      axios
        .get(
          `http://localhost:3001/users/accept-access?offerId=${offer.id}&clientRequestId=${offer.client_request_id}`,
        )
        .then((response) => {
          setNotifications((prev) =>
            prev.filter((notificacion) => notificacion.id !== offer.id),
          );
          Swal.fire({
            title: "Aceptado",
            html: "¡Oferta aceptada exitosamente!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        })
        .catch((error) => {
          console.error("Error al aceptar la oferta:", error);
          Swal.fire({
            title: "Error",
            html: "Hubo un error al aceptar la oferta. Por favor, intenta nuevamente.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false,
          });
        });
    } catch (error) {
      console.error("Error al aceptar la oferta:", error);
      alert(
        "Hubo un error al aceptar la oferta. Por favor, intenta nuevamente.2",
      );
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
          `http://localhost:3001/users/my-publications?user_id=${clid}`,
        );
        setPublications(response.data);
      } catch (error) {
        console.error("Error obteniendo tus solicitudes:", error);
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
          `http://localhost:3001/users/notifications?client_id=${clid}`,
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error obteniendo notificaciones:", error);
      }
    };
    const obtenerPrestamos = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/users/my-loans?user_id=${clid}`,
        );
        setPrestamos(response.data);
      } catch (error) {
        console.error("Error obteniendo préstamos:", error);
      }
    };

    validateProfileData();
    obtenerPrestamos();
    obtenerNotificaciones();
    obtenerPublicaciones();
  }, [user]);

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const fetchLenders = async () => {
      const uniqueLenderIds = [
        ...new Set(notifications.map((n) => n.lender_id)),
      ];

      try {
        const responses = await Promise.all(
          uniqueLenderIds.map((id) =>
            axios.get(
              `http://localhost:3001/users/lender-info?lender_id=${id}`,
            ),
          ),
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
        console.error("Error obteniendo información de prestamistas:", error);
      }
    };

    fetchLenders();
  }, [notifications]);

  return (
    <div className="dashboard-container">

       {!datachek && (
        <div className="profile-alert">
          <h3>⚠️ Completa tu perfil</h3>
          <p>
            Ya estás más cerca de obtener nuevas oportunidades de préstamo.
            Completa tu información personal para desbloquear todas las
            funciones.
          </p>

          <button className="btn-action" onClick={() => navigate("/profile")}>
            Completar mis datos
          </button>
        </div>
      )}



      <header className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>
          Bienvenido de nuevo, <strong>{user.name}</strong>
        </p>
      </header>

     

      {/* Sección de Tarjetas de Resumen */}

      {/* Sección de Acciones Principales */}
      <section className="main-actions">
        <div className="action-card primary">
          <h2>¿Necesitas financiamiento?</h2>
          <p>
            Crea una nueva solicitud anónima y recibe ofertas de bancos
            verificados.
          </p>
          {datachek ? (
            <Link to="/new-request" className="btn-action">
              Nueva Solicitud Anónima
            </Link>
          ) : (
            <button className="btn-action" onClick={showProfileReminder}>
              Nueva Solicitud Anónima
            </button>
          )}
        </div>
      </section>

      <section className="user-publications">
        <h3>Tus solicitudes publicadas</h3>
        {loading ? (
          <p>Cargando tus solicitudes...</p>
        ) : publications.length === 0 ? (
          <div className="offer-card">
            <p>No has publicado ninguna solicitud aún.</p>
            <p className="offers-subtitle">
              Publica una solicitud para empezar a recibir propuestas de los
              bancos. Cuéntales un poco sobre tu necesidad de financiamiento y
              espera a que lleguen las ofertas.
            </p>
          </div>
        ) : (
          publications.map((solicitud) => {
            const isPending = String(solicitud.state) === "1";

            return (
              <div key={solicitud.id} className="publication-card">
                <div className="publication-header">
                  <span className="amount-tag">
                    RD$ {Number(solicitud.amount).toLocaleString()}
                  </span>
                  <span className={`status-badge ${solicitud.state}`}>
                    {isPending ? "Pendiente" : "Aceptada"}
                  </span>
                </div>
                <p>{solicitud.reason}</p>
                <p className="publication-meta">
                  Publicada el{" "}
                  {new Date(solicitud.created_at).toLocaleDateString("es-DO")}
                </p>
              </div>
            );
          })
        )}
      </section>
      <div className="offers-container">
        <h3>Ofertas Recibidas</h3>
        <p className="offers-subtitle">
          Compara las condiciones y elige la que prefieras
        </p>

        <div className="offers-grid">
          {notifications.length === 0 ? (
            <div className="offer-card">
              <p>
                No has recibido ofertas aún. Publica una solicitud para empezar
                a recibir propuestas de los bancos.
              </p>
            </div>
          ) : (
            notifications.map((notificacion) => (
              <div key={notificacion.id} className="offer-card">
                <div className="offer-header">
                  <span className="bank-badge">
                    {lenderInfo[notificacion.lender_id]?.name +
                      " quiere acceder a tu información" ||
                      "Nombre no disponible"}
                  </span>
                  <span className="rating">5⭐ {notificacion.puntos}</span>
                </div>

                <div className="offer-footer">
                  <span className="type-tag">{notificacion.tipo}</span>
                  <button
                    className="btn-accept"
                    onClick={() => acceptAccess(notificacion)}
                  >
                    Permitir acceso a mi información
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="offers-container">
        <h3>Préstamos</h3>
        <p className="offers-subtitle">
          Aquí se mostrarán los préstamos activos y pendientes
        </p>

        <div className="offers-grid">
          {prestamos.length === 0 ? (
            <div className="offer-card">
              <p>
                No tienes préstamos activos o pendientes. Acepta una oferta para
                ver los detalles de tu préstamo aquí.
              </p>
            </div>
          ) : (
            prestamos.map((prestamo) => (
              <div key={prestamo.id} className="offer-card">
                <div className="offer-header">
                  <span className="bank-badge">{prestamo.bank_name}</span>
                  <span className="rating">5⭐ {prestamo.puntos}</span>
                </div>

                <div className="offer-footer">
                  <span className="type-tag">{prestamo.tipo}</span>
                  {prestamo.state === 2 ? (
                    <div className="">
                      <p>Visita programada</p>
                    </div>
                  ) : (
                    <div>
                      {prestamo.state === 3 && (
                        <div className="status-active">
                          <strong>Préstamo activo</strong>
                        </div>
                      )}
                      <button
                        className="btn-action"
                        onClick={() =>
                          setModalConditionId(prestamo.lender_conditions_id)
                        }
                      >
                        Ver condiciones del préstamo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {modalConditionId && (
        <LenderConditionsModal
          lenderConditionsId={modalConditionId}
          onClose={() => setModalConditionId(null)}
        />
      )}
    </div>
  );
}

export default ClientDashboard;
