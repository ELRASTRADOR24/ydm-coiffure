import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
      instagram: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
    service: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      duration: { type: Number, required: true },
      depositAmount: { type: Number, required: true },
    },
    selectedOptions: [
      {
        name: { type: String },
        choice: { type: String },
        priceDiff: { type: Number, default: 0 },
        durationDiff: { type: Number, default: 0 },
      },
    ],
    date: { type: String, required: true, index: true }, // Format "YYYY-MM-DD"
    startTime: { type: String, required: true }, // Format "HH:mm"
    endTime: { type: String, required: true }, // Format "HH:mm"
    totalDuration: { type: Number, required: true }, // in minutes
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    remainingBalance: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL", // Demande soumise par la cliente, en attente d'approbation
        "PENDING_PAYMENT",  // Approuvée par la coiffeuse, lien Stripe envoyé, créneau verrouillé temporairement
        "CONFIRMED",        // Acompte payé via Stripe
        "REJECTED",         // Refusée par la coiffeuse
        "CANCELLED",        // Annulée
        "COMPLETED",        // Prestation effectuée
        "EXPIRED",          // Délai de paiement dépassé
      ],
      default: "PENDING_APPROVAL",
      index: true,
    },
    holdExpiresAt: { type: Date }, // Expiration du créneau réservé lors de PENDING_PAYMENT
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripePaymentUrl: { type: String },
    paidDepositAt: { type: Date },
    rejectionReason: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ date: 1, status: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
