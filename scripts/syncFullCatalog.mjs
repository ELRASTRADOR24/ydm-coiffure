import mongoose from "mongoose";
import SalonSettings from "../models/SalonSettings.js";
import Service from "../models/Service.js";
import { DEFAULT_SALON_SETTINGS, DEFAULT_SERVICES } from "../lib/seedData.js";

await mongoose.connect(process.env.MONGODB_URI);

// 1. Update SalonSettings with all 41 authentic gallery items
const settings = await SalonSettings.findOne();
if (settings) {
  settings.galleryItems = DEFAULT_SALON_SETTINGS.galleryItems;
  await settings.save();
  console.log(`Updated SalonSettings: ${settings.galleryItems.length} gallery items.`);
}

// 2. Clear out the Service collection and insert the exact 16 clean services
await Service.deleteMany({});
await Service.insertMany(DEFAULT_SERVICES);
console.log(`Inserted ${DEFAULT_SERVICES.length} clean services in MongoDB.`);

await mongoose.disconnect();
console.log("Full sync complete!");
