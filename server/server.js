require("./config/config");
// Using Node.js `require()`
const mongoose = require("mongoose");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(require("./routes/usuario"));

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
