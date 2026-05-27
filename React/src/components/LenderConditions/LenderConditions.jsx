import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LenderConditions.css";

const LenderConditions = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Recuperar absolutamente todo el contexto proveniente de ClientInfo
  const { lender_id, request_id, notification_id, notification_client_id, clientProfile } =
    location.state || {};

  // Intentar obtener el monto que el cliente solicitó originalmente para sugerirlo
  const initialAmount = clientProfile?.request?.amount || clientProfile?.client?.amount_requested || "";

  // 2. Estado de los inputs alineado con la desestructuración de tu backend
  const [formData, setFormData] = useState({
    request_id: request_id || "",
    lender_id: lender_id || "",
    approved_amount: initialAmount,
    interest: "",
    interest_type: "fija", 
    rate_revision_period: "",
    amortization_system: "frances", 
    payment_frequency: "mensual", 
    fees_count: "",
    estimated_fee_amount: "0.00",
    closing_costs: "0.00",
    late_fee_percentage: "0.00",
    message: "",
    pay_days: "" 
  });

  // Estado auxiliar para calcular los días de validez antes de enviarlo como fecha completa
  const [expirationDays, setExpirationDays] = useState("5");

  // Estados para controlar la renderización del calendario y estado de carga
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 3. useEffect dinámico: recalcula la amortización automáticamente ante cualquier cambio
  useEffect(() => {
    calculateAmortization();
  }, [
    formData.approved_amount,
    formData.interest,
    formData.amortization_system,
    formData.payment_frequency,
    formData.fees_count,
    formData.pay_days
  ]);

  // Manejador universal de cambios en los inputs para evitar bloqueos al escribir
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. Lógica Matemática de Amortización Dinámica (Francesa y Alemana)
  const calculateAmortization = () => {
    const principal = parseFloat(formData.approved_amount);
    const annualRate = parseFloat(formData.interest);
    const periods = parseInt(formData.fees_count);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(periods) || principal <= 0 || annualRate <= 0 || periods <= 0) {
      setAmortizationSchedule([]);
      return;
    }

    // Definir la fecha base: si el usuario seleccionó una en pay_days se usa, sino el día actual
    let baseDate = formData.pay_days ? new Date(formData.pay_days) : new Date();
    let currentPayDate = new Date(baseDate);

    let ratePerPeriod = 0;
    let daysToAdd = 30;

    switch (formData.payment_frequency) {
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
    let calculatedFee = 0;

    if (formData.amortization_system === "frances") {
      calculatedFee = (principal * ratePerPeriod) / (1 - Math.pow(1 + ratePerPeriod, -periods));
      
      // Actualización directa y segura sin ciclar el useEffect
      formData.estimated_fee_amount = calculatedFee.toFixed(2);

      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * ratePerPeriod;
        const principalPayment = calculatedFee - interestPayment;
        remainingBalance -= principalPayment;

        schedule.push({
          feeNumber: i,
          paymentDate: currentPayDate.toISOString().split("T")[0],
          feeAmount: calculatedFee,
          interestPayment: interestPayment,
          principalPayment: principalPayment,
          remainingBalance: Math.max(0, remainingBalance),
        });

        currentPayDate.setDate(currentPayDate.getDate() + daysToAdd);
      }
    } else if (formData.amortization_system === "aleman") {
      const principalPayment = principal / periods;
      
      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * ratePerPeriod;
        const feeAmount = principalPayment + interestPayment;
        
        if (i === 1) calculatedFee = feeAmount; 
        
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
      formData.estimated_fee_amount = calculatedFee.toFixed(2);
    }

    setAmortizationSchedule(schedule);
  };

  // 5. Envío del Formulario acoplado con tu función `createLenderConditions`
  const handleSubmitConditions = async (e) => {
    e.preventDefault();
    if (amortizationSchedule.length === 0) {
      alert("Por favor, introduce los valores del préstamo para calcular la proyección.");
      return;
    }

    setSubmitting(true);

    // Calcular la fecha exacta de expiración (expiration_date)
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + parseInt(expirationDays || 5));
    const formattedExpirationDate = expDate.toISOString().slice(0, 19).replace("T", " ");

    // Construcción del payload asegurando que NINGÚN campo sea null o vacío para pasar tu validación if()
    const payload = {
      request_id: parseInt(formData.request_id),
      lender_id: parseInt(formData.lender_id),
      approved_amount: parseFloat(formData.approved_amount),
      interest: parseFloat(formData.interest),
      interest_type: formData.interest_type,
      // Si es fija, tu backend exige que no esté vacío, mandamos "No aplica"
      rate_revision_period: formData.interest_type === "variable" ? formData.rate_revision_period : "No aplica",
      amortization_system: formData.amortization_system,
      payment_frequency: formData.payment_frequency,
      fees_count: parseInt(formData.fees_count),
      estimated_fee_amount: parseFloat(formData.estimated_fee_amount),
      closing_costs: formData.closing_costs || "0.00",
      late_fee_percentage: formData.late_fee_percentage || "0.00",
      message: formData.message.trim() === "" ? "Términos estándar propuestos por el prestamista." : formData.message,
      expiration_date: formattedExpirationDate,
      pay_days: formData.pay_days, // Envía la fecha seleccionada en el input
      notification_id: parseInt(notification_id), // Requerido obligatoriamente por tu backend
      notification_client_id: parseInt(notification_client_id) // Requerido obligatoriamente por tu backend
    };

    try {
      // Petición dirigida a tu controlador Express
      const response = await axios.post("http://localhost:3001/users/lender-conditions", payload);
      alert("¡Condiciones guardadas! Oferta enviada al cliente y notificación actualizada con éxito.");
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Error al enviar las condiciones:", error);
      if (error.response && error.response.data) {
        alert(`Error del servidor: ${error.response.data.message}`);
      } else {
        alert("Hubo un error de conexión con el backend.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="conditions-container">
      <header className="conditions-header">
        <h1>Configuración de Condiciones de Préstamo</h1>
        <p>Estructurando propuesta para la solicitud de préstamo #{formData.request_id}</p>
      </header>

      <div className="conditions-content-layout">
        
        {/* COLUMNA DEL FORMULARIO INTERACTIVO */}
        <form onSubmit={handleSubmitConditions} className="conditions-form">
          <div className="form-section-title">Parámetros del Crédito</div>
          
          <div className="input-group-row">
            <div className="form-field">
              <label>Monto Aprobado (RD$)</label>
              <input
                type="number"
                name="approved_amount"
                value={formData.approved_amount}
                onChange={handleInputChange}
                placeholder="Monto a desembolsar"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Tasa de Interés Anual (%)</label>
              <input
                type="number"
                step="0.01"
                name="interest"
                value={formData.interest}
                onChange={handleInputChange}
                placeholder="Ej. 18.5"
                required
              />
            </div>
          </div>

          <div className="input-group-row">
            <div className="form-field">
              <label>Sistema de Amortización</label>
              <select name="amortization_system" value={formData.amortization_system} onChange={handleInputChange}>
                <option value="frances">frances (Cuota Fija)</option>
                <option value="aleman">aleman (Amortización Fija)</option>
              </select>
            </div>

            <div className="form-field">
              <label>Frecuencia de Pago</label>
              <select name="payment_frequency" value={formData.payment_frequency} onChange={handleInputChange}>
                <option value="semanal">semanal</option>
                <option value="quincenal">quincenal</option>
                <option value="mensual">mensual</option>
              </select>
            </div>
          </div>

          <div className="input-group-row">
            <div className="form-field">
              <label>Cantidad de Cuotas</label>
              <input
                type="number"
                name="fees_count"
                value={formData.fees_count}
                onChange={handleInputChange}
                placeholder="Número de pagos"
                required
              />
            </div>

            <div className="form-field">
              <label>Fecha de Primer Pago (pay_days)</label>
              <input
                type="date"
                name="pay_days"
                value={formData.pay_days}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Tipo de Interés</label>
            <select name="interest_type" value={formData.interest_type} onChange={handleInputChange}>
              <option value="fija">fija</option>
              <option value="variable">variable</option>
            </select>
          </div>

          {formData.interest_type === "variable" && (
            <div className="form-field animate-fade">
              <label>Período de Revisión de Tasa</label>
              <input
                type="text"
                name="rate_revision_period"
                value={formData.rate_revision_period}
                onChange={handleInputChange}
                placeholder="Ej. Cada 6 meses"
                required={formData.interest_type === "variable"}
              />
            </div>
          )}

          <div className="form-section-title">Costos de Operación y Oferta</div>

          <div className="input-group-row">
            <div className="form-field">
              <label>Gastos de Cierre (RD$)</label>
              <input
                type="number"
                step="0.01"
                name="closing_costs"
                value={formData.closing_costs}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-field">
              <label>% Recargo por Mora</label>
              <input
                type="number"
                step="0.01"
                name="late_fee_percentage"
                value={formData.late_fee_percentage}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Días de Validez de la Oferta (Calcula expiration_date)</label>
            <input
              type="number"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-field">
            <label>Mensaje o Comentarios para el Cliente</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Escribe aclaraciones opcionales..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit-conditions" disabled={submitting}>
            {submitting ? "Ejecutando Procesos en Servidor..." : "Subir Condiciones y Enviar"}
          </button>
        </form>

        {/* COLUMNA DERECHA: PANEL DE MONITOREO DINÁMICO */}
        <div className="conditions-preview-panel">
          <div className="preview-card-summary">
            <h3>Cuota Proyectada</h3>
            <div className="summary-main-value">
              <span className="currency">RD$</span>
              <span className="amount">
                {parseFloat(formData.estimated_fee_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="period-label">
                {formData.amortization_system === "frances" ? ` / ${formData.payment_frequency}` : " / 1era cuota base"}
              </span>
            </div>
            
            <div className="summary-grid">
              <div className="summary-item">
                <span>Capital</span>
                <strong>RD$ {parseFloat(formData.approved_amount || 0).toLocaleString()}</strong>
              </div>
              <div className="summary-item">
                <span>Tasa Interés</span>
                <strong>{formData.interest || 0}% Anual</strong>
              </div>
              <div className="summary-item">
                <span>Método</span>
                <strong className="capitalize">{formData.amortization_system}</strong>
              </div>
            </div>
          </div>

          {/* LISTADO DE DÍAS DE PAGO TIPO CALENDARIO */}
          <div className="preview-schedule-wrapper">
            <h3>Cronograma Detallado de Pagos</h3>
            {amortizationSchedule.length > 0 ? (
              <div className="table-responsive">
                <table className="amortization-table">
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Día de Pago</th>
                      <th>Total Cuota</th>
                      <th>Capital</th>
                      <th>Interés</th>
                      <th>Balance Restante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.map((row) => (
                      <tr key={row.feeNumber}>
                        <td>#{row.feeNumber}</td>
                        <td>{row.paymentDate}</td>
                        <td className="bold">RD$ {row.feeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>RD$ {row.principalPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>RD$ {row.interestPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>RD$ {row.remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-schedule-state">
                <p>Ingresa los datos del crédito y selecciona la fecha inicial para proyectar dinámicamente los días de cobro.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LenderConditions;