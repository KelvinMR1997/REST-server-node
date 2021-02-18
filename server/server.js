require("./config/config");
// Using Node.js `require()`
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    //Handle SyntaxError here.
    return res.status(400).json({
      error: {
        ok: false,
        message: `Escriba formato valido, no sea imbecil, ${error.body.split('"')} no es un formato valido`,
      },
    });
  }
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Habilitar la carpeta public path.resolver resuelve las rutas :V
app.use(express.static(path.resolve(__dirname, "../public")));

// Configuración global de rutas
app.use(require("./routes/index"));

mongoose.connect(
  process.env.URLDB,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) throw err;
    console.log("Base de datos ONLINE");
  }
);

app.listen(process.env.PORT, () => {
  console.log("Server activo en el puerto 3000");
});
