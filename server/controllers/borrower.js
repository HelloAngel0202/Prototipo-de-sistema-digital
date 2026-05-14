const db = require("../bd");

// Obtener todas las publicaciones de la tabla client_request
const publications = async (req, res) => {
  try {
    db.query("SELECT * FROM client_request", (err, results) => {
      if (err) {
        console.error("Error al consultar client_request:", err);
        return res.status(500).json({ message: "Error al obtener publicaciones" });
      }

      // Devuelve todas las solicitudes
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports = {
  publications,
};
