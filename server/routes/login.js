const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require("../models/usuario");

const app = express();

app.post("/login", (req, res) => {
  let body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    // verificación de usuario en DB
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        message: "(Usuario) o contraseña incorrecta",
      });
    }
    // verificación de password en DB
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        message: "Usuario o contraseña incorrecta",
      });
    }
    let token = jwt.sign(
      {
        usuario: usuarioDB,
      },
      process.env.SEED,
      { expiresIn: process.env.CADUCIDAD_TOKEN }
    );
    res.json({
      ok: true,
      usuario: usuarioDB,
      token,
    });
  });
});
// Configuración de google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;

  let googleUser = await verify(token).catch((err) => {
    res.status(403).json({
      ok: false,
      err: {
        message: " Token invalido",
      },
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      res.status(500).json({
        ok: false,
        err,
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        res.status(400).json({
          ok: false,
          err: {
            message: "Use su autenticación normal",
          },
        });
      } else {
        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
          expiresIn: process.env.CADUCIDAD_TOKEN,
        });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      }
    } else {
      // Si el usuairo no existe en la base de datos
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";

      usuario.save((err, usuariDB) => {
        if (err) {
          res.status(500).json({
            ok: false,
            err,
          });
        }

        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
          expiresIn: process.env.CADUCIDAD_TOKEN,
        });
        return res.json({
          ok: true,
          usuario: usuarioDB,
          token,
        });
      });
    }
  });

  // Main nodemailer
  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      // port: 465,
      // auth: {
      //   user: "example@gmail.com",
      //   pass: "example",
      // },

      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "01b38c502b77e1",
        pass: "20d4808c003d00",
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: googleUser.email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
    console.log("Message sent: %s", info.messageId);
  }
  main().catch(console.error);
});

module.exports = app;
