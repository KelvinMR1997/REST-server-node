// ============================
// Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;
// ============================
// Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || "dev";
// ============================
// Vencimiento del token
// ============================
process.env.CADUCIDAD_TOKEN = '48h';
// ============================
// SEED de autenticación
// ============================
process.env.SEED = process.env.SEED || "este-es-el-seed-desarrollo";

// ============================
// Base de datos
// ============================
let urlDB;
if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB = process.env.MONGO_URL;
}
process.env.URLDB = urlDB;
// ============================
// Google CLIENT_ID
// ============================
process.env.CLIENT_ID =
  process.env.CLIENT_ID ||
  "650256762883-bvipf03vmmmqf88lnki5220nlk2140ig.apps.googleusercontent.com";
