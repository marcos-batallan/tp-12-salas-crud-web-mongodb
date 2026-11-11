const { Reserva } = require("../src/modelos/reserva");

async function main() {
  const reserva = new Reserva({
    estudiante: "Estudiante de Prueba",
    email: "estudiante@ejemplo.com",
    sala: "Sala Sur",
    fecha: new Date(),
    turno: "Noche",
    personas: 4,
  });

  await reserva.validate();
  console.log("Datos válidos; todavía no guardamos en MongoDB.");
}

main().catch((error) => {
  console.error("Validación rechazada:", error.name, "-", error.message);
  if (error.errors) {
    console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
  }
  process.exitCode = 1;
});
