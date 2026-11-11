function crearControladorReservas(servicioReservas) {
  async function listarReservas(req, res) {
    const reservas = await servicioReservas.listar();

    res.render("reservas/lista", {
      titulo: "Reservas",
      reservas,
    });
  }

  function mostrarNuevaReserva(req, res) {
    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      salasPermitidas,
      turnosPermitidos,
      errores: null,
      valores: {},
    });
  }

  async function mostrarDetalleReserva(req, res) {
    const id = req.params.id;
    const reserva = await servicioReservas.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador",
      });
    }
    res.render("reservas/detalle", {
      titulo: "Detalle de reserva",
      reserva,
    });
  }

  async function mostrarEditarReserva(req, res) {
    const id = req.params.id;
    let reserva;

    try {
      reserva = await servicioReservas.obtenerPorId(id);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).render("no-encontrado", {
          titulo: "Identificador inválido",
          mensaje: "El identificador de la reserva no tiene un formato válido.",
        });
      }
      throw error;
    }

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }

    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    res.render("reservas/editar", {
      titulo: "Editar reserva",
      id: reserva.id,
      valores: {
        estudiante: reserva.estudiante,
        email: reserva.email,
        sala: reserva.sala,
        fecha: reserva.fecha,
        turno: reserva.turno,
        personas: reserva.personas,
        estado: reserva.estado,
      },
      salasPermitidas,
      turnosPermitidos,
      errores: null,
    });
  }

  async function guardarEditarReserva(req, res) {
    const id = req.params.id;
    const datos = req.body;
    const { salasPermitidas, turnosPermitidos } =
      servicioReservas.obtenerOpciones();

    const valores = {
      estudiante: typeof datos?.estudiante === "string" ? datos.estudiante : "",
      email: typeof datos?.email === "string" ? datos.email : "",
      sala: typeof datos?.sala === "string" ? datos.sala : "",
      fecha: typeof datos?.fecha === "string" ? datos.fecha : "",
      turno: typeof datos?.turno === "string" ? datos.turno : "",
      personas: typeof datos?.personas === "string" ? datos.personas : "",
      estado: typeof datos?.estado === "string" ? datos.estado : "",
    };

    const errores = [];
    const camposPermitidos = [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
      "estado",
    ];

    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      errores.push("Los datos enviados no tienen un formato válido.");
    } else {
      const camposNoPermitidos = Object.keys(datos).filter(
        (campo) => !camposPermitidos.includes(campo),
      );

      if (camposNoPermitidos.length > 0) {
        errores.push(
          `El campo ${camposNoPermitidos[0]} no se puede modificar.`,
        );
      }

      const estudiante = valores.estudiante.trim();
      const email = valores.email.trim();
      const sala = valores.sala.trim();
      const fecha = valores.fecha.trim();
      const turno = valores.turno.trim();
      const personasTexto = valores.personas.trim();
      const estado = valores.estado.trim();

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
        errores.push("La fecha es obligatoria");
      }

      if (!turnosPermitidos.includes(turno)) {
        errores.push("Debe seleccionar un turno permitido.");
      }

      const personas = personasTexto !== "" ? Number(personasTexto) : NaN;

      if (
        !Number.isFinite(personas) ||
        !Number.isInteger(personas) ||
        personas < 1 ||
        personas > 6
      ) {
        errores.push("La cantidad de personas debe ser un entero entre 1 y 6.");
      }

      if (!["pendiente", "confirmada"].includes(estado)) {
        errores.push("El estado debe ser pendiente o confirmada.");
      }

      if (errores.length === 0) {
        const reservaValidada = {
          estudiante,
          email,
          sala,
          fecha,
          turno,
          personas,
          estado,
        };

        // Datos necesarios para recuperar el formulario
        // si Mongoose rechaza el reemplazo.
        res.locals.formularioEdicion = {
          id,
          valores,
          salasPermitidas,
          turnosPermitidos,
        };

        try {
          const reserva = await servicioReservas.reemplazar(
            id,
            reservaValidada,
          );

          if (!reserva) {
            return res.status(404).render("no-encontrado", {
              titulo: "Reserva no encontrada",
              mensaje: "No existe una reserva con ese identificador.",
            });
          }

          return res.redirect(303, `/reservas/${reserva.id}`);
        } catch (error) {
          if (error.codigo === "ID_INVALIDO") {
            return res.status(400).render("no-encontrado", {
              titulo: "Identificador inválido",
              mensaje:
                "El identificador de la reserva no tiene un formato válido.",
            });
          }

          throw error;
        }
      }
    }

    return res.status(400).render("reservas/editar", {
      titulo: "Editar reserva",
      id,
      valores,
      salasPermitidas,
      turnosPermitidos,
      errores,
    });
  }

  async function crearReserva(req, res) {
    await servicioReservas.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  async function mostrarEstado(req, res) {
    const cantidadReservas = await servicioReservas.contar();

    res.json({
      servicio: "activo",
      reservas: cantidadReservas,
      solicitudId: res.locals.solicitudId,
    });
  }

  async function mostrarEstadoReserva(req, res) {
    const id = req.params.id;
    const reserva = await servicioReservas.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }

    res.render("reservas/estado", {
      titulo: "Cambiar el estado de la reserva",
      id: reserva.id,
      valores: {
        estado: reserva.estado,
      },
      errores: [],
    });
  }

  async function guardarEstadoReserva(req, res) {
    const id = req.params.id;
    const datos = req.body;

    const campos =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? Object.keys(datos)
        : [];

    const estado = datos?.estado;

    const formularioValido =
      campos.length === 1 &&
      campos[0] === "estado" &&
      typeof estado === "string" &&
      ["pendiente", "confirmada"].includes(estado);

    if (!formularioValido) {
      return res.status(400).render("reservas/estado", {
        titulo: "Cambiar el estado de la reserva",
        id,
        valores: {
          estado: typeof estado === "string" ? estado : "",
        },
        errores: ["Debe seleccionar un estado válido."],
      });
    }

    res.locals.formularioEstado = {
      id,
      valores: { estado },
    };

    const reservaActualizada = await servicioReservas.actualizar(id, {
      estado,
    });

    if (!reservaActualizada) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }

    return res.redirect(303, `/reservas/${id}`);
  }

  async function mostrarConfirmacionEliminarReserva(req, res) {
    const id = req.params.id;
    let reserva;

    try {
      reserva = await servicioReservas.obtenerPorId(id);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).render("no-encontrado", {
          titulo: "Identificador inválido",
          mensaje: "El identificador de la reserva no tiene un formato válido.",
        });
      }

      throw error;
    }

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }

    return res.render("reservas/eliminar", {
      titulo: "Confirmar eliminación de reserva",
      reserva,
    });
  }

  async function guardarEliminarReserva(req, res) {
    const id = req.params.id;
    const datos = req.body;

    const campos =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? Object.keys(datos)
        : [];

    const formularioValido =
      campos.length === 1 &&
      campos[0] === "confirmar" &&
      datos.confirmar === "si";

    if (!formularioValido) {
      return res.status(400).render("no-encontrado", {
        titulo: "Solicitud inválida",
        mensaje: "Para eliminar la reserva debe confirmar la operación.",
      });
    }

    const eliminado = await servicioReservas.eliminar(id);

    if (!eliminado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }

    return res.redirect(303, "/reservas");
  }

  // ***** CONTROLADORES API ***** //

  async function listarApi(req, res) {
    const permitidos = ["sala", "orden", "pagina", "limite"];

    for (const campo of Object.keys(req.query)) {
      if (!permitidos.includes(campo)) {
        return res.status(400).json({ error: "Parámetro no permitido." });
      }
    }

    const sala = req.query.sala;

    // Si "sala" aparece repetido en la URL, Express puede
    // representarlo como un arreglo. No se acepta ese formato.
    if (sala !== undefined) {
      if (Array.isArray(sala)) {
        return res.status(400).json({
          error: "El parámetro 'sala' debe aparecer una sola vez.",
        });
      }

      if (typeof sala !== "string" || sala.trim() === "") {
        return res
          .status(400)
          .json({ error: "El texto de sala debe tener contenido." });
      }
    }

    let orden = "estudiante";

    if (req.query.orden !== undefined) {
      orden = req.query.orden;

      if (Array.isArray(orden)) {
        return res.status(400).json({
          error: "El parámetro 'orden' debe aparecer una sola vez.",
        });
      }

      if (
        orden !== "estudiante" &&
        orden !== "personas-asc" &&
        orden !== "personas-desc"
      ) {
        return res.status(400).json({ error: "Orden no permitido." });
      }
    }

    let pagina = 1;

    if (req.query.pagina !== undefined) {
      if (Array.isArray(req.query.pagina)) {
        return res.status(400).json({
          error: "El parámetro 'pagina' debe aparecer una sola vez.",
        });
      }

      pagina = Number(req.query.pagina);

      if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
        return res.status(400).json({
          error: "El parámetro 'pagina' debe ser un entero entre 1 y 1000.",
        });
      }
    }

    let limite = 2;

    if (req.query.limite !== undefined) {
      if (Array.isArray(req.query.limite)) {
        return res.status(400).json({
          error: "El parámetro 'limite' debe aparecer una sola vez.",
        });
      }

      limite = Number(req.query.limite);

      if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
        return res.status(400).json({
          error: "El parámetro 'limite' debe ser un entero entre 1 y 20.",
        });
      }
    }

    const resultado = await servicioReservas.consultar(
      sala,
      orden,
      pagina,
      limite,
    );

    return res.json(resultado);
  }

  async function obtenerApi(req, res) {
    const reserva = await servicioReservas.obtenerPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        error: "Reserva no encontrada.",
      });
    }
    return res.json(reserva);
  }

  async function crearApi(req, res) {
    const reserva = await servicioReservas.crear(req.reservaValidada);
    return res
      .location(`/api/reservas/${reserva.id}`)
      .status(201)
      .json(reserva);
  }

  async function eliminarApi(req, res) {
    const eliminado = await servicioReservas.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({
        error: "Reserva no encontrada.",
      });
    }
    res.status(204).end();
  }

  async function reemplazarApi(req, res) {
    const reserva = await servicioReservas.reemplazar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    return res.json(reserva);
  }

  async function actualizarApi(req, res) {
    const reserva = await servicioReservas.actualizar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    return res.json(reserva);
  }

  return {
    listarReservas,
    mostrarNuevaReserva,
    mostrarDetalleReserva,
    mostrarEditarReserva,
    guardarEditarReserva,
    crearReserva,
    mostrarEstado,
    mostrarEstadoReserva,
    guardarEstadoReserva,
    mostrarConfirmacionEliminarReserva,
    guardarEliminarReserva,
    listarApi,
    obtenerApi,
    crearApi,
    eliminarApi,
    reemplazarApi,
    actualizarApi,
  };
}

module.exports = { crearControladorReservas };
