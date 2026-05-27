const db = require("../bd");

// Obtener todas las publicaciones de la tabla client_request
const publications = async (req, res) => {
  try {
    const { user_id } = req.query;
    const query = user_id
      ? "SELECT * FROM client_request WHERE user_id = ?"
      : "SELECT * FROM client_request";
    const params = user_id ? [user_id] : [];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error al consultar client_request:", err);
        return res.status(500).json({ message: "Error al obtener publicaciones" });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};
const sendedNotifications = async (req, res) => {
  try {
    const { lender_id } = req.query;
    const query = `
      SELECT n.*, c.first_name AS client_name
      FROM notifications n
      LEFT JOIN users u ON n.client_id = u.id
      LEFT JOIN client c ON u.information_id = c.id
      WHERE n.lender_id = ?
    `;
    const params = [lender_id];
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error al consultar notifications:", err);
        return res.status(500).json({ message: "Error al obtener notificaciones" });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const notifications = async (req, res) => {
  try {
    console.log("Obteniendo notificaciones para client_id:", req.query.client_id); // Log para depuración
    const { client_id } = req.query;
    const query = "SELECT * FROM notifications WHERE client_id = ? AND state = 1";
    const params = [client_id];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error al consultar notifications:", err);
        return res.status(500).json({ message: "Error al obtener notificaciones" });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const myLoans = async (req, res) => {
  try {
    const { user_id } = req.query;

    const query = "SELECT l.*, len.name AS bank_name FROM loans l INNER JOIN users u ON l.lender_user_id = u.id INNER JOIN lender len ON u.information_id = len.id WHERE l.client_user_id = ?;";
    const params = [user_id];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error al consultar préstamos:", err);
        return res.status(500).json({ message: "Error al obtener préstamos" });
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};
const acceptAccess = async (req, res) => {
  try {
    const { offerId, clientRequestId } = req.query;

    const updateNotificationsQuery = "UPDATE notifications SET state = 2 WHERE id = ?";
    db.query(updateNotificationsQuery, [offerId], (err2, results2) => {
      if (err2) {
        console.error("Error al actualizar notificaciones:", err2);
        return res.status(500).json({ message: "Error al actualizar notificaciones" });
      }

      if (results2.affectedRows === 0) {
        console.warn("No se encontraron notificaciones para actualizar");
      }

      res.status(200).json({ message: "Oferta aceptada y notificaciones actualizadas exitosamente" });
    });

  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};
const acceptOffer = async (req, res) => {
  try {
    const { offerId, clientRequestId, lender_user_id, client_user_id } = req.query;
    if (!offerId || !clientRequestId || !lender_user_id || !client_user_id) {
      return res.status(400).json({ message: "El ID de la oferta, la solicitud del cliente, el ID del prestamista y el ID del cliente son requeridos" });
    }
    const updateNotificationsQuery = "UPDATE notifications SET state = 0 WHERE lender_id = ? AND client_id = ?";
    db.query(updateNotificationsQuery, [lender_user_id, client_user_id], (err2, results2) => {
      if (err2) {
        console.error("Error al actualizar notificaciones:", err2);
        return res.status(500).json({ message: "Error al actualizar notificaciones" });
      }

      if (results2.affectedRows === 0) {
        console.warn("No se encontraron notificaciones para actualizar");
      }

      res.status(200).json({ message: "Oferta aceptada y notificaciones actualizadas exitosamente" });
    });
    const updateLoansQuery = "UPDATE loans SET state = 2 WHERE lender_conditions_id = ?";
    db.query(updateLoansQuery, [offerId], (err3, results3) => {
      if (err3) {
        console.error("Error al actualizar préstamos:", err3);
        return res.status(500).json({ message: "Error al actualizar préstamos" });
      }
      if (results3.affectedRows === 0) {
        console.warn("No se encontraron préstamos para actualizar");
      }
    });
    const updateRequestQuery = "UPDATE client_request SET state = 3 WHERE id = ?";
    db.query(updateRequestQuery, [clientRequestId], (err, results) => {
      if (err) {
        console.error("Error al aceptar la oferta:", err);
        return res.status(500).json({ message: "Error al aceptar la oferta" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Oferta no encontrada" });
      }
    });

  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  };
}
module.exports = {
  acceptAccess,
  publications,
  notifications,
  acceptOffer,
  sendedNotifications,
  myLoans
};
