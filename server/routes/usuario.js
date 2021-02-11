const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Usuario = require("../models/usuario");

const app = express();

app.get("/usuario", function (req, res) {
  // Modelo.find() encuentra todos los registros de la colección , y el execute sirve para ejecutar
  // Skip salta según la numeracion que reciba el parentecis, limit limita según el arg entre parentesis
  //  el objeto req, recibe los parametros por le usuario

  let from = req.query.from || 0;
  from = Number(from);

  let limit = req.query.limit || 5;
  limit = Number(limit);

  Usuario.find({ estado: true }, "nombre email role estado google")
    .skip(from)
    .limit(limit)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      Usuario.count({ estado: true }, (err, conteo) => {
        res.json({
          ok: true,
          usuarios,
          Activos: conteo,
        });
      });
    });
});

app.post("/usuario", function (req, res) {
  let body = req.body;
  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role,
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

app.put("/usuario/:id", function (req, res) {
  let id = req.params.id;
  let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      // Validación de id
      if (!usuarioDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no encontrado",
          },
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
      });
    }
  );
});
// ======================ELIMINAR USUARIO MENDIANTE EL CAMBIO DE ESTADO==================
app.delete("/usuario/:id", function (req, res) {
  let id = req.params.id;
  let cambiarEstado = {
    estado: false,
  };

  Usuario.findByIdAndUpdate(
    id,
    cambiarEstado,
    { new: true },
    (err, usuarioBorrado) => {
      usuarioBorrado.estado = false;
      //  Validación del error
      if (err) {
        res.status(400).json({
          ok: false,
          err,
        });
      }
      // Validación de id
      if (!usuarioBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no encontrado",
          },
        });
      }

      res.json({
        ok: true,
        usuario: usuarioBorrado,
      });
    }
  );
});

// ==================ELIMINAR USUARIO PERMANENTEMENTE================
// app.delete("/usuario/:id", function (req, res) {
//   let id = req.params.id;

//   Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
//     if (err) {
//       res.status(400).json({
//         ok: false,
//         err,
//       });
//     }
//     if (!usuarioBorrado) {
//       return res.status(400).json({
//         ok: false,
//         err: {
//           message: "Usuario no encontrado",
//         },
//       });
//     }
//     res.json({
//       ok: true,
//       usuario: usuarioBorrado,
//     });

//   });
// });

module.exports = app;
