import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LenderConditions.css';
import axios from 'axios';
import Swal from "sweetalert2";

const ShowLenderConditions = () => {
    const location = useLocation();
    const [lenderConditions, setLenderConditions] = useState(null);

    useEffect(() => {
        const ShowLenderConditions = () => {

            axios.get(`http://localhost:3001/users/show-lender-conditions?lender_conditions_id=${location.state.lender_conditions_id}`)
                .then(response => {
                    console.log(response.data);
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
                    
                </div>
            ) : (
                <p>Condiciones no encontradas.</p>
            )}
        </div>
    );
};

export default ShowLenderConditions;

