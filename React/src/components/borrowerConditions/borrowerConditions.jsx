import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/borrowerConditions.css';
import axios from 'axios';

const ShowClient = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [client, setClient] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:3001/users/show-client?client_id=${location.state.client_id}`)
            .then(response => {
                setClient(response.data);
            })
            .catch(error => {
                console.error('Error al obtener datos del cliente:', error);
            });
    }, [location.state.client_id]);

    return (
        <div className="client-page">
            <div className="client-card">

                <div className="client-header">
                    <h2 className="client-title">Datos del Cliente</h2>
                    <p className="client-subtitle">Información personal registrada</p>
                </div>

                {client ? (
                    <div className="client-section">
                        <div className="client-item">
                            <span>Nombre</span>
                            <strong>{client.first_name} {client.last_name}</strong>
                        </div>

                        <div className="client-item">
                            <span>Teléfono</span>
                            <strong>{client.phone}</strong>
                        </div>

                        <div className="client-item">
                            <span>Celular</span>
                            <strong>{client.cellphone || "No registrado"}</strong>
                        </div>

                        <div className="client-item">
                            <span>Nacionalidad</span>
                            <strong>{client.nationality}</strong>
                        </div>

                        <div className="client-item">
                            <span>Fecha de Nacimiento</span>
                            <strong>{client.birth_date}</strong>
                        </div>

                        <div className="client-item">
                            <span>Ocupación</span>
                            <strong>{client.ocupation}</strong>
                        </div>

                        <div className="client-item">
                            <span>Ciudad</span>
                            <strong>{client.city}</strong>
                        </div>

                        <div className="client-item">
                            <span>Documento</span>
                            <strong>{client.document} ({client.document_type})</strong>
                        </div>

                        <div className="client-item">
                            <span>Estado Civil</span>
                            <strong>{client.Estado_civil}</strong>
                        </div>

                        <div className="button-group">
                            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                                Volver
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="loading-container">
                        <p>Cliente no encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowClient;
