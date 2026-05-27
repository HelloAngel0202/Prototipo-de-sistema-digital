import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ShowLenderConditions.css";
import axios from "axios";
import Swal from "sweetalert2";

const ShowLenderConditions = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [lenderConditions, setLenderConditions] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Información del banco
  const [bankInfo, setBankInfo] = useState({
    name: "",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/Popular_Bank_logo.svg",
    phone: "(809) 573-2121",
  });

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        // 1. Intentar obtener el ID desde cualquier variante posible que envíe el estado
        const idToQuery =
          location.state?.offerId ||
          location.state?.id ||
          location.state?.lender_conditions_id;

        console.log("Estado de navegación recibido (location.state):", location.state);

        if (!idToQuery) {
          console.error("No se encontró ningún ID en location.state");
          setLoading(false);
          return;
        }

        // 2. Probamos la petición. Si tu backend usa parámetros de consulta (query params) 
        // en lugar de parámetros de ruta, puedes cambiarlo a: `http://localhost:3001/lender-conditions?id=${idToQuery}`
        const response = await axios.get(`http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${idToQuery}`);
        console.log("Respuesta del servidor backend:", response.data);

        if (response.data) {
          // Si tu backend devuelve un arreglo, tomamos el primer elemento, si es un objeto lo tomamos directo
          const data = Array.isArray(response.data) ? response.data[0] : response.data;

          setLenderConditions(data);

          if (data.lender_name) {
            setBankInfo((prev) => ({ ...prev, name: data.lender_name }));
          }

          // Generar el calendario con los datos limpios recibidos
          generateClientSchedule(data);
        }
      } catch (error) {
        console.error("Error obteniendo condiciones en el useEffect:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [location.state]);

  // Motor matemático de amortización fiel a las condiciones de tu base de datos
  const generateClientSchedule = (conditions) => {
    const principal = parseFloat(conditions.approved_amount);
    const annualRate = parseFloat(conditions.interest);
    const periods = parseInt(conditions.fees_count);
    const system = conditions.amortization_system;
    const frequency = conditions.payment_frequency;
    const basePayDate = conditions.pay_days;

    if (isNaN(principal) || isNaN(annualRate) || isNaN(periods)) return;

    let currentPayDate = basePayDate ? new Date(basePayDate) : new Date();
    let ratePerPeriod = 0;
    let daysToAdd = 30;

    switch (frequency) {
      case "semanal":
        ratePerPeriod = (annualRate / 100) / 52;
        daysToAdd = 7;
        break;
      case "quincenal":
        ratePerPeriod = (annualRate / 100) / 24;
        daysToAdd = 15;
        break;
      case "mensual":
      default:
        ratePerPeriod = (annualRate / 100) / 12;
        daysToAdd = 30;
        break;
    }

    let schedule = [];
    let remainingBalance = principal;

    if (system === "frances") {
      const feeAmount = (principal * ratePerPeriod) / (1 - Math.pow(1 + ratePerPeriod, -periods));

      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * ratePerPeriod;
        const principalPayment = feeAmount - interestPayment;
        remainingBalance -= principalPayment;

        schedule.push({
          feeNumber: i,
          paymentDate: currentPayDate.toISOString().split("T")[0],
          feeAmount: feeAmount,
          interestPayment: interestPayment,
          principalPayment: principalPayment,
          remainingBalance: Math.max(0, remainingBalance),
        });

        currentPayDate.setDate(currentPayDate.getDate() + daysToAdd);
      }
    } else if (system === "aleman") {
      const principalPayment = principal / periods;

      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * ratePerPeriod;
        const feeAmount = principalPayment + interestPayment;
        remainingBalance -= principalPayment;

        schedule.push({
          feeNumber: i,
          paymentDate: currentPayDate.toISOString().split("T")[0],
          feeAmount: feeAmount,
          interestPayment: interestPayment,
          principalPayment: principalPayment,
          remainingBalance: Math.max(0, remainingBalance),
        });

        currentPayDate.setDate(currentPayDate.getDate() + daysToAdd);
      }
    }

    setAmortizationSchedule(schedule);
  };

  const acceptOffer = (offer) => {
    // Manteniendo la estructura de rutas exacta de tu función original
    const offerIdParam = offer.id || location.state?.offerId || location.state?.id;
    const requestParam = offer.request_id || location.state?.clientRequestId;
    const lenderParam = location.state?.lender_user_id || offer.lender_id;
    const clientParam = location.state?.client_user_id || offer.client_user_id;

    axios
      .get(
        `http://localhost:3001/users/accept-offer?offerId=${offerIdParam}&clientRequestId=${requestParam}&lender_user_id=${lenderParam}&client_user_id=${clientParam}`,
      )
      .then(() => {
        Swal.fire({
          title: "¡Cita Confirmada!",
          html: `Tu visita ha sido agendada exitosamente.<br/><br/> Recuerda presentarte a la sucursal de <strong>${bankInfo.name || "la institución"}</strong> con tus documentos físicos obligatorios.`,
          icon: "success",
          confirmButtonColor: "#2ecc71",
        });
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error al aceptar la oferta:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo confirmar tu visita en este momento.",
          icon: "error",
        });
      });
  };

  return (
    <div className="show-conditions-container">
      <div className="conditions-card">
        {/* Encabezado */}
        <div className="bank-header">
          <img src={bankInfo.logo} alt="Logo del Banco" className="bank-logo" />
          <h2>Propuesta de Crédito Recibida</h2>
          <p className="bank-name">{bankInfo.name || "Institución Financiera S.A."}</p>
        </div>

        {/* Renderizado de la información */}
        {!loading && lenderConditions ? (
          <div className="conditions-section">
            <div className="conditions-section-grid">
              <div className="condition-item">
                <span>Monto Aprobado</span>
                <strong className="highlight-amount">
                  RD$ {parseFloat(lenderConditions.approved_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="condition-item">
                <span>Interés</span>
                <strong>{lenderConditions.interest}% Anual</strong>
              </div>

              <div className="condition-item">
                <span>Tipo de Interés</span>
                <strong className="capitalize">{lenderConditions.interest_type}</strong>
              </div>

              <div className="condition-item">
                <span>Sistema Amortización</span>
                <strong className="capitalize">{lenderConditions.amortization_system}</strong>
              </div>

              <div className="condition-item">
                <span>Frecuencia de Pago</span>
                <strong className="capitalize">{lenderConditions.payment_frequency}</strong>
              </div>

              <div className="condition-item">
                <span>Cuota Estimada</span>
                <strong>RD$ {parseFloat(lenderConditions.estimated_fee_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {lenderConditions.message && (
              <div className="lender-message-box">
                <h4>Notas del Analista Financiero:</h4>
                <p>"{lenderConditions.message}"</p>
              </div>
            )}

            {/* Calendario Proyectado */}
            {amortizationSchedule.length > 0 && (
              <div className="schedule-preview-section">
                <h3>Calendario Proyectado de Días de Pago</h3>
                <div className="table-responsive-container">
                  <table className="client-amortization-table">
                    <thead>
                      <tr>
                        <th>Cuota</th>
                        <th>Fecha de Pago</th>
                        <th>Monto Cuota</th>
                        <th>Abono Capital</th>
                        <th>Interés</th>
                        <th>Balance Restante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.map((row) => (
                        <tr key={row.feeNumber}>
                          <td>#{row.feeNumber}</td>
                          <td>{row.paymentDate}</td>
                          <td className="bold-text">RD$ {row.feeAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td>RD$ {row.principalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td>RD$ {row.interestPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                          <td>RD$ {row.remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Requisitos Informativos */}
            <div className="requirements-info-box">
              <h4>Información Importante para Desembolso:</h4>
              <p>
                Para completar la aplicación formal de tu línea de crédito y procesar el desembolso de los fondos,
                es requerido presentarse a la oficina del banco portando los siguientes documentos físicos obligatorios:
              </p>
              <ul className="requirements-list">
                <li>Cédula de Identidad y Electoral vigente (original y copia).</li>
                <li>Estados financieros formales o estados de cuentas bancarias de los últimos 3 meses.</li>
                <li>Comprobantes de ingresos estables (Carta de trabajo o evidencias de negocio).</li>
                <li>Cualquier otra garantía estipulada en la llamada de pre-aprobación.</li>
              </ul>
              <div className="bank-contact-footer">
                <span>¿Tienes dudas sobre los requisitos? Comunícate con el banco al: </span>
                <strong className="bank-phone">{bankInfo.phone}</strong>
              </div>
            </div>

            <div className="button-group">
              <button
                className="accept-btn"
                onClick={() => acceptOffer(lenderConditions)}
              >
                Confirmar visita
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
            {loading ? (
              <p>Buscando las condiciones financieras de tu oferta...</p>
            ) : (
              <p style={{ color: "#e74c3c" }}>
                Error al cargar: No se recibieron datos válidos. Abre la consola del navegador (F12) para ver los IDs transmitidos.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowLenderConditions;