import './OfferList.css';

function OfferList() {
    //Datos simulados hasta conectar con el backend de Angel
    const ofertas = [
        {
            id: 1,
            banco: "Banco Popular",
            tasa: "12.5%",
            plazo: "24 Meses",
            cuota: "RD$ 2,450.00",
            tipo: "Fija",
            puntos: 4.9
        },
        {
            id: 2,
            banco: "Banreservas",
            tasa: "11.8%",
            plazo: "18 meses",
            cuota: "RD$ 3,100.00",
            tipo: "Variable",
            puntos: 4.7
        }
    ];

    return (
        <div className="offers-container">
            <h3>Ofertas Recibidas</h3>
            <p className="offers-subtitle">Compara las condiciones y elige la que prefieras</p>

            <div className="offers-grid">
                {ofertas.map(oferta => (
                    <div key={oferta.id} className="offer-card">
                        <div className="offer-header">
                            <span className="bank-badge">{oferta.banco}</span>
                            <span className="rating">⭐ {oferta.puntos}</span>
                        </div>

                        <div className="offer-body">
                            <div className="detail">
                                <span>Tasa Anual</span>
                                <strong>{oferta.tasa}</strong>
                            </div>
                            <div className="detail">
                                <span>Plazo</span>
                                <strong>{oferta.plazo}</strong>
                            </div>
                            <div className="detail">
                                <span>Cuota Est.</span>
                                <strong>{oferta.cuota}</strong>
                            </div>
                        </div>

                        <div className="offer-footer">
                            <span className="type-tag">{oferta.tipo}</span>
                            <button className="btn-accept" onClick={() => alert(`Has seleccionado a ${oferta.banco}`)}>
                                Aceptar Oferta
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OfferList;