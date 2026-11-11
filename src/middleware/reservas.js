function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}

function crearValidadorReserva(servicioReservas) {
  return function validarReserva(req, res, next) {
    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    const valores = req.body ?? {};
    const esApi = req.baseUrl === "/api/reservas";

    // En el POST de la API se ignoran estado e _id enviados por el cliente.
    if (esApi && req.method === "POST") {
      const camposPermitidos = [
        "estudiante",
        "email",
        "sala",
        "fecha",
        "turno",
        "personas",
      ];

      const camposIgnorados = ["estado", "_id"];

      const camposNoPermitidos = Object.keys(req.body ?? {}).filter(
        (campo) =>
          !camposPermitidos.includes(campo) && !camposIgnorados.includes(campo),
      );

      if (camposNoPermitidos.length > 0) {
        return res.status(400).json({
          error: `El campo ${camposNoPermitidos[0]} no se puede modificar.`,
        });
      }
    }

    const estudiante =
      typeof valores.estudiante === "string" ? valores.estudiante.trim() : "";

    const email = typeof valores.email === "string" ? valores.email.trim() : "";

    const sala = typeof valores.sala === "string" ? valores.sala.trim() : "";

    const fecha = typeof valores.fecha === "string" ? valores.fecha.trim() : "";

    const turno = typeof valores.turno === "string" ? valores.turno.trim() : "";

    // HTML y la API pueden recibir personas como texto.
    // Si es una cadena no vacía, se convierte a número para validarla.
    const personasTexto =
      typeof valores.personas === "string" ? valores.personas.trim() : "";

    const personas =
      personasTexto !== ""
        ? Number(personasTexto)
        : esApi
          ? valores.personas
          : NaN;

    const errores = [];

    if (!estudiante) {
      errores.push("El nombre del estudiante es obligatorio.");
    }

    if (!email) {
      errores.push("El email es obligatorio.");
    } else if (!email.includes("@")) {
      errores.push("El email debe contener un @ válido.");
    }

    if (!salasPermitidas.includes(sala)) {
      errores.push("Debe seleccionar una sala permitida.");
    }

    if (!fecha) {
      errores.push("La fecha es obligatoria.");
    }

    if (!turnosPermitidos.includes(turno)) {
      errores.push("Debe seleccionar un turno permitido.");
    }

    if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
      errores.push("La cantidad de personas debe ser un entero entre 1 y 6.");
    }

    if (errores.length > 0) {
      if (esApi) {
        return res.status(400).json({
          error: "Los datos de la reserva no son válidos.",
          detalles: errores,
        });
      }

      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva reserva",
        salasPermitidas,
        turnosPermitidos,
        valores,
        errores,
      });
    }

    req.reservaValidada = {
      estudiante,
      email,
      sala,
      fecha,
      turno,
      personas,
    };

    return next();
  };
}

module.exports = {
  prepararAreaReservas,
  crearValidadorReserva,
};
