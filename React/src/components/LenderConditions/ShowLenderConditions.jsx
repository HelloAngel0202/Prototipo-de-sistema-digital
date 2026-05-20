import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LenderConditions.css';
import axios from 'axios';
import Swal from "sweetalert2";


const ShowLenderConditions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [lenderConditions, setLenderConditions] = useState(null);

    const acceptOffer = (offer) => {
        try {
            axios.get(`http://localhost:3001/users/accept-offer?offerId=${offer.id}&clientRequestId=${offer.request_id}&lender_user_id=${location.state.lender_user_id}&client_user_id=${location.state.client_user_id}`)
                .then(response => {
                    Swal.fire({
                        title: "Aceptado",
                        html: "¡Oferta aceptada exitosamente!",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    navigate('/dashboard');
                })
                .catch(error => {
                    console.error('Error al aceptar la oferta:', error);
                    Swal.fire({
                        title: "Error",
                        html: "Hubo un error al aceptar la oferta. Por favor, intenta nuevamente.",
                        icon: "error",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                });
        } catch (error) {
            console.error('Error al aceptar la oferta:', error);
            alert('Hubo un error al aceptar la oferta. Por favor, intenta nuevamente.2');
        }
    }

    useEffect(() => {
        const ShowLenderConditions = () => {
            axios.get(`http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${location.state.lender_conditions_id}`)
                .then(response => {
                    setLenderConditions(response.data);
                })
                .catch(error => {
                    console.error('Error al obtener condiciones:', error);
                });
        };
        ShowLenderConditions();
    }, [location.state.lender_conditions_id]);
    return (
        <div className="lender-conditions-container">
            <h2>Condiciones del Prestamista</h2>

            {lenderConditions ? (
                <div className="conditions-details">
                    <p><strong>Monto Aprobado:</strong> {lenderConditions.approved_amount}</p>
                    <p><strong>Interés:</strong> {lenderConditions.interest} %</p>
                    <p><strong>Tipo de Interés:</strong> {lenderConditions.interest_type}</p>
                    <p><strong>Periodo de Revisión de Tasa:</strong> {lenderConditions.rate_revision_period}</p>
                    <p><button onClick={() => navigate('/dashboard')}>Volver al dashboard</button></p>
                </div>
            ) : (
                <p>Condiciones no encontradas.</p>
            )}
        </div>
    );
};

export default ShowLenderConditions;

