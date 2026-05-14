const bd = require("../bd");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    bd.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error interno");
        }

        if (result.length === 0) {
          return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = result[0];
        const passwordCorrecta = await bcrypt.compare(password, user.password);

        if (!passwordCorrecta) {
          return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
           {
            id: user.id,
            email: user.email,
            name_user: user.username,
            role: user.role,
            photo: "https://img.a.transfermarkt.technology/portrait/big/8198-1748102259.jpg?lm=1",
            
          },
          process.env.JWT_SECRET || "Stack",
          { expiresIn: "1h" },
        );

        res.status(200).json({ message: "Login exitoso", user, token });
      },
    );
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// REGISTER
const Register = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Insertar primero en client o lender
    let infoId;
    if (role === "cliente") {
      bd.query(
        "INSERT INTO client (first_name, ocupation) VALUES (?, ?)",
        [name, "pendiente"],
        (err, resultClient) => {
          if (err) {
            console.error("Error al insertar cliente:", err);
            return res
              .status(500)
              .json({ message: "Error al registrar cliente" });
          }
          infoId = resultClient.insertId;
          crearUsuario(infoId);
        },
      );
    } else if (role === "prestamista") {
      bd.query(
        "INSERT INTO lender (name, address) VALUES (?, ?)",
        [name, email],
        (err, resultLender) => {
          if (err) {
            console.error("Error al insertar prestamista:", err);
            return res
              .status(500)
              .json({ message: "Error al registrar prestamista" });
          }
          infoId = resultLender.insertId;
          crearUsuario(infoId);
        },
      );
    } else {
      return res.status(400).json({ message: "Rol inválido" });
    }

    // 2️⃣ Crear usuario en tabla users
    function crearUsuario(infoId) {
      bd.query(
        `INSERT INTO users 
        (information_id, username, email, role, password ) 
        VALUES (?, ?, ?, ?, ?)`,
        [infoId, name, email, role, hashedPassword],
        (err, resultUser) => {
          if (err) {
            console.error("Error al registrar usuario:", err);
            return res
              .status(500)
              .json({ message: "Error al registrar usuario" });
          }

          const token = jwt.sign(
             {
            id: resultUser.insertId,
                email,

                role,
                name_user: name,
            
          },
            process.env.JWT_SECRET || "Stack",
            { expiresIn: "1h" },
          );

          res.status(201).json({
            message: "Usuario registrado exitosamente",
            token,
          });
        },
      );
    }
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).send("Error interno del servidor");
  }
};

module.exports = { login, Register };
