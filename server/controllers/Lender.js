const { request } = require("express");
const db = require("../bd");

const publications = async (req, res) => {
  try {
    const { user_id, amount, reason } = req.body;

    if (!user_id || !amount || !reason) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Verificar datos del cliente
    bd.query("SELECT * FROM client WHERE id = ?", [user_id], (err, clientResult) => {
      if (err) {
        console.error("Error al verificar cliente:", err);
        return res.status(500).json({ message: "Error al verificar cliente" });
      }

      if (clientResult.length === 0) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }

      const c = clientResult[0];

      // 🔎 Validar solo campos críticos
      const camposCriticos = [
        c.first_name,
        c.last_name,
        c.phone,
        c.nationality,
        c.document,
        c.document_type,
        c.address,
        c.city,
        c.birth_date,
      ];

      const incompletos = camposCriticos.some((campo) => !campo || campo === "");

      if (incompletos) {
        return res.status(400).json({
          message: "El cliente debe completar sus datos personales antes de publicar",
        });
      }

      // Insertar publicación
      bd.query(
        "INSERT INTO client_request (user_id, amount, reason, created_at, state) VALUES (?, ?, ?, ?, ?)",
        [user_id, amount, reason, new Date(), "pending"],
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
    });
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
    const { request_id, lender_id } = req.query;

    // Validar campo obligatorio
    if (!request_id || !lender_id) {
      return res
        .status(400)
        .json({ message: "El ID de la solicitud y el ID del prestamista son requeridos" });
    }

    // Enviar solicitud al cliente
    db.query(
      "INSERT INTO notifications (lender_id, client_id, created_at, updated_at, state) VALUES (?, ?, ?, ?, ?)",
      [lender_id, request_id, new Date(), new Date(), 1],
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
  getRequestInfo,
  getLenderInfo,
};
