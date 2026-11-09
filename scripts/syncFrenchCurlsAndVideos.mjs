import mongoose from "mongoose";
import Service from "../models/Service.js";
import SalonSettings from "../models/SalonSettings.js";
import { DEFAULT_SALON_SETTINGS } from "../lib/seedData.js";

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB Atlas");

// 1. Update French curls Medium service
const frenchCurlUpdate = await Service.findOneAndUpdate(
  { slug: "french-curls-medium" },
  {
    $set: {
      images: ["/images/realisations/french-curl-medium-still.jpeg"],
      videoUrl: "/videos/realisations/french-curl-medium.mp4",
    },
  },
  { new: true }
);
console.log("Updated French curls Medium:", frenchCurlUpdate?.name, frenchCurlUpdate?.images, frenchCurlUpdate?.videoUrl);

// 2. Map all services to their matching video
const videoMapping = {
  "knotless-sans-meches": "/videos/realisations/knotless.mp4",
  "knotless-avec-meches": "/videos/realisations/knotless-melange-couleur.mp4",
  "boho-island-braid-sans-meches": "/videos/realisations/boho-braids.mp4",
  "boho-island-braid-avec-meches": "/videos/realisations/boho-braids-2.mp4",
  "fulani-criss-cross-sans-meches": "/videos/realisations/fulani.mp4",
  "french-curls-medium": "/videos/realisations/french-curl-medium.mp4",
  "fulani-criss-cross-avec-meches": "/videos/realisations/fulani-sup-boucle-2.mp4",
  "vanilles-sans-meches": "/videos/realisations/vanille.mp4",
  "vanilles-avec-meches": "/videos/realisations/vanille-2.mp4",
  "soft-locks-sans-meches": "/videos/realisations/soft-locs.mp4",
  "soft-locks-avec-meches": "/videos/realisations/soft-locks-part-2.mp4",
  "cornrows-sans-meches": "/videos/realisations/cornrows-2.mp4",
  "cornrows-avec-meches": "/videos/realisations/cornrow-rouge.mp4",
  "nattes-vanilles-sans-rajouts": "/videos/realisations/vanille-sans-rajout.mp4",
  "nattes-collees-sans-rajouts": "/videos/realisations/natte-collee-sans-rajout.mp4",
  "coiffure-sur-mesure": "/videos/realisations/fulani-sur-mesure.mp4",
};

for (const [slug, videoUrl] of Object.entries(videoMapping)) {
  await Service.updateOne({ slug }, { $set: { videoUrl } });
}
console.log("Updated videoUrl for all 16 services");

// 3. Update SalonSettings.galleryItems
const settings = await SalonSettings.findOne({});
if (settings) {
  const currentGallery = settings.galleryItems || [];
  const exists = currentGallery.some(
    (g) => g.videoUrl === "/videos/realisations/french-curl-medium.mp4" || g.title === "French curls Medium"
  );
  if (!exists) {
    const newItem = {
      id: 42,
      type: "video",
      title: "French curls Medium",
      category: "Knotless",
      videoUrl: "/videos/realisations/french-curl-medium.mp4",
      image: "/images/realisations/french-curl-medium-still.jpeg",
      aspect: "tall",
      order: 10,
    };
    settings.galleryItems.splice(9, 0, newItem);
    // re-index order
    settings.galleryItems.forEach((item, idx) => {
      item.order = idx + 1;
    });
    await settings.save();
    console.log("Added French curls Medium to SalonSettings.galleryItems! Total items:", settings.galleryItems.length);
  } else {
    console.log("French curls Medium already in SalonSettings.galleryItems");
  }
}

await mongoose.disconnect();
console.log("Database synchronization complete.");
