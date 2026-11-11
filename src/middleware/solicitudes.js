// Middleware personalizado global para asignar un identificador de forma consecutiva a cada solicitud.
let numeroDeSolicitud = 0;

function crearIdentificadorSolicitud() {
  return function identificarSolicitud(req, res, next) {
    numeroDeSolicitud += 1;
    res.locals.solicitudId = `BIB-${String(numeroDeSolicitud).padStart(4, "0")}`;
    next();
  };
}

// Middleware personalizado global para medir la duración de la solicitud hasta que termina la respuesta.
function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on("finish", () => {
    const milisegundos = Number(process.hrtime.bigint() - inicio) / 1_000_000;
    console.log(
      `ID: ${res.locals.solicitudId}\nMetodo: ${req.method}\nURL original: ${req.originalUrl}\nStatus Code: ${res.statusCode}\nDuración: ${milisegundos.toFixed(2)} ms\n`,
    );
  });
  next();
}
module.exports = { crearIdentificadorSolicitud, medirDuracion };
