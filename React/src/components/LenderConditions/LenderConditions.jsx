import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LenderConditions.css";
import axios from "axios";
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

const LenderConditions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lender_id, request_id, notification_id, notification_client_id } =
    location.state || {};

  const [formData, setFormData] = useState({
    request_id: request_id || "",
    lender_id: lender_id || "",
    approved_amount: "",
    interest: "",
    interest_type: "fija",
    rate_revision_period: "anual",
    amortization_system: "frances",
    payment_frequency: "mensual",
    fees_count: "",
    estimated_fee_amount: "",
    closing_costs: "",
    late_fee_percentage: "",
    message: "",
    pay_days: "",
    expiration_date: "",
    notification_id: notification_id || "",
    notification_client_id: notification_client_id || "",
  });

  // 1. Obtener datos iniciales de la solicitud
  useEffect(() => {
    const rawToken = localStorage.getItem("token");
    const payload = parseJwt(rawToken);

    if (!payload) {
      navigate("/login");
      return;
    }

    const getClientRequest = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/users/get-client-request?request_id=${request_id}`,
        );
        const amount = response.data.amount.toString();
        setFormData((prev) => ({
          ...prev,
          approved_amount: formatCurrency(amount),
        }));
      } catch (error) {
        console.error("Error al obtener la solicitud:", error);
      }
    };
    if (request_id) getClientRequest();
  }, [request_id]);
  //
  useEffect(() => {
    if (!formData.pay_days || !formData.fees_count) return;

    const startDate = new Date(formData.pay_days);
    const fees = Number(formData.fees_count);

    if (isNaN(fees) || fees <= 0) return;

    const expiration = new Date(startDate);

    switch (formData.payment_frequency) {
      case "mensual":
        expiration.setMonth(expiration.getMonth() + fees);
        break;

      case "quincenal":
        expiration.setDate(expiration.getDate() + fees * 15);
        break;

      case "semanal":
        expiration.setDate(expiration.getDate() + fees * 7);
        break;

      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      expiration_date: expiration.toISOString().split("T")[0],
    }));
  }, [formData.pay_days, formData.fees_count, formData.payment_frequency]);

  //

  useEffect(() => {
    if (
      formData.pay_days &&
      formData.fees_count &&
      formData.payment_frequency
    ) {
      const startDate = new Date(formData.pay_days + "T00:00:00");
      const expiration = new Date(startDate);

      const cuotas = Number(formData.fees_count);

      switch (formData.payment_frequency) {
        case "mensual":
          expiration.setMonth(expiration.getMonth() + cuotas);
          break;

        case "quincenal":
          expiration.setDate(expiration.getDate() + cuotas * 15);
          break;

        case "semanal":
          expiration.setDate(expiration.getDate() + cuotas * 7);
          break;

        default:
          break;
      }

      // Formato YYYY-MM-DD sin problemas de UTC
      const formattedDate = [
        expiration.getFullYear(),
        String(expiration.getMonth() + 1).padStart(2, "0"),
        String(expiration.getDate()).padStart(2, "0"),
      ].join("-");

      setFormData((prev) => ({
        ...prev,
        expiration_date: formattedDate,
      }));
    }
  }, [formData.pay_days, formData.fees_count, formData.payment_frequency]);
  //

  // 2. LÓGICA DE CÁLCULO AUTOMÁTICO: CUOTA Y COSTOS DE CIERRE (Monto + Intereses)
  useEffect(() => {
    const calculateLoanAndCosts = () => {
      const principal = Number(formData.approved_amount.replace(/\D/g, ""));
      const annualInterest = Number(formData.interest);
      const periods = Number(formData.fees_count);

      if (principal > 0 && annualInterest > 0 && periods > 0) {
        // Tasa de interés mensual efectiva
        const monthlyRate = annualInterest / 100 / 12;

        // Fórmula de Amortización Francesa para la cuota mensual
        const fee =
          (principal * monthlyRate * Math.pow(1 + monthlyRate, periods)) /
          (Math.pow(1 + monthlyRate, periods) - 1);

        const roundedFee = Math.round(fee);

        // Cálculo de Costos de Cierre: Monto Aprobado + Intereses Totales
        // Intereses Totales = (Cuota Mensual * Cantidad de meses) - Capital Inicial
        const totalPaid = roundedFee * periods;
        const totalInterest = totalPaid - principal;
        const closingCostsCalculated = principal + totalInterest; // Monto aprobado + intereses

        setFormData((prev) => ({
          ...prev,
          estimated_fee_amount: formatCurrency(roundedFee.toString()),
          closing_costs: formatCurrency(closingCostsCalculated.toString()), // Asignación automática
        }));
      } else {
        // Si falta algún dato para el cálculo, limpiamos los campos automáticos
        setFormData((prev) => ({
          ...prev,
          estimated_fee_amount: "",
          closing_costs: "",
        }));
      }
    };
    calculateLoanAndCosts();
  }, [formData.approved_amount, formData.interest, formData.fees_count]);

  // 3. FUNCIONES ENCARGADAS DE FORMATEAR DINERO Y TASAS
  const formatCurrency = (val) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return `RD$ ${new Intl.NumberFormat("es-DO").format(num)}`;
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: formatCurrency(value) }));
  };

  const handleRateChange = (e) => {
    const { name, value } = e.target;
    // Permite máximo 2 dígitos para tasas de interés y moras
    const clean = value.replace(/\D/g, "").slice(0, 2);
    setFormData((prev) => ({ ...prev, [name]: clean }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. ENVÍO SEGURO DE DATOS LIMPIOS A LA BASE DE DATOS
  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawToken = localStorage.getItem("token");
    const payload = parseJwt(rawToken);

    if (!payload) {
      navigate("/login");
      return;
    }

    // Des-formateamos los campos antes de enviarlos (Quitamos RD$ y comas)
    const dataToSave = {
      ...formData,
      approved_amount: Number(formData.approved_amount.replace(/\D/g, "")),
      closing_costs: Number(formData.closing_costs.replace(/\D/g, "")),
      estimated_fee_amount: Number(
        formData.estimated_fee_amount.replace(/\D/g, ""),
      ),
      interest: Number(formData.interest),
      late_fee_percentage: Number(formData.late_fee_percentage),
      fees_count: Number(formData.fees_count),
      updated_at: new Date(),
    };

    try {
      await axios.post(
        "http://localhost:3001/users/lender-conditions",
        dataToSave,
      );
      Swal.fire({
        title: "Enviado",
        text: "¡Condiciones enviadas exitosamente!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al guardar las condiciones:", error);
      Swal.fire("Error", "No se pudieron registrar las condiciones", "error");
    }
  };

  return (
    <div className="lender-conditions">
      <div className="form-card">
        <div className="form-header">
          <h1>Condiciones del préstamo</h1>
          <p>Define los términos financieros para el cliente.</p>
        </div>

        <form className="lender-conditions-form" onSubmit={handleSubmit}>
          <div className="grid-container">
            <label className="field-label">
              Monto Aprobado
              <input
                className="form-input"
                type="text"
                name="approved_amount"
                value={formData.approved_amount}
                onChange={handleCurrencyChange}
                required
              />
            </label>

            <label className="field-label">
              Tasa de Interés Anual (%)
              <input
                className="form-input"
                type="text"
                name="interest"
                placeholder="Ej. 18"
                value={formData.interest}
                onChange={handleRateChange}
                required
              />
            </label>

            <label className="field-label">
              Cantidad de Cuotas (Meses)
              <input
                className="form-input"
                type="number"
                name="fees_count"
                placeholder="Ej. 12"
                value={formData.fees_count}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field-label">
              Monto Estimado de Cuota
              <input
                className="form-input readonly-input"
                type="text"
                name="estimated_fee_amount"
                value={formData.estimated_fee_amount}
                readOnly // Protegido contra modificaciones manuales
              />
            </label>

            <label className="field-label">
              Tipo de Interés
              <select
                className="form-select"
                name="interest_type"
                value={formData.interest_type}
                onChange={handleChange}
              >
                <option value="fija">Fija</option>
                <option value="variable">Variable</option>
              </select>
            </label>

            <label className="field-label">
              Frecuencia de Pago
              <select
                className="form-select"
                name="payment_frequency"
                value={formData.payment_frequency}
                onChange={handleChange}
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="semanal">Semanal</option>
              </select>
            </label>

            <label className="field-label">
              Costos de Cierre (Monto + Interés)
              <input
                className="form-input readonly-input"
                type="text"
                name="closing_costs"
                value={formData.closing_costs}
                readOnly // ¡AHORA CALCULADO AUTOMÁTICAMENTE Y PROTEGIDO!
              />
            </label>

            <label className="field-label">
              % Mora por Retraso
              <input
                className="form-input"
                type="text"
                name="late_fee_percentage"
                placeholder="Ej. 5"
                value={formData.late_fee_percentage}
                onChange={handleRateChange}
              />
            </label>
            <label className="field-label">
              Fecha de pago
              <input
                className="form-input"
                type="date"
                name="pay_days"
                value={formData.pay_days}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </label>

            
            <label className="field-label">
              Fecha de Expiración de Oferta
              <input
                className="form-input"
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="field-label field-textarea">
            Mensaje / Comentario Adicional
            <textarea
              className="form-textarea"
              name="message"
              placeholder="Detalles adicionales sobre los requisitos o desembolso..."
              value={formData.message}
              onChange={handleChange}
            />
          </label>

          <button className="submit-button" type="submit">
            Enviar Oferta al Cliente
          </button>
        </form>
      </div>
    </div>
  );
};

export default LenderConditions;
