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
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, default: "", trim: true },
      email: { type: String, default: "", lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
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
        "RESCHEDULE_PROPOSED", // La coiffeuse propose une autre date, en attente de réponse cliente
        "PENDING_PAYMENT",  // Approuvée par la coiffeuse (ou contre-proposition acceptée), lien acompte envoyé, créneau verrouillé temporairement
        "CONFIRMED",        // Acompte validé (Wero, Revolut, PayPal ou espèces)
        "REJECTED",         // Refusée par la coiffeuse
        "CANCELLED",        // Annulée
        "COMPLETED",        // Prestation effectuée
        "EXPIRED",          // Délai de paiement dépassé
      ],
      default: "PENDING_APPROVAL",
      index: true,
    },
    holdExpiresAt: { type: Date }, // Expiration du créneau réservé lors de PENDING_PAYMENT
    originalDate: { type: String }, // Date initialement demandée par la cliente
    originalStartTime: { type: String },
    originalEndTime: { type: String },
    previousDate: { type: String }, // Créneau précédent avant contre-proposition
    previousStartTime: { type: String },
    previousEndTime: { type: String },
    proposedDate: { type: String }, // Date proposée par la coiffeuse
    proposedStartTime: { type: String },
    proposedEndTime: { type: String },
    proposalMessage: { type: String, default: "" },
    proposedAt: { type: Date },
    proposalResponse: { type: String, default: "" }, // "", "ACCEPTED", "COUNTER_PROPOSED", "DECLINED"
    proposalRespondedAt: { type: Date },
    proposalDeclineReason: { type: String, default: "" },
    proposalRound: { type: Number, default: 0 },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripePaymentUrl: { type: String },
    paidDepositAt: { type: Date },
    depositDeclared: { type: Boolean, default: false },
    depositDeclaredMethod: { type: String, default: "" },
    depositDeclaredAt: { type: Date },
    depositRejectedAt: { type: Date },
    depositRejectionReason: { type: String, default: "" },
    rejectionReason: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ date: 1, status: 1 });

if (mongoose.models.Booking) {
  mongoose.deleteModel("Booking");
}

export default mongoose.model("Booking", BookingSchema);
