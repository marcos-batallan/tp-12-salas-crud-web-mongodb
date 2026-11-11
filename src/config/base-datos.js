const dns = require("node:dns");
const mongoose = require("mongoose");
const { leerUriMongo } = require("./entorno");

// Corrección utilizada para las consultas DNS de Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBaseDatos() {
  await mongoose.connect(leerUriMongo(), {
    serverSelectionTimeoutMS: 5000,
  });
}

async function desconectarBaseDatos() {
  await mongoose.disconnect();
}

module.exports = { conectarBaseDatos, desconectarBaseDatos };
