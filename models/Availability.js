import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      unique: true,
    }, // 0 = Dimanche, 1 = Lundi, ... 6 = Samedi
    dayName: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "19:00" },
    breaks: [
      {
        start: { type: String, default: "12:30" },
        end: { type: String, default: "13:30" },
        label: { type: String, default: "Pause déjeuner" },
      },
    ],
    bufferTimeMinutes: { type: Number, default: 15 }, // Battement entre 2 clientes
  },
  { timestamps: true }
);

export default mongoose.models.Availability || mongoose.model("Availability", AvailabilitySchema);
