  // Crear usuario
  // router.post("/create", (req, res) => {
  //   const { nombre, apellido, telefono, nacionalidad, email } = req.body;

  //   db.query(
  //     "INSERT INTO usuarios (nombre, apellido, telefono, nacionalidad, correo_electronico) VALUES (?, ?, ?, ?, ?)",
  //     [nombre, apellido, telefono, nacionalidad, email],
  //     (err, result) => {
  //       if (err) {
  //         console.error("Error inserting data:", err);
  //         res.status(500).send("Error inserting data");
  //       } else {
  //         res.send("Data inserted successfully");
  //       }
  //     }
  //   );
  // });

  // // Obtener usuarios
  // router.get("/empleado", (req, res) => {
  //   db.query("SELECT * FROM usuarios", (err, result) => {
  //     if (err) {
  //       console.error("Error fetching data:", err);
  //       res.status(500).send("Error fetching data");
  //     } else {
  //       res.send(result);
  //     }
  //   });
  // });

  // // Actualizar usuario
  // router.put("/update", (req, res) => {
  //   const { id, nombre, apellido, telefono, nacionalidad, email } = req.body;

  //   db.query(
  //     "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, nacionalidad = ?, correo_electronico = ? WHERE id_usuario = ?",
  //     [nombre, apellido, telefono, nacionalidad, email, id],
  //     (err, result) => {
  //       if (err) {
  //         console.error("Error updating data:", err);
  //         res.status(500).send("Error updating data");
  //       } else {
  //         res.send("Data updated successfully");
  //       }
  //     }
  //   );
  // });

  // // Eliminar usuario
  // router.delete("/delete/:id", (req, res) => {
  //   const id = req.params.id;

  //   db.query("DELETE FROM usuarios WHERE id_usuario = ?", id, (err, result) => {
  //     if (err) {
  //       console.error("Error deleting data:", err);
  //       res.status(500).send("Error deleting data");
  //     } else {
  //       res.send(result);
  //     }
  //   });
  // });