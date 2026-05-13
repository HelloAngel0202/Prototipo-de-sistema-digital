const db = require("../bd");

const publications = async (req, res) => {
  try {
    const { code_user, amount, description } = req.body;

    // Validar campos obligatorios
    if (!code_user || !amount || !description) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Insertar publicación
    db.query(
      "INSERT INTO publications (code_user,amount,description, state) VALUES (?, ?, ?, ?)",
      [code_user, amount, description, "pendiente"],
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
