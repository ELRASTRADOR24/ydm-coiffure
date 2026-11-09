import mongoose from "mongoose";

const ServiceOptionChoiceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    priceDiff: { type: Number, default: 0 },
    durationDiff: { type: Number, default: 0 },
  },
  { _id: false }
);

const ServiceOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    choices: [ServiceOptionChoiceSchema],
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      default: "Sans mèches incluses",
    },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 15 }, // in minutes
    depositAmount: { type: Number, default: 10 },
    includesHair: { type: Boolean, default: false },
    isCustomRequest: { type: Boolean, default: false },
    images: [{ type: String }],
    videoUrl: { type: String },
    options: [ServiceOptionSchema],
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    preparationAdvice: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
