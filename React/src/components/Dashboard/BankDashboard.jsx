import "./BankDashboard.css";
import axios from "axios";
import { useState, useEffect } from "react";

function BankDashboard({ user }) {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/user/brpublic"
        );

        console.log(response.data);

        setPublications(response.data);
      } catch (error) {
        console.error("Error obteniendo publicaciones:", error);
      }
    };

    obtenerSolicitudes();
  }, []);

  return (
    <div className="lender-container">
      <header className="lender-header">
        <div>
          <h1>Panel de Inversiones</h1>
          <p>
            Bienvenido, representante de <strong>{user.name}</strong>
          </p>
        </div>
      </header>

      <section className="market-feed">
        <h2>Oportunidades de Préstamos</h2>

        {publications.map((solicitud) => (
          <div key={solicitud.id} className="request-feed-card">
            <div className="card-top">
              <span className="amount-tag">
                RD$ {Number(solicitud.amount).toLocaleString()}
              </span>
            </div>

            <p>{solicitud.reason}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default BankDashboard;