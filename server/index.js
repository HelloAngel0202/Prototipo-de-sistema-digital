require("dotenv").config();
const express = require("express");
const cors = require("cors");
const usuariosRouter = require("./router/users");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Usar las rutas de usuarios
app.use("/users", usuariosRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
