const express = require("express");

const { prepararAreaReservas } = require("../middleware/reservas");

function crearRouterReservas(controladorReservas, validarReserva) {
  const router = express.Router();

  router.use(prepararAreaReservas);

  router.get("/", controladorReservas.listarReservas);

  router.get("/nueva", controladorReservas.mostrarNuevaReserva);

  router.get("/:id/editar", controladorReservas.mostrarEditarReserva);
  router.post("/:id/editar", controladorReservas.guardarEditarReserva);

  router.get("/:id/estado", controladorReservas.mostrarEstadoReserva);
  router.post("/:id/estado", controladorReservas.guardarEstadoReserva);

  router.get(
    "/:id/eliminar",
    controladorReservas.mostrarConfirmacionEliminarReserva,
  );
  router.post("/:id/eliminar", controladorReservas.guardarEliminarReserva);

  router.get("/:id", controladorReservas.mostrarDetalleReserva);
  router.post("/", validarReserva, controladorReservas.crearReserva);

  return router;
}

module.exports = { crearRouterReservas };
