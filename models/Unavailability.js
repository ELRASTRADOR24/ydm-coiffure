import mongoose from "mongoose";

const UnavailabilitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // Format "YYYY-MM-DD"
    isAllDay: { type: Boolean, default: true },
    startTime: { type: String }, // "14:00"
    endTime: { type: String }, // "18:00"
    reason: { type: String, default: "Indisponibilité ponctuelle" },
  },
  { timestamps: true }
);

export default mongoose.models.Unavailability ||
  mongoose.model("Unavailability", UnavailabilitySchema);
