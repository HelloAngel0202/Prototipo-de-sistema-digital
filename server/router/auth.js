const bd = require("../bd");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    bd.query(
      "SELECT * FROM user WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error interno");
        }

        // Usuario no existe
        if (result.length === 0) {
          return res.status(401).json({
            message: "Credenciales inválidas",
          });
        }

        const user = result[0];

        // Comparar contraseña
        const passwordCorrecta = await bcrypt.compare(
          password,
          user.password,
        );

        if (!passwordCorrecta) {
          return res.status(401).json({
            message: "Credenciales inválidas",
          });
        }

        // Crear token
        const token = jwt.sign(
          {
            id: user.id_usuario,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          },
          process.env.JWT_SECRET || "Stack",
          { expiresIn: "1m" },
        );

        res.status(200).json({
          message: "Login exitoso",
          user,
          token,
        });
      },
    );
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).send("Error interno del servidor");
  }
};




const Register = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    console.log("datos: " + name + " " + email + " " + role + " " + password);

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    bd.query(
      "INSERT INTO user (name_user, email, user_type, password) VALUES (?, ?, ?, ?)",
      [name, email, role, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("Error al registrar usuario:", err);
          return res.status(500).json({ message: "Error al registrar usuario" });
        }

        // Generar token inmediatamente después de registrar
        const token = jwt.sign(
          { id: result.insertId, email, role },
          "Stack", // clave secreta (usa .env)
          { expiresIn: "1h" }
        );

        res.status(201).json({
          message: "Usuario registrado exitosamente",
          token,
        });
      }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).send("Error interno del servidor");
  }
};








module.exports = {
  login,Register
};
