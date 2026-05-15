import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoanRequestForm.css";
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

function LoanRequestForm() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rawToken = localStorage.getItem("token");
    const payload = parseJwt(rawToken);

    const tokenValido = payload?.exp * 1000 > Date.now();

    console.log(payload);
    console.log(tokenValido);

    if (!tokenValido) {
      alert("Tu sesión ha expirado.");
      navigate("/login");
      return;
    }

    if (!tokenValido) {
      alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
      navigate("/login");
      return;
    }

    const requestData = {
      user_id: payload.id, // viene del JWT
      amount: amount,
      reason: reason,
      state: "pendiente",
    };

    try {
      const res = await axios.post(
        "http://localhost:3001/users/publications",
        requestData,
        {
          headers: { Authorization: `Bearer ${rawToken}` },
        },
      );
      console.log("Respuesta del backend:", res.data);
      Swal.fire({
        title: "Solicitud publicada exitosamente!",
        html: "¡ Ahora espera a que los bancos te envíen sus propuestas.",
        icon: "success",
        timer: 3000,
      });
      //alert("¡Solicitud publicada! Ahora espera a que los bancos te envíen sus propuestas.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error al publicar solicitud:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Hubo un error al publicar tu solicitud.",
      });
    }
  };

  return (
    <div className="request-container">
      <form className="request-card" onSubmit={handleSubmit}>
        <h2>Nueva Solicitud Anónima</h2>
        <p className="request-desc">
          Tu identidad permanecerá oculta. Solo se mostrará tu monto solicitado
          y tu valoración como cliente.
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
          <small>
            Esto ayuda a los bancos a entender el propósito de tu préstamo.
          </small>
        </div>

        <button type="submit" className="btn-submit-request">
          Publicar Solicitud
        </button>
      </form>
    </div>
  );
}

export default LoanRequestForm;
