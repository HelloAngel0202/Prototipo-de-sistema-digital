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
    const { client_id } = req.query;
    const query = "SELECT * FROM notifications WHERE client_id = ? AND state = 'pending'";
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

const acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.query;

    // Lógica para aceptar la oferta
    const query = "UPDATE client_request SET state = 'accepted' WHERE id = ?";
    db.query(query, [offerId], (err, results) => {
      if (err) {
        console.error("Error al aceptar la oferta:", err);
        return res.status(500).json({ message: "Error al aceptar la oferta" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Oferta no encontrada" });
      }

      res.status(200).json({ message: "Oferta aceptada exitosamente" });
    });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports = {
  publications,
  notifications,
  acceptOffer,
  sendedNotifications
};
