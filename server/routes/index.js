const express = require("express");
const app = express();
// Se requiere el archivo pasado como argumento para acceder a las ruta
app.use(require("./usuario"));
app.use(require("./login"));

module.exports = app;
