const bd = require("../bd");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
            photo: user.profile_image
              ? `http://localhost:3001/uploads/${user.profile_image}`
              : null,
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

    // VALIDAR CAMPOS

    if (!name || !email || !role || !password) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    // VALIDAR Contraseña

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo",
      });
    }

    // VALIDAR ROL

    if (role !== "cliente" && role !== "prestamista") {
      return res.status(400).json({
        message: "Rol inválido",
      });
    }

    // VERIFICAR SI EL EMAIL YA EXISTE

    bd.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, userResult) => {
        if (err) {
          console.error("Error verificando email:", err);

          return res.status(500).json({
            message: "Error interno del servidor",
          });
        }

        if (userResult.length > 0) {
          return res.status(400).json({
            message: "El correo ya está registrado",
          });
        }

        // HASH PASSWORD

        const hashedPassword = await bcrypt.hash(password, 10);

        // GENERAR CÓDIGO

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        // ELIMINAR CÓDIGOS ANTERIORES

        bd.query(
          "DELETE FROM email_codes WHERE email = ?",
          [email],
          async (deleteErr) => {
            if (deleteErr) {
              console.error("Error eliminando códigos anteriores:", deleteErr);

              return res.status(500).json({
                message: "Error interno del servidor",
              });
            }

            // GUARDAR DATOS TEMPORALES

            bd.query(
              `
              INSERT INTO email_codes
              (email, code, name, role, password, expires_at)
              VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
              `,
              [email, codigo, name, role, hashedPassword],
              async (insertErr) => {
                if (insertErr) {
                  console.error("Error guardando código:", insertErr);

                  return res.status(500).json({
                    message: "Error interno del servidor",
                  });
                }

                // ENVIAR EMAIL

                await transporter.sendMail({
                  from: process.env.EMAIL_USER,
                  to: email,
                  subject: "Código de verificación",
                  html: `
    <div style="
      background:#f4f7fb;
      padding:40px 20px;
      font-family:Arial, sans-serif;
    ">
      
      <div style="
        max-width:500px;
        margin:auto;
        background:white;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 10px 25px rgba(0,0,0,0.1);
      ">

        <div style="
          background:linear-gradient(135deg,#2563eb,#1e40af);
          padding:30px;
          text-align:center;
          color:white;
        ">
          <h1 style="margin:0;font-size:28px;">
            Verificación
          </h1>

          <p style="
            margin-top:10px;
            opacity:0.9;
            font-size:15px;
          ">
            Seguridad de tu cuenta
          </p>
        </div>

        <div style="padding:40px 30px;color:#333;">
          
          <h2 style="
            margin-top:0;
            font-size:24px;
          ">
            Hola ${name} 👋
          </h2>

          <p style="
            font-size:16px;
            line-height:1.6;
            color:#555;
          ">
            Usa el siguiente código para verificar tu cuenta:
          </p>

          <div style="
            margin:35px 0;
            text-align:center;
          ">
            <span style="
              display:inline-block;
              background:#eff6ff;
              color:#2563eb;
              font-size:40px;
              font-weight:bold;
              letter-spacing:10px;
              padding:18px 30px;
              border-radius:12px;
              border:2px dashed #2563eb;
            ">
              ${codigo}
            </span>
          </div>

          <p style="
            font-size:14px;
            color:#777;
            line-height:1.6;
          ">
            Este código expirará en <b>10 minutos</b>.
          </p>

          <p style="
            font-size:14px;
            color:#777;
            margin-top:25px;
          ">
            Si no solicitaste este código, puedes ignorar este correo.
          </p>
        </div>

        <div style="
          background:#f9fafb;
          padding:20px;
          text-align:center;
          font-size:13px;
          color:#999;
        ">
          © 2026 Tu Aplicación
        </div>
      </div>
    </div>
  `,
                });

                // RESPUESTA

                res.status(200).json({
                  message: "Se envió un código de verificación a tu correo",
                });
              },
            );
          },
        );
      },
    );
  } catch (error) {
    console.error("Error en registro:", error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

// VERIFY CODE

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // VALIDAR CAMPOS

    if (!email || !code) {
      return res.status(400).json({
        message: "Email y código son requeridos",
      });
    }

    // VERIFICAR CÓDIGO

    bd.query(
      `
      SELECT * FROM email_codes
      WHERE email = ?
      AND code = ?
      AND expires_at > NOW()
      `,
      [email, code],
      async (err, result) => {
        if (err) {
          console.error("Error al verificar código:", err);

          return res.status(500).json({
            message: "Error interno del servidor",
          });
        }

        // CÓDIGO INVÁLIDO

        if (result.length === 0) {
          return res.status(400).json({
            message: "Código inválido o expirado",
          });
        }

        // DATOS GUARDADOS

        const data = result[0];

        const name = data.name;
        const role = data.role;
        const hashedPassword = data.password;

        let infoId;

        // CREAR CLIENTE

        if (role === "cliente") {
          bd.query(
            `
            INSERT INTO client
            (first_name, ocupation)
            VALUES (?, ?)
            `,
            [name, ""],
            (errClient, resultClient) => {
              if (errClient) {
                console.error("Error al crear cliente:", errClient);

                return res.status(500).json({
                  message: "Error al crear información del cliente",
                });
              }

              infoId = resultClient.insertId;

              crearUsuario();
            },
          );
        }

        // CREAR PRESTAMISTA
        else if (role === "prestamista") {
          bd.query(
            `
            INSERT INTO lender
            (name, email)
            VALUES (?, ?)
            `,
            [name, email],
            (errLender, resultLender) => {
              if (errLender) {
                console.error("Error al crear prestamista:", errLender);

                return res.status(500).json({
                  message: "Error al crear información del prestamista",
                });
              }

              infoId = resultLender.insertId;

              crearUsuario();
            },
          );
        }

        // CREAR USUARIO

        function crearUsuario() {
          bd.query(
            `
            INSERT INTO users
            (
              information_id,
              username,
              email,
              role,
              password,
              verified
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [infoId, name, email, role, hashedPassword, 1],
            (errUser) => {
              if (errUser) {
                console.error("Error al crear usuario:", errUser);

                return res.status(500).json({
                  message: "Error al registrar usuario",
                });
              }

              // ELIMINAR CÓDIGO USADO

              bd.query(
                "DELETE FROM email_codes WHERE email = ?",
                [email],
                (deleteErr) => {
                  if (deleteErr) {
                    console.error("Error eliminando código:", deleteErr);
                  }

                  // RESPUESTA FINAL

                  res.status(201).json({
                    message: "Cuenta verificada y usuario creado correctamente",
                  });
                },
              );
            },
          );
        }
      },
    );
  } catch (error) {
    console.error("Error en verifyEmail:", error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const {
      id, // id del usuario en tabla users
      clid,
      role,
      first_name,
      last_name,
      phone,
      nationality,
      type_documente,
      document,
      document_type,
      address,
      city,
      birth_date,
      Estado_civil,
      occupation,
      username,
      second_phone,
      documento,
      representante,
      nacionalidad,
      sexo,
    } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    if (role === "cliente") {
      bd.query(
        `UPDATE client 
       SET first_name = ?, last_name = ?, phone = ?, nationality = ?, 
birth_date = ?, ocupation = ?, city = ?, 
document = ?, document_type = ?, Estado_civil = ?,profile_image = COALESCE(?, profile_image)
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
          profile_image,
          clid,
        ],
        (err, resultClient) => {
          if (err) {
            console.error("Error al actualizar cliente:", err);
            return res
              .status(500)
              .json({ message: "Error al actualizar cliente" });
          }

          // 2️⃣ Actualizar tabla users
          bd.query(
            `UPDATE users 
           SET username = ?, address = ?,profile_image = COALESCE(?, profile_image), updated_at = NOW()
           WHERE id = ?`,
            [username, address, profile_image, id],
            (err, resultUser) => {
              if (err) {
                console.error("Error al actualizar usuario:", err);
                return res
                  .status(500)
                  .json({ message: "Error al actualizar usuario" });
              }

              const photoUrl = profile_image
                ? `http://localhost:3001/uploads/${profile_image}`
                : null;

              res.status(200).json({
                message: "Usuario actualizado correctamente",
                clientUpdate: resultClient.affectedRows,
                userUpdate: resultUser.affectedRows,
                photo: photoUrl,
              });
            },
          );
        },
      );
    } else if (role === "prestamista") {
      bd.query(
        `UPDATE lender 
   SET name = ?, 
       address = ?, 
       phone = ?, 
       second_phone = ?,
       type_documente = ?, 
       documento = ?, 
       representante = ?, 
       nacionalidad = ?, 
       estado_civil = ?, 
       sexo = ?,
        profile_image = COALESCE(?, profile_image)
   WHERE id = ?`,
        [
          username,
          address,
          phone,
          second_phone,
          type_documente,
          documento,
          representante,
          nacionalidad,
          Estado_civil,
          sexo,
          profile_image,
          clid,
        ],
        (err, resultLender) => {
          if (err) {
            console.error("Error al actualizar prestamista:", err);
            return res
              .status(500)
              .json({ message: "Error al actualizar prestamista" });
          }

          bd.query(
            `UPDATE users SET username = ?, address = ?, profile_image = COALESCE(?, profile_image), updated_at = NOW() WHERE id = ?`,
            [username, address, profile_image, id],
            (err, resultUser) => {
              if (err) {
                console.error("Error al actualizar usuario:", err);
                return res
                  .status(500)
                  .json({ message: "Error al actualizar usuario" });
              }

              const photoUrl = profile_image
                ? `http://localhost:3001/uploads/${profile_image}`
                : null;

              res.status(200).json({
                message: "Prestamista actualizado correctamente",
                lenderUpdate: resultLender.affectedRows,
                userUpdate: resultUser.affectedRows,
                photo: photoUrl,
              });
            },
          );
        },
      );
    } else {
      return res.status(400).json({ message: "Rol inválido" });
    }

    // 1️⃣ Actualizar tabla client
  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const Clidate = async (req, res) => {
  try {
    const { clid } = req.query;

    bd.query(
      "SELECT * FROM client WHERE id = ?",
      [clid],
      (err, clientResult) => {
        if (err) {
          console.error("Error al obtener cliente:", err);
          return res.status(500).json({
            message: "Error al obtener cliente",
          });
        }

        // Verificamos si existe el cliente
        if (clientResult.length === 0) {
          return res.status(404).json({
            message: "Cliente no encontrado",
          });
        }

        // Datos del cliente
        const client = clientResult[0];

        // Buscar usuario relacionado
        bd.query(
          "SELECT * FROM users WHERE information_id = ?",
          [clid], // <- aquí debes usar el campo correcto
          (err, userResult) => {
            if (err) {
              console.error("Error al obtener usuario:", err);
              return res.status(500).json({
                message: "Error al obtener usuario",
              });
            }

            res.status(200).json({
              client: client,
              user: userResult[0] || {},
            });
          },
        );
      },
    );
  } catch (error) {
    console.error("Error en Clidate:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// controllers/auth.js
const Userdate = async (req, res) => {
  try {
    const { id, clid, role } = req.query; // llegan desde params en axios.get

    if (role === "cliente") {
      // 🔹 Consultar client
      bd.query(
        "SELECT * FROM client WHERE id = ?",
        [clid],
        (err, clientResult) => {
          if (err) {
            console.error("Error al obtener cliente:", err);
            return res
              .status(500)
              .json({ message: "Error al obtener cliente" });
          }

          bd.query(
            "SELECT * FROM users WHERE id = ?",
            [id],
            (err, userResult) => {
              if (err) {
                console.error("Error al obtener usuario:", err);
                return res
                  .status(500)
                  .json({ message: "Error al obtener usuario" });
              }

              res.status(200).json({
                client: clientResult[0] || {},
                user: userResult[0] || {},
              });
            },
          );
        },
      );
    } else if (role === "prestamista") {
      // 🔹 Consultar lender
      bd.query(
        "SELECT * FROM lender WHERE id = ?",
        [clid],
        (err, lenderResult) => {
          if (err) {
            console.error("Error al obtener prestamista:", err);
            return res
              .status(500)
              .json({ message: "Error al obtener prestamista" });
          }

          bd.query(
            "SELECT * FROM users WHERE id = ?",
            [id],
            (err, userResult) => {
              if (err) {
                console.error("Error al obtener usuario:", err);
                return res
                  .status(500)
                  .json({ message: "Error al obtener usuario" });
              }

              res.status(200).json({
                lender: lenderResult[0] || {},
                user: userResult[0] || {},
              });
            },
          );
        },
      );
    } else {
      return res.status(400).json({ message: "Rol inválido" });
    }
  } catch (error) {
    console.error("Error en Userdate:", error);
    res.status(500).send("Error interno del servidor");
  }
};

const checkClientData = (req, res) => {
  try {
    const { clid, role } = req.query;

    

    if (role === "cliente") {
      bd.query(
        "SELECT first_name, last_name, phone, cellphone, nationality, birth_date, ocupation, city, document, document_type, Estado_civil FROM client WHERE id = ?",
        [clid],
        (err, result) => {
          if (err) {
            console.error("Error al obtener cliente:", err);
            return res.status(500).json(false);
          }
          if (result.length === 0) return res.json(false);

          const c = result[0];
          const completo =
            c.first_name &&
            c.last_name &&
            (c.phone || c.cellphone) &&
            c.nationality &&
            c.birth_date &&
            c.ocupation &&
            c.city &&
            c.document &&
            c.document_type &&
            c.Estado_civil;

          return res.json(!!completo); // ✅ Solo true o false
        },
      );
    } else if (role === "prestamista") {
      console.log("Verificando datos del prestamista con ID:", clid); // Log para depuración
      bd.query(
        `SELECT 
    type_documente,
    name,
    address,
    phone,
    second_phone,
    documento,
    representante,
    profile_image
  FROM lender 
  WHERE id = ?`,
        [clid],
        (err, result) => {
          if (err) {
            console.error("Error al obtener prestamista:", err);
            return res.status(500).json(false);
          }

          if (result.length === 0) return res.json(false);

          const l = result[0];

          const completo =
            l.name &&
            l.address &&
            l.phone &&
            l.documento &&
            l.type_documente;

          return res.json(!!completo);
        },
      );
    } else {
      return res.json(false);
    }
  } catch (error) {
    console.error("Error en checkClientData:", error);
    res.status(500).json(false);
  }
};

module.exports = {
  login,
  Register,
  updateUser,
  Userdate,
  checkClientData,
  verifyEmail,
  Clidate,
};
