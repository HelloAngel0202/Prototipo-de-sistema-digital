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
            name_user: user.name_user,
            photo: "https://img.a.transfermarkt.technology/portrait/big/8198-1748102259.jpg?lm=1",
            code_user: user.code_user,
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

    if (!name || !email || !role || !password) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    // Prefijo según rol
    let prefix = "";

    if (role === "prestamista") {
      prefix = "PR";
    } else if (role === "cliente") {
      prefix = "CL";
    } else {
      prefix = "US";
    }

    // Obtener cantidad de usuarios con ese rol
    bd.query(
      "SELECT COUNT(*) AS total FROM user WHERE user_type = ?",
      [role],
      async (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Error al generar código",
          });
        }

        const nextNumber = rows[0].total + 1;

        // Letra aleatoria
        const randomLetter = String.fromCharCode(
          65 + Math.floor(Math.random() * 26)
        );

        // Código final
        const code = `${prefix}${nextNumber}${randomLetter}`;

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        bd.query(
          `INSERT INTO user 
          (code_user, name_user, email, user_type, password) 
          VALUES (?, ?, ?, ?, ?)`,
          [code, name, email, role, hashedPassword],
          (err, result) => {
            if (err) {
              console.error("Error al registrar usuario:", err);
              return res.status(500).json({
                message: "Error al registrar usuario",
              });
            }

            // Token
            const token = jwt.sign(
              {
                id: result.insertId,
                email,
                role,
              },
              "Stack",
              { expiresIn: "1h" }
            );

            res.status(201).json({
              message: "Usuario registrado exitosamente",
              code,
              token,
            });
          }
        );
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
