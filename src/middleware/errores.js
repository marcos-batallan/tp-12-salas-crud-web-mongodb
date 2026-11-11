function crearManejadorErrores({
  vistaFormulario,
  tituloFormulario,
  salasPermitidas,
  turnosPermitidos,
}) {
  return function manejarErrores(error, req, res, next) {
    if (res.headersSent) {
      return next(error);
    }

    const esValidacion = error.name === "ValidationError";

    const esEntrada =
      esValidacion ||
      error.name === "CastError" ||
      error.codigo === "ENTRADA_INVALIDA" ||
      error.codigo === "ID_INVALIDO" ||
      error.codigo === "FILTRO_INVALIDO" ||
      error.type === "entity.parse.failed";

    const estado = esEntrada ? 400 : 500;

    let mensaje = esEntrada
      ? "Revisa los datos enviados."
      : "No se pudo completar la operación.";

    if (error.type === "entity.parse.failed") {
      mensaje = "El cuerpo de la solicitud contiene un JSON inválido.";
    }

    if (error.codigo === "ID_INVALIDO") {
      mensaje = "El identificador debe tener 24 caracteres hexadecimales.";
    }

    if (error.codigo === "FILTRO_INVALIDO") {
      mensaje = "El filtro de sala no es válido.";
    }

    console.error("Solicitud fallida:", res.locals.solicitudId, error.name);

    // Respuestas de la API: siempre JSON.
    if (req.path.startsWith("/api/")) {
      return res.status(estado).json({
        error: mensaje,
        campos: esValidacion ? Object.keys(error.errors) : [],
      });
    }

    // Error de validación de Mongoose durante la edición de una reserva.
    if (esValidacion && req.method === "POST" && res.locals.formularioEdicion) {
      const { id, valores, salasPermitidas, turnosPermitidos } =
        res.locals.formularioEdicion;

      return res.status(400).render("reservas/editar", {
        titulo: "Editar reserva",
        id,
        valores,
        salasPermitidas,
        turnosPermitidos,
        errores: Object.values(error.errors).map((detalle) => detalle.message),
      });
    }

    // Error de validación de Mongoose durante el cambio de estado.
    if (esValidacion && req.method === "POST" && res.locals.formularioEstado) {
      const { id, valores } = res.locals.formularioEstado;

      return res.status(400).render("reservas/estado", {
        titulo: "Cambiar el estado de la reserva",
        id,
        valores,
        errores: Object.values(error.errors).map((detalle) => detalle.message),
      });
    }

    // Error de validación de Mongoose durante un POST HTML.
    if (esValidacion && req.method === "POST") {
      return res.status(400).render(vistaFormulario, {
        titulo: tituloFormulario,
        salasPermitidas,
        turnosPermitidos,
        errores: Object.values(error.errors).map((detalle) => detalle.message),
        valores: req.body ?? {},
      });
    }

    // Otros errores de solicitudes HTML.
    return res.status(estado).render("no-encontrado", {
      titulo: esEntrada ? "Solicitud inválida" : "Error del servicio",
      mensaje,
    });
  };
}

module.exports = { crearManejadorErrores };
