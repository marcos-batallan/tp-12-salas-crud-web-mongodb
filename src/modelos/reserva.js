const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: [true, "El nombre del estudiante es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      trim: true,
      match: [/@/, "El email debe contener '@'"],
    },
    sala: {
      type: String,
      required: [
        true,
        "La sala es obligatoria; elegir Sala Norte, Sala Sur o Sala Multimedia",
      ],
      enum: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
    },
    fecha: {
      type: String,
      required: true,
      trim: true,
    },
    turno: {
      type: String,
      required: [true, "El turno es obligatorio; eligir Mañana, Tarde o Noche"],
      trim: true,
      enum: ["Mañana", "Tarde", "Noche"],
    },
    personas: {
      type: Number,
      validate: {
        validator: Number.isInteger,
        message: "Debe ser un número entero",
      },
      min: [1, "Debe haber al menos 1 persona"],
      max: [6, "No pueden ser más de 6 personas"],
      required: [true, "La cantidad de personas es obligatoria"],
    },
    estado: {
      type: String,
      trim: true,
      enum: ["pendiente", "confirmada"],
      default: "pendiente",
    },
  },
  { collection: "reservas" },
);

const Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = { Reserva };
