const db = require("../bd");

const publications = async (req, res) => {
  try {
    const { user_id, amount, reason } = req.body;

    // Validar campos obligatorios
    if (!user_id || !amount || !reason) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Insertar publicación
    db.query(
      "INSERT INTO client_request (user_id ,amount,reason,created_at, state) VALUES (?, ?, ?, ?, ?)",
      [user_id, amount, reason, new Date(), "pendiente"],
      (err, result) => {
        if (err) {
          console.error("Error al crear publicación:", err);
          return res
            .status(500)
            .json({ message: "Error al crear publicación" });
        }

        res.status(201).json({
          message: "Publicación creada exitosamente",
          id_publicacion: result.insertId,
        });
      },
    );
  } catch (error) {
    console.error("Error en publicación:", error);
    res.status(500).send("Error interno del servidor");
  }
};




module.exports = {
  publications,
};
