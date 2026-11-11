const express = require("express");
const {
  validarReemplazoReserva,
  validarActualizacionReserva,
} = require("../middleware/cambios-reservas");

function crearRouterReservasApi(controladorReservas, validarReserva) {
  const router = express.Router();

  router.get("/", controladorReservas.listarApi);
  router.get("/:id", controladorReservas.obtenerApi);
  router.post("/", validarReserva, controladorReservas.crearApi);
  router.delete("/:id", controladorReservas.eliminarApi);
  router.put(
    "/:id",
    validarReserva,
    validarReemplazoReserva,
    controladorReservas.reemplazarApi,
  );
  router.patch(
    "/:id",
    validarActualizacionReserva,
    controladorReservas.actualizarApi,
  );

  return router;
}

module.exports = { crearRouterReservasApi };
