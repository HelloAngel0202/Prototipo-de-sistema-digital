const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const port = 3001;

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "loanlinkdb",
});

app.post("/create", (req, res) => {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const telefono = req.body.telefono;
    const nacionalidad = req.body.nacionalidad;
    const email = req.body.email;

    db.query(
    'INSERT INTO usuarios (nombre, apellido, telefono, nacionalidad, correo_electronico) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, telefono, nacionalidad, email],
        (err, result) => {
            if (err) {
                console.error("Error inserting data: ", err);
                res.status(500).send("Error inserting data");
            } else {                res.send("Data inserted successfully");
            }
        }  

    );
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
