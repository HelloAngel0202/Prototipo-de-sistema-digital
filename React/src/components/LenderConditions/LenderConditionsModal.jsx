import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ShowLenderConditions.css";

const LenderConditionsModal = ({ lenderConditionsId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      if (!lenderConditionsId) return;
      try {
        const res = await axios.get(
          `http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${lenderConditionsId}`,
        );
        const payload = Array.isArray(res.data) ? res.data[0] : res.data;
        setData(payload);
        generateSchedule(payload);
      } catch (err) {
        console.error("Error fetching conditions in modal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [lenderConditionsId]);

  const generateSchedule = (conditions) => {
    if (!conditions) return;
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

    let scheduleArr = [];
    let remainingBalance = principal;

    if (system === "frances") {
      const feeAmount = (principal * ratePerPeriod) / (1 - Math.pow(1 + ratePerPeriod, -periods));
      for (let i = 1; i <= periods; i++) {
        const interestPayment = remainingBalance * ratePerPeriod;
        const principalPayment = feeAmount - interestPayment;
        remainingBalance -= principalPayment;
        scheduleArr.push({
          feeNumber: i,
          paymentDate: currentPayDate.toISOString().split("T")[0],
          feeAmount: feeAmount,
          interestPayment,
          principalPayment,
          remainingBalance: Math.max(0, remainingBalance),
        });
        currentPayDate.setDate(currentPayDate.getDate() + daysToAdd);
      }
    }

    setSchedule(scheduleArr);
  };

  if (!lenderConditionsId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {loading ? (
          <p>Cargando condiciones...</p>
        ) : data ? (
          <div className="conditions-section">
            <h3>Condiciones del Prestamista</h3>
            <p><strong>Banco:</strong> {data.lender_name || "No disponible"}</p>
            <p><strong>Monto Aprobado:</strong> RD$ {Number(data.approved_amount).toLocaleString()}</p>
            <p><strong>Interés:</strong> {data.interest}%</p>
            <p><strong>Frecuencia:</strong> {data.payment_frequency}</p>
            <p><strong>Cuotas:</strong> {data.fees_count}</p>

            {schedule.length > 0 && (
              <div className="table-responsive-container">
                <table className="client-amortization-table">
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Capital</th>
                      <th>Interés</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((r) => (
                      <tr key={r.feeNumber}>
                        <td>#{r.feeNumber}</td>
                        <td>{r.paymentDate}</td>
                        <td>RD$ {r.feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>RD$ {r.principalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>RD$ {r.interestPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>RD$ {r.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p>No se encontraron condiciones para este préstamo.</p>
        )}
      </div>
    </div>
  );
};

export default LenderConditionsModal;
