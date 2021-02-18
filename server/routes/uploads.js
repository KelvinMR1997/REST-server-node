const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
const fs = require("fs");
const path = require("path");
// default options
app.use(fileUpload());

app.put("/upload/:tipo/:id", (req, res) => {
  let tipo = req.params.tipo;
  let id = req.params.id;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No se ha seleccionado ningún archivo",
      },
    });
  }

  // Validar tipo
  let tiposValidos = ["productos", "usuarios"];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Los tipos permitidos son : ${tiposValidos.join(", ")}`,
      },
    });
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split(".");
  let extension = nombreCortado[nombreCortado.length - 1];
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  //   Validación de extenciones
  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: `Las extensiones permitidas son : ${extensionesValidas.join(
          ", "
        )}`,
        ext: extension,
      },
    });
  }
  // Cambiar nombre del archivo
  let nombreArchivo = `${id}.-${new Date().getMilliseconds()}.${extension}`;
  // Use the mv() method to place the file somewhere on your server
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err)
      return res.status(500).json({
        ok: false,
        err,
      });
    // aqui se sabe si está cargada la imagen
    if (tipo === "usuarios") {
      imagenUsuario(id, res, nombreArchivo);
    }
    if (tipo === "productos") {
      imagenProducto(id, res, nombreArchivo);
    }

    // imagenUsuario(id, res, nombreArchivo);
    // imagenProducto(id, res, nombreArchivo);
  });
});
// Functions
function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borrarArchivo(usuarioDB.img, "usuarios");
      // No te olvides del return -.-
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!usuarioDB) {
      borrarArchivo(usuarioDB.img, "usuarios");
      return res.status(500).json({
        ok: false,
        err: {
          message: " El usuario no existe",
        },
      });
    }

    borrarArchivo(usuarioDB.img, "usuarios");

    usuarioDB.img = nombreArchivo;

    usuarioDB.save((err, usuarioDB) => {
      res.json({
        ok: true,
        usuario: usuarioDB,
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borrarArchivo(productoDB.img, "productos");
      // No te olvides del return -.-
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoDB) {
      borrarArchivo(productoDB.img, "productos");
      return res.status(500).json({
        ok: false,
        err: {
          message: " El producto no existe",
        },
      });
    }

    borrarArchivo(productoDB.img, "productos");

    productoDB.img = nombreArchivo;

    productoDB.save((err, productoDB) => {
      res.json({
        ok: true,
        producto: productoDB,
      });
    });
  });
}

function borrarArchivo(nombreImagen, tipo) {
  // pathImagen detecta si en la carpeta uploads/usuarios existe una imagen para el usuario que intente
  // actualizar su imagen, si es asi la elimina, y remplaza con la nueva, sino solo guarda
  let pathImagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );

  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}
module.exports = app;
