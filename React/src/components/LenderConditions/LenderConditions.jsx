import React, { useState } from 'react';
import './LenderConditions.css';

const LenderConditions = () => {
    const [formData, setFormData] = useState({
        approved_amount: '',
        interest: '',
        interest_type: 'fixed',
        rate_revision_period: 'anual',
        amortization_system: 'frances',
        fees_count: '',
        estimated_fee_amount: '',
        closing_costs: '',
        late_fee_percentage: '',
        message: '',
        expiration_date: '',
        state: 'active',
        created_at: new Date(),
        updated_at: new Date(),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Aquí puedes enviar los datos al servidor
    };

    return (
        <div className="lender-conditions">
            <div className="form-card">
                <div className="form-header">
                    <h1>Lender Conditions</h1>
                    <p>Define los términos del préstamo con un diseño limpio, moderno y fácil de usar.</p>
                </div>

                <form className="lender-conditions-form" onSubmit={handleSubmit}>
                    <label className="field-label">
                        Monto Aprobado
                        <input
                            className="form-input"
                            type="number"
                            name="approved_amount"
                            value={formData.approved_amount}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label">
                        Tasa de Interés
                        <input
                            className="form-input"
                            type="number"
                            name="interest"
                            value={formData.interest}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label">
                        Tipo de Interés
                        <select
                            className="form-select"
                            name="interest_type"
                            value={formData.interest_type}
                            onChange={handleChange}
                        >
                            <option value="fixed">Fija</option>
                            <option value="variable">Variable</option>
                        </select>
                    </label>

                    <label className="field-label">
                        Periodo de Revisión de Tasa
                        <select
                            className="form-select"
                            name="rate_revision_period"
                            value={formData.rate_revision_period}
                            onChange={handleChange}
                        >
                            <option value="anual">Anual</option>
                            <option value="semestral">Semestral</option>
                            <option value="mensual">Mensual</option>
                        </select>
                    </label>

                    <label className="field-label">
                        Sistema de Amortización
                        <select
                            className="form-select"
                            name="amortization_system"
                            value={formData.amortization_system}
                            onChange={handleChange}
                        >
                            <option value="frances">Frances</option>
                            <option value="alemann">Alemán</option>
                            <option value="americano">Americano</option>
                        </select>
                    </label>

                    <label className="field-label">
                        Cantidad de Cuotas
                        <input
                            className="form-input"
                            type="number"
                            name="fees_count"
                            value={formData.fees_count}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label">
                        Monto Estimado de Cuota
                        <input
                            className="form-input"
                            type="number"
                            name="estimated_fee_amount"
                            value={formData.estimated_fee_amount}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label">
                        Costos de Cierre
                        <input
                            className="form-input"
                            type="number"
                            name="closing_costs"
                            value={formData.closing_costs}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label">
                        Porcentaje de Multa por Retraso
                        <input
                            className="form-input"
                            type="number"
                            name="late_fee_percentage"
                            value={formData.late_fee_percentage}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label field-textarea">
                        Mensaje / Comentario
                        <textarea
                            className="form-textarea"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                        />
                    </label>

                    <label className="field-label">
                        Fecha de Expiración
                        <input
                            className="form-input"
                            type="date"
                            name="expiration_date"
                            value={formData.expiration_date}
                            onChange={handleChange}
                        />
                    </label>

                    <button className="submit-button" type="submit">Guardar</button>
                </form>
            </div>
        </div>
    );
};

export default LenderConditions;
