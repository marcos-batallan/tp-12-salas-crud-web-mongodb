function validarReemplazoReserva(req, res, next) {
  const datos = req.body;
  const permitidos = [
    "estudiante",
    "email",
    "sala",
    "fecha",
    "turno",
    "personas",
    "estado",
  ];

  for (const campo of Object.keys(datos)) {
    if (!permitidos.includes(campo)) {
      return res.status(400).json({
        error: "El campo " + campo + " no se puede modificar.",
      });
    }
  }

  const estado =
    typeof datos.estado === "string" ? datos.estado.trim() : datos.estado;

  if (!["pendiente", "confirmada"].includes(estado)) {
    return res.status(400).json({
      error: "Estado debe ser pendiente o confirmada.",
    });
  }

  req.cambiosValidos = {
    ...req.reservaValidada,
    estado,
  };

  return next();
}

function validarActualizacionReserva(req, res, next) {
  const datos = req.body;

  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return res.status(400).json({ error: "Enviá un objeto JSON." });
  }

  for (const campo of Object.keys(datos)) {
    if (campo !== "personas" && campo !== "estado") {
      return res
        .status(400)
        .json({ error: "Sólo se pueden cambiar personas y estado." });
    }
  }

  if (datos.personas === undefined && datos.estado === undefined) {
    return res.status(400).json({ error: "Enviá personas o estado." });
  }

  const cambios = {};

  if (datos.personas !== undefined) {
    const personas =
      typeof datos.personas === "string" && datos.personas.trim() !== ""
        ? Number(datos.personas)
        : datos.personas;

    if (typeof personas !== "number") {
      return res.status(400).json({ error: "Personas debe ser un número." });
    }

    if (
      !Number.isFinite(personas) ||
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 6
    ) {
      return res
        .status(400)
        .json({ error: "Personas debe ser un entero entre 1 y 6." });
    }

    cambios.personas = personas;
  }

  if (datos.estado !== undefined) {
    const estado =
      typeof datos.estado === "string" ? datos.estado.trim() : datos.estado;

    if (!["pendiente", "confirmada"].includes(estado)) {
      return res
        .status(400)
        .json({ error: "Estado debe ser pendiente o confirmada." });
    }

    cambios.estado = estado;
  }

  req.cambiosValidos = cambios;
  return next();
}

module.exports = { validarReemplazoReserva, validarActualizacionReserva };
