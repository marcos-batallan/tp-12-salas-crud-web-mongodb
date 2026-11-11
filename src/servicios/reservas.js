// Lógica de datos en memoria. No conoce req, res, EJS ni códigos HTTP.
function crearServicioReservas({
  reservasIniciales = [],
  salasPermitidas = [],
  turnosPermitidos = [],
} = {}) {
  const reservas = reservasIniciales.map((reserva) => ({ ...reserva }));
  const opciones = {
    salasPermitidas: [...salasPermitidas],
    turnosPermitidos: [...turnosPermitidos],
  };

  let proximoId = Math.max(0, ...reservas.map((reserva) => reserva.id)) + 1;

  // Datos privados del servicio
  function listar() {
    return [...reservas];
  }

  function obtenerPorId(id) {
    return reservas.find((reserva) => reserva.id === id);
  }

  function contar() {
    return reservas.length;
  }

  function crear(datos) {
    const nuevaReserva = { id: proximoId, ...datos };
    proximoId += 1;
    reservas.push(nuevaReserva);
    return nuevaReserva;
  }

  function obtenerOpciones() {
    return {
      salasPermitidas: [...opciones.salasPermitidas],
      turnosPermitidos: [...opciones.turnosPermitidos],
    };
  }

  return {
    listar,
    obtenerPorId,
    contar,
    crear,
    obtenerOpciones,
  };
}

module.exports = { crearServicioReservas };
