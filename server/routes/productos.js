const express = require("express");
const { verficarToken } = require("../middlewares/autenticacion");
// const _ = require("underscore");

let app = express();
// Importación del modelo (El model es quién nos dará los registros de la DB)
let Producto = require("../models/producto");

// ===============================
// Obtener productos
// ===============================
app.get("/productos", verficarToken, (req, res) => {
  // trae todos los productos
  // populate : usuario categoria
  // paginado
  let from = req.query.from || 0;
  from = Number(from);

  let limit = req.query.limit || 5;
  limit = Number(limit);

  Producto.find({ disponible: true })
    .sort("nombre")
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .skip(from)
    .limit(limit)
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      Producto.count((err, conteo) => {
        res.json({
          ok: true,
          productos,
          Cantidad: conteo,
        });
      });
    });
});
// ===============================
// Obtener un producto por ID
// ===============================
app.get("/productos/:id", verficarToken, (req, res) => {
  // populate : usuario categoria
  let id = req.params.id;
  Producto.findById(id, (err, productoDB) => {
    if (productoDB.disponible === false) {
      return res.status(500).json({
        ok: false,
        message: "Este producto está inhabilitado",
      });
    }
    if (err) {
      res.status(500).json({
        ok: false,
        err: err.message,
      });
    }
    if (!productoDB) {
      res.status(400).json({
        ok: false,
        err: {
          message: `No existe un producto con el id ${id}`,
        },
      });
    }
    res.json({
      producto: productoDB,
    });
  })
    .populate("usuario", "nombre email")
    .populate("categorias", "descripcion");
});
// ===============================
// Buscar un  producto
// ===============================
app.get("/productos/buscar/:termino", verficarToken, (req, res) => {
  let termino = req.params.termino;
  // regex es una instancia de la clase RegExp
  let regex = new RegExp(termino, "i");
  Producto.find({ nombre: regex })
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        productos: productos,
      });
    });
});
// ===============================
// Crear un nuevo producto
// ===============================
app.post("/productos", verficarToken, (req, res) => {
  // Grabar el usuario
  // Grabar una categoria del listado
  let id = req.usuario._id;

  let producto = new Producto({
    nombre: req.body.nombre,
    precioUni: req.body.precioUni,
    descripcion: req.body.descripcion,
    disponible: req.body.disponible,
    categoria: req.body.categoria,
    usuario: id,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoDB) {
      res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      producto: producto,
    });
  });
});
// ===============================
// Actualizar un producto
// ===============================
app.put("/productos/:id", verficarToken, (req, res) => {
  // Grabar el usuario
  // Grabar una categoria del listado
  let id = req.params.id;
  let body = {
    nombre: req.body.nombre,
    precioUni: req.body.precioUni,
    descripcion: req.body.descripcion,
    disponible: req.body.disponible,
    categoria: req.body.categoria,
    usuario: id,
  };
  // La función findByIdAndUpdate recibe 4 parametros; 1: el id que se actualizará, 2: un objeto con los campos y nuevas variables de contenido , 3: el callback para debuguear y la respuesta exitosa, 4:  { new: true, runValidators: true }, para  obtener de inmediato el objeto actulizado y no el viejo y para correr validaciónes venideras del model
  Producto.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err: err.message,
        });
      }
      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        productoDB,
      });
    }
  );
});
// ===============================
// Borrar un producto
// ===============================
app.delete("/productos/:id", verficarToken, (req, res) => {
  // Cambiar disponibilidad a false y más  na'
  let id = req.params.id;
  let body = {
    disponible: false,
  };

  Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err: err.message,
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      message: "El producto ha sido inhabilitado",
      nombre: productoDB.nombre,
      disponible: productoDB.disponible,
    });
  });
});

module.exports = app;
