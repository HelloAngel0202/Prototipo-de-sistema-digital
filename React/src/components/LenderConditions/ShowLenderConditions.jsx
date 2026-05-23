import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ShowLenderConditions.css";
import axios from "axios";
import Swal from "sweetalert2";

const ShowLenderConditions = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [lenderConditions, setLenderConditions] = useState(null);

  // Información del banco (se actualiza con lender_name del backend)
  const [bankInfo, setBankInfo] = useState({
    name: "",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/Popular_Bank_logo.svg",
  });

  const acceptOffer = (offer) => {
    axios
      .get(
        `http://localhost:3001/users/accept-offer?offerId=${offer.id}&clientRequestId=${offer.request_id}&lender_user_id=${location.state.lender_user_id}&client_user_id=${location.state.client_user_id}`,
      )
      .then(() => {
        Swal.fire({
          title: "Aceptado",
          html: "¡Oferta aceptada exitosamente!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error al aceptar la oferta:", error);
        Swal.fire({
          title: "Error",
          html: "Hubo un error al aceptar la oferta.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      });
  };

  useEffect(() => {
    axios
      .get(
        `http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${location.state.lender_conditions_id}`,
      )
      .then((response) => {
        setLenderConditions(response.data);

        // Cargar nombre del lender desde la respuesta
        setBankInfo((prev) => ({
          ...prev,
          name: response.data.lender_name || "Nombre no disponible",
          logo: response.data.profile_image
            ? `http://localhost:3001/uploads/${response.data.profile_image}`
            : prev.logo,
        }));
      })
      .catch((error) => {
        console.error("Error al obtener condiciones:", error);
      });
  }, [location.state.lender_conditions_id]);

  console.log("Lender Conditions:", bankInfo.logo);

  return (
    <div className="lender-page">
      <div className="lender-card">
        {/* Header Banco */}
        <div className="bank-header">
          <div className="bank-logo-container">
            <img src={bankInfo.logo} alt="Bank Logo" className="bank-logo" />
          </div>
          <div>
            <h2 className="bank-name">{bankInfo.name}</h2>
            <p className="bank-subtitle">Oferta de financiamiento aprobada</p>
          </div>
        </div>

        {/* Contenido */}
        {lenderConditions ? (
          <div className="conditions-section">
            <div className="condition-item">
              <span>Monto Aprobado</span>
              <strong>RD$ {lenderConditions.approved_amount}</strong>
            </div>

            <div className="condition-item">
              <span>Interés</span>
              <strong>{lenderConditions.interest}%</strong>
            </div>

            <div className="condition-item">
              <span>Tipo de Interés</span>
              <strong>{lenderConditions.interest_type}</strong>
            </div>

            <div className="condition-item">
              <span>Periodo de Revisión</span>
              <strong>{lenderConditions.rate_revision_period}</strong>
            </div>

            <div className="button-group">
              <button
                className="accept-btn"
                onClick={() => acceptOffer(lenderConditions)}
              >
                Aceptar Oferta
              </button>

              <button
                className="back-btn"
                onClick={() => navigate("/dashboard")}
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div className="loading-container">
            <p>Condiciones no encontradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowLenderConditions;
