import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoanRequestForm.css';

function LoanRequestForm({ user }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestData = {
      userId: user.id,
      monto: amount,
      motivo: reason,
      status: 'pendiente',
      fecha: new Date().toLocaleDateString()
    };
    console.log("Solicitud anónima lanzada a los bancos:", requestData);
    alert("¡Solicitud publicada! Ahora espera a que los bancos te envíen sus propuestas.");
    navigate('/dashboard', {replace: true});
  };

  return (
    <div className="request-container">
      <form className="request-card" onSubmit={handleSubmit}>
        <h2>Nueva Solicitud Anónima</h2>
        <p className="request-desc">
          Tu identidad permanecerá oculta. Solo se mostrará tu monto solicitado y tu valoración como cliente.
        </p>

        <div className="input-group">
          <label>Monto que necesitas (RD$)</label>
          <input 
            type="number" 
            placeholder="Ej. 50000" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <label>¿Para qué usarás el dinero?</label>
          <textarea 
            placeholder="Ej. Inversión en inventario para mi tienda de repuestos..." 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <small>Esto ayuda a los bancos a entender el propósito de tu préstamo.</small>
        </div>

        <button type="submit" className="btn-submit-request">Publicar Solicitud</button>
      </form>
    </div>
  );
}

export default LoanRequestForm;