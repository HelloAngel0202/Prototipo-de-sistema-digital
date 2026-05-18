const { request } = require("express");
const db = require("../bd");

const createLenderConditions = async (req, res) => {
  const { request_id, lender_id, approved_amount, interest, interest_type,rate_revision_period, amortization_system, fees_count, estimated_fee_amount, closing_costs, late_fee_percentage, message, expiration_date, notification_id } = req.body;
  console.log('Datos recibidos para crear condiciones del prestamista:', req.body);
  try {
    if (!request_id  || !lender_id || !approved_amount || !interest || !interest_type || !rate_revision_period || !amortization_system || !fees_count || !estimated_fee_amount || !closing_costs || !late_fee_percentage || !message || !expiration_date || !notification_id) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    db.query(
      "INSERT INTO lender_conditions (request_id, lender_id, approved_amount, interest, interest_type, rate_revision_period, amortization_system, fees_count, estimated_fee_amount, closing_costs, late_fee_percentage, message, expiration_date, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [request_id, lender_id, approved_amount, interest, interest_type, rate_revision_period, amortization_system, fees_count, estimated_fee_amount, closing_costs, late_fee_percentage, message, expiration_date, 'pending', new Date(), new Date()],
      (err, result) => {
        if (err) {
          console.error("Error al crear condiciones del prestamista:", err);
          return res.status(500).json({ message: "Error al crear condiciones del prestamista" });
        }

        db.query(
          "UPDATE notifications SET state = 3 WHERE id = ?",
          [notification_id],
          (updateErr) => {
            if (updateErr) {
              console.error("Error al actualizar el estado de notifications:", updateErr);
              return res.status(500).json({ message: "Error al actualizar el estado de la notificación" });
            }

            res.status(201).json({ message: "Condiciones del prestamista creadas exitosamente", id: result.insertId });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error en crear condiciones del prestamista:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const publications = async (req, res) => {
  try {
    const { user_id, amount, reason } = req.body;

    if (!user_id || !amount || !reason) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Insertar publicación
    db.query(
      "INSERT INTO client_request (user_id, amount, reason, created_at, state) VALUES (?, ?, ?, ?, ?)",
      [user_id, amount, reason, new Date(), "pendiente"],
      (err, result) => {
        if (err) {
          console.error("Error al crear publicación:", err);
          return res.status(500).json({ message: "Error al crear publicación" });
        }

        res.status(201).json({
          message: "Publicación creada exitosamente",
          id_publicacion: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Error en publicación:", error);
    res.status(500).send("Error interno del servidor");
  }
};





const getLenderInfo = async (req, res) => {
  const { lender_id } = req.query;

  try {
    if (!lender_id) {
      return res
        .status(400)
        .json({ message: "El ID del prestamista es requerido" });
    }
    db.query(
      "SELECT l.* FROM lender l JOIN users u ON u.information_id = l.id WHERE u.id = ?",
      [lender_id],
      (err, result) => {
        if (err) {
          console.error("Error al consultar lender:", err);
          return res.status(500).json({ message: "Error al obtener información del prestamista" });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "Prestamista no encontrado" });
        }

        res.status(200).json(result[0]); // Devuelve el primer resultado
      },
    );
  } catch (error) {
    console.error("Error en obtener información del prestamista:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const getRequestInfo = async (req, res) => {
  try {
    const { client_request_id, lender_id, client_id } = req.query;

    // Validar campo obligatorio
    if (!client_request_id || !lender_id || !client_id) {
      return res
        .status(400)
        .json({ message: "El ID de la solicitud y el ID del prestamista son requeridos" });
    }

    // Enviar solicitud al cliente
    db.query(
      "INSERT INTO notifications (client_request_id, lender_id, client_id, created_at, updated_at, state) VALUES (?, ?, ?, ?, ?, ?)",
      [client_request_id, lender_id, client_id, new Date(), new Date(), 1],
      (err, result) => {
        if (err) {
          console.error("Error al obtener información de la solicitud:", err);
          return res
            .status(500)
            .json({ message: "Error al obtener información de la solicitud" });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "Solicitud no encontrada" });
        }
        res.status(200).json(result[0]);
      }
    );
  } catch (error) {
    console.error("Error en obtener información de la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports = {
  publications,
  createLenderConditions,
  getRequestInfo,
  getLenderInfo,
};
