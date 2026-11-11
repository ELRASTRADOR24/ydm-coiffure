import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    instagram: { type: String, default: "" },
    notes: { type: String, default: "" },
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastBookingAt: { type: Date },
  },
  { timestamps: true }
);

if (mongoose.models.Customer) {
  mongoose.deleteModel("Customer");
}

export default mongoose.model("Customer", CustomerSchema);
