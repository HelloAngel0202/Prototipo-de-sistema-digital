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
            clid: user.information_id,
            email: user.email,
            name_user: user.username,
            role: user.role,
            photo:
              "https://img.a.transfermarkt.technology/portrait/big/8198-1748102259.jpg?lm=1",
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

          // Construir el objeto user manualmente
          const user = {
            id: resultUser.insertId,
            email,
            username: name,
            role,
            photo:
              "https://img.a.transfermarkt.technology/portrait/big/8198-1748102259.jpg?lm=1",
          };

          const token = jwt.sign(
            {
              id: user.id,
              clid: user.information_id,
              email: user.email,
              name_user: user.username,
              role: user.role,
              photo: user.photo,
            },
            process.env.JWT_SECRET || "Stack",
            { expiresIn: "1h" },
          );

          res.status(201).json({
            message: "Usuario registrado exitosamente",
            user,
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

const updateUser = async (req, res) => {
  try {
    const {
      id, // id del usuario en tabla users
      clid, // id del cliente en tabla client
      first_name,
      last_name,
      phone,
      nationality,
      document,
      document_type,
      address,
      city,
      birth_date,
      Estado_civil,
      occupation,
      username,
    } = req.body;

    // 1️⃣ Actualizar tabla client
    bd.query(
      `UPDATE client 
       SET first_name = ?, last_name = ?, phone = ?, nationality = ?, 
           birth_date = ?, ocupation = ?, city = ?, 
           document = ?, document_type = ?, Estado_civil = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        phone,
        nationality,
        birth_date,
        occupation,
        city,
        document,
        document_type,
        Estado_civil,
        clid,
      ],
      (err, resultClient) => {
        if (err) {
          console.error("Error al actualizar cliente:", err);
          return res.status(500).json({ message: "Error al actualizar cliente" });
        }

        // 2️⃣ Actualizar tabla users
        bd.query(
          `UPDATE users 
           SET username = ?, address = ?, updated_at = NOW()
           WHERE id = ?`,
          [username, address, id],
          (err, resultUser) => {
            if (err) {
              console.error("Error al actualizar usuario:", err);
              return res.status(500).json({ message: "Error al actualizar usuario" });
            }

            res.status(200).json({
              message: "Usuario actualizado correctamente",
              clientUpdate: resultClient.affectedRows,
              userUpdate: resultUser.affectedRows,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).send("Error interno del servidor");
  }
};


// controllers/auth.js
const Userdate = async (req, res) => {
  try {
    const { id, clid } = req.query; // llegan desde params en axios.get

    bd.query("SELECT * FROM client WHERE id = ?", [clid], (err, clientResult) => {
      if (err) {
        console.error("Error al obtener cliente:", err);
        return res.status(500).json({ message: "Error al obtener cliente" });
      }

      bd.query("SELECT * FROM users WHERE id = ?", [id], (err, userResult) => {
        if (err) {
          console.error("Error al obtener usuario:", err);
          return res.status(500).json({ message: "Error al obtener usuario" });
        }

        // ✅ devolver ambos objetos
        res.status(200).json({
          client: clientResult[0] || {},
          user: userResult[0] || {},
        });
      });
    });
  } catch (error) {
    console.error("Error en Userdate:", error);
    res.status(500).send("Error interno del servidor");
  }
};








module.exports = { login, Register, updateUser, Userdate };
