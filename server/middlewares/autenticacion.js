const jwt = require("jsonwebtoken");
// ============================
// Verificar Token
// ============================

let verficarToken = (req, res, next) => {
  let token = req.get("token");
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: "Token no valido",
        },
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};

// ============================
// Verificar ADMIN_ROLE
// ============================
let verficarAdminRole = (req, res, next) => {
  let usuario = req.usuario;
  if (usuario.role !== "ADMIN_ROLE") {
    res.status(401).json({
      ok: false,
      message: "Usted NO es un administrador",
    });
  }
  next();
};

// ============================
// Verificar Token IMG
// ============================

let verfiicarTokenImg = (req, res, next) => {
  // Para obtener el token del link
  let token = req.query.token;

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: "Token no valido",
        },
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};

module.exports = {
  verficarToken,
  verficarAdminRole,
  verfiicarTokenImg,
};
