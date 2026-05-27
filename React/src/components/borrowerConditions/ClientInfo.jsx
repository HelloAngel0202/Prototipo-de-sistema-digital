import "./ClientInfo.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ClientInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperamos los datos que vienen desde el dashboard o la notificación
  const { lender_id, request_id, notification_id, client_id } =
    location.state || {};

  console.log("Datos recibidos en ClientInfo:", {
    lender_id,
    request_id,
    notification_id,
    client_id,
  });

  // Estados para controlar la información del cliente y la carga
  const [clientProfile, setClientProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findUserInfo = async () => {
      try {
        // Hacemos la petición pasando el client_id (que es el id de la tabla users)
        console.log("Buscando información para client_id:", client_id);
        const response = await axios.get(
          `http://localhost:3001/users/Clidate?clid=${client_id}`,
        );
        setClientProfile(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error obteniendo información del cliente:", error);
        setLoading(false);
      }
    };

    if (client_id) {
      findUserInfo(client_id);
    } else {
      setLoading(false);
    }
  }, [client_id]);

  // Función para manejar el clic del botón final
  // Función para manejar el clic del botón final en ClientInfo.jsx
  const handleGoToConditions = () => {
    navigate("/lender-conditions", {
      state: {
        lender_id: lender_id,
        request_id: request_id,
        notification_id: notification_id,
        notification_client_id: client_id,
        clientProfile: clientProfile // <--- AGREGA ESTO AQUÍ para pasar la info del préstamo solicitado
      },
    });
  };

  console.log("Renderizando ClientInfo con el siguiente perfil de cliente:", clientProfile);

  return (
    <div className="client-info-container">
      <header className="client-info-header">
        <h1>Información Detallada del Cliente</h1>
        <p>
          Analiza el perfil del solicitante antes de estructurar los términos y
          condiciones del préstamo.
        </p>
      </header>

      {loading ? (
        <div className="loading-box">Cargando datos del solicitante...</div>
      ) : clientProfile ? (
        <div className="profile-details-wrapper">
          {/* SECCIÓN 1: DATOS DE LA CUENTA (Tabla: users) */}
          <div className="info-card-section">
            <h2>
              <i className="icon-user"></i> Datos de Credenciales y Cuenta
            </h2>
            <div className="info-grid">
              <p>
                <strong>Nombre de Usuario:</strong>{" "}
                {clientProfile.user.username}
              </p>
              <p>
                <strong>Correo Electrónico:</strong> {clientProfile.user.email}
              </p>
              <p>
                <strong>Dirección de Registro:</strong>{" "}
                {clientProfile.user.address || "No especificada"}
              </p>
              <p>
                <strong>Verificación de Cuenta:</strong>{" "}
                {clientProfile.user.verified
                  ? "✅ Verificado"
                  : "❌ No Verificado"}
              </p>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS PERSONALES COMPLETOS (Tabla: client via information_id) */}
          <div className="info-card-section">
            <h2>
              <i className="icon-card"></i> Información Personal e Identidad
            </h2>
            <div className="info-grid">
              <p>
                <strong>Nombres:</strong> {clientProfile.client.first_name}
              </p>
              <p>
                <strong>Apellidos:</strong>{" "}
                {clientProfile.client.last_name || "N/A"}
              </p>
              <p>
                <strong>Tipo de Documento:</strong>{" "}
                <span className="uppercase-text">
                  {clientProfile.client.document_type || "Cédula"}
                </span>
              </p>
              <p>
                <strong>No. Documento:</strong> {clientProfile.client.document}
              </p>
              <p>
                <strong>Nacionalidad:</strong>{" "}
                {clientProfile.client.nationality}
              </p>
              <p>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {clientProfile.client.birth_date
                  ?
                  clientProfile.client.birth_date

                  : "N/A"}
              </p>
              <p>
                <strong>Estado Civil:</strong>{" "}
                {clientProfile.client.Estado_civil}
              </p>
            </div>
          </div>

          {/* SECCIÓN 3: PERFIL SOCIOECONÓMICO */}
          <div className="info-card-section">
            <h2>
              <i className="icon-briefcase"></i> Ubicación y Situación Laboral
            </h2>
            <div className="info-grid">
              <p>
                <strong>Ocupación / Profesión:</strong>{" "}
                {clientProfile.client.ocupation}
              </p>
              <p>
                <strong>Ciudad de Residencia:</strong>{" "}
                {clientProfile.client.city}
              </p>
              <p>
                <strong>Teléfono Fijo:</strong>{" "}
                {clientProfile.client.phone || "No registrado"}
              </p>
              <p>
                <strong>Teléfono Celular:</strong>{" "}
                {clientProfile.client.cellphone || "No registrado"}
              </p>
            </div>
          </div>

          {/* BOTÓN SOLICITADO AL FINAL */}
          <div className="action-footer">
            <button
              className="btn-send-conditions"
              onClick={handleGoToConditions}
            >
              Enviar condiciones de prestamo
            </button>
          </div>
        </div>
      ) : (
        <div className="error-box">
          <p>
            No se pudo recuperar la información del cliente o faltan parámetros
            de navegación.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientInfo;
