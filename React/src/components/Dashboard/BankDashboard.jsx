import './BankDashboard.css';

function BankDashboard({ user}){
 //Datos simulados
 const solicitudes = [
    { id: 101, monto: 50000, motivo: "Compra de equipos médicos", rating: 4.9, fecha: "Hoy" },
    { id: 102, monto: 120000, motivo: "Expansión de inventario - Tienda Online", rating: 4.2, fecha: "Ayer" },
    { id: 103, monto: 15000, motivo: "Reparación de motor de vehículo", rating: 3.8, fecha: "Hace 2 horas" }
  ];

  return (
    <div className="lender-container">
        <header className='lender-header'>
            <div>
                <h1>Panel de Inversiones</h1>
                <p>Bienvenido, representante de <strong>{user.name}</strong></p>
            </div>
            <div className="lender-stats">
                <div className="stat-box">
                    <span>Cartera Activa</span>
                    <strong>RD$ 1.2M</strong>
                </div>
            </div>
        </header>
        <section className="market-feed">
            <h2>Oportunidades de Préstamos</h2>
            <p className='subtitle'>Solicitudes anónimas pendientes de ofertas</p>

            {solicitudes.map(solicitud => (
                <div key={solicitud.id} className="request-feed-card">
                    <div className="card-top">
                        <span className="amount-tag">RD$ {solicitud.monto.toLocaleString()}</span>
                        <span className="user-rating">⭐ {solicitud.rating}</span>
                    </div>
                    <p className='request-reason'>"{solicitud.motivo}"</p>
                    <div className="card-bottom">
                        <span className="request-date">{solicitud.fecha}</span>
                        <button className="btn-offer">Enviar Propuesta</button>
                    </div>
                </div>
            ))}
        </section>
    </div>
  );
}

export default BankDashboard;