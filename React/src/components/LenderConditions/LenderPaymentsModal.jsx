import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ShowLenderConditions.css";

const LenderPaymentsModal = ({ lenderConditionsId, onClose, onPaymentRegistered }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState(null);

  useEffect(() => {
    const resolveCondition = async () => {
      try {
        // lenderConditionsId may be an object with details
        if (!lenderConditionsId) return;

        let cond = null;
        if (typeof lenderConditionsId === "object") {
          if (lenderConditionsId.lender_conditions_id) {
            const res = await axios.get(`http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${lenderConditionsId.lender_conditions_id}`);
            cond = Array.isArray(res.data) ? res.data[0] : res.data;
          } else if (lenderConditionsId.request_id && lenderConditionsId.lender_id) {
            const res2 = await axios.get(`http://localhost:3001/users/get-lender-conditions-by-request?request_id=${lenderConditionsId.request_id}&lender_id=${lenderConditionsId.lender_id}`);
            cond = res2.data;
          }
        } else {
          // assume primitive id
          const res = await axios.get(`http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${lenderConditionsId}`);
          cond = Array.isArray(res.data) ? res.data[0] : res.data;
        }

        if (cond) {
          setCondition(cond);
          // Prefill amount with estimated fee amount when available
          if (cond.estimated_fee_amount) setAmount(parseFloat(cond.estimated_fee_amount));
          else if (cond.approved_amount && cond.fees_count) setAmount((parseFloat(cond.approved_amount) / parseInt(cond.fees_count)).toFixed(2));
        }
      } catch (err) {
        console.error("Error resolviendo condiciones en payments modal:", err);
      }
    };
    resolveCondition();
  }, [lenderConditionsId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!amount) return alert("Ingresa un monto");
    setLoading(true);
    try {
      const body = {
        amount: parseFloat(amount),
        payment_method: method,
        notes,
      };
      // allow backend to resolve via lender_conditions_id or loan_id
      if (typeof lenderConditionsId === "object") {
        if (lenderConditionsId.lender_conditions_id) body.lender_conditions_id = lenderConditionsId.lender_conditions_id;
        else if (lenderConditionsId.request_id) body.lender_conditions_id = lenderConditionsId.request_id;
      } else {
        body.lender_conditions_id = lenderConditionsId;
      }

      const res = await axios.post("http://localhost:3001/users/register-payment", body);
      if (res.status === 201) {
        alert("Pago registrado");
        onPaymentRegistered && onPaymentRegistered();
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Error registrando pago");
    } finally {
      setLoading(false);
    }
  };

  if (!lenderConditionsId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Registrar Pago</h3>
        <form className="payment-form" onSubmit={submit}>
          <div className="form-row">
            <label>Monto</label>
            <input className="form-input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Método</label>
            <input className="form-input" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Efectivo / Transferencia" />
          </div>

          <div className="form-row">
            <label>Notas</label>
            <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="button-row">
            <button className="btn-action" type="submit" disabled={loading}>{loading ? "Guardando..." : "Registrar pago"}</button>
            <button className="back-btn" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LenderPaymentsModal;
