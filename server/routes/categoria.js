const express = require("express");
const _ = require("underscore");
let {
  verficarToken,
  verficarAdminRole,
} = require("../middlewares/autenticacion");
let app = express();
let Categoria = require("../models/categoria");
//===================================
// Mostrar todas las categorias
//===================================
app.get("/categoria", verficarToken, (req, res) => {
  return (
    Categoria.find({})
      .sort("descripcion")
      // Populate('usuario') recibe el nombre de la colección y crea la relacion, obteniendo los datos del parametro
      .populate("usuario", "nombre email")
      .exec((err, categoria) => {
        if (err) {
          res.status(500).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          categoria,
        });
      })
  );
});
//===================================
// Mostrar una categoria por id
//===================================
app.get("/categoria/:id", verficarToken, (req, res) => {
  let id = req.params.id;
  Categoria.findById(id, (err, categoria) => {
    //  Validación del error
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    }
    // Validación de id
    if (!categoria) {
      return res.status(400).json({
        ok: false,
        err: {
          message: `No existe una categoria con el id: ${id}`,
        },
      });
    }

    res.json({
      ok: true,
      Categoria: categoria,
    });
  });
});
//===================================
//Crear una nueva categoria
//===================================
app.post("/categoria", [verficarToken, verficarAdminRole], (req, res) => {
  let id = req.usuario._id;
  let categoria = new Categoria({
    descripcion: req.body.descripcion,
    usuario: id,
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB,
    });
  });
});
//===================================
//Actualizar categoria
//===================================
app.put("/categoria/:id", [verficarToken, verficarAdminRole], (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ["descripcion"]);

  Categoria.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },

    (err, categoriaDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      // Validación de id
      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Esta categoria no existe",
          },
        });
      }

      res.json({
        ok: true,
        usuario: categoriaDB,
      });
    }
  );

  //   res.json({
  //     id,
  //   });
});
//===================================
//Actualizar categoria
//===================================
app.delete("/categoria/:id", [verficarToken, verficarAdminRole], (req, res) => {
  let id = req.params.id;

  Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!categoriaBorrada) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Categoria no encontrada",
        },
      });
    }

    res.json({
      categoria_Borrada: {
        ok: true,
        usuario: categoriaBorrada,
      },
    });
  });
});

module.exports = app;
