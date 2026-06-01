import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./LenderConditions.css";

const ConfirmLoan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    lender_conditions_id,
    notification_id,
    client_request_id,
    client_id,
  } = location.state || {};

  const [condition, setCondition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCondition = async () => {
      try {
        let lcId = lender_conditions_id;

        // If lc id is not provided, try to resolve it by request_id + lender_id
        if (!lcId && client_request_id && (location.state?.lender_id || location.state?.lender_id === 0)) {
          try {
            const resp = await axios.get(`http://localhost:3001/users/get-lender-conditions-by-request`, {
              params: { request_id: client_request_id, lender_id: location.state.lender_id },
            });
            lcId = resp.data?.id;
          } catch (e) {
            console.warn('No se pudo resolver lender_conditions por request:', e);
          }
        }

        if (!lcId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${lcId}`,
        );
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setCondition(data);
      } catch (error) {
        console.error("Error cargando condiciones del préstamo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCondition();
  }, [lender_conditions_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!condition) return;

    setSubmitting(true);
    try {
      const response = await axios.post("http://localhost:3001/users/register-loan", {
        lender_conditions_id,
        notification_id,
        client_request_id,
        lender_id: condition.lender_id,
        client_id,
      });

      Swal.fire({
        title: "Préstamo activo",
        text: response.data.message || "El préstamo fue registrado correctamente.",
        icon: "success",
        confirmButtonText: "Volver al panel",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      console.error("Error registrando el préstamo:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo confirmar el préstamo.",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="conditions-container">
      <header className="conditions-header">
        <h1>Confirmación de Préstamo</h1>
        <p>Revisa los datos antes de activar el préstamo y dejarlo como vigente.</p>
      </header>

      {!loading && !condition ? (
        <div className="empty-schedule-state">
          <p>No se encontró la condición de préstamo para confirmar.</p>
        </div>
      ) : (
        <div className="conditions-content-layout">
          <form onSubmit={handleSubmit} className="conditions-form">
            <div className="form-section-title">Datos de la Condición</div>
            <div className="input-group-row">
              <div className="form-field">
                <label>Monto Aprobado</label>
                <input
                  type="number"
                  value={condition?.approved_amount ?? ""}
                  readOnly
                />
              </div>
              <div className="form-field">
                <label>Tasa de Interés</label>
                <input
                  type="text"
                  value={`${condition?.interest ?? ""}%`}
                  readOnly
                />
              </div>
            </div>

            <div className="input-group-row">
              <div className="form-field">
                <label>Tipo de interés</label>
                <input type="text" value={condition?.interest_type ?? ""} readOnly />
              </div>
              <div className="form-field">
                <label>Sistema de amortización</label>
                <input type="text" value={condition?.amortization_system ?? ""} readOnly />
              </div>
            </div>

            <div className="input-group-row">
              <div className="form-field">
                <label>Frecuencia de pago</label>
                <input type="text" value={condition?.payment_frequency ?? ""} readOnly />
              </div>
              <div className="form-field">
                <label>Número de cuotas</label>
                <input type="number" value={condition?.fees_count ?? ""} readOnly />
              </div>
            </div>

            <div className="input-group-row">
              <div className="form-field">
                <label>Cuota estimada</label>
                <input type="text" value={`RD$ ${parseFloat(condition?.estimated_fee_amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} readOnly />
              </div>
              <div className="form-field">
                <label>Gastos de cierre</label>
                <input type="text" value={`RD$ ${parseFloat(condition?.closing_costs ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} readOnly />
              </div>
            </div>

            <div className="form-field">
              <label>% Recargo por Mora</label>
              <input type="text" value={`${condition?.late_fee_percentage ?? 0}%`} readOnly />
            </div>
            <div className="form-field">
              <label>Primer día de pago</label>
              <input type="date" value={condition?.pay_days ?? ""} readOnly />
            </div>
            <div className="form-field">
              <label>Mensaje del prestamista</label>
              <textarea value={condition?.message ?? ""} readOnly rows={4} />
            </div>

            <button type="submit" className="btn-submit-conditions" disabled={submitting}>
              {submitting ? "Confirmando préstamo..." : "Registrar préstamo activo"}
            </button>
          </form>

          <div className="conditions-preview-panel">
            <div className="preview-card-summary">
              <h3>Resumen</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>ID Condición</span>
                  <strong>{condition?.id}</strong>
                </div>
                <div className="summary-item">
                  <span>ID Solicitud</span>
                  <strong>{condition?.request_id}</strong>
                </div>
                <div className="summary-item">
                  <span>ID Cliente</span>
                  <strong>{client_id || "N/A"}</strong>
                </div>
                <div className="summary-item">
                  <span>ID Notificación</span>
                  <strong>{notification_id || "N/A"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmLoan;
