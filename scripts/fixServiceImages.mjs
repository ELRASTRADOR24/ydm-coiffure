import mongoose from "mongoose";
import Service from "../models/Service.js";

await mongoose.connect(process.env.MONGODB_URI);

const updates = [
  {
    slug: "nattes-vanilles-sans-rajouts",
    images: ["/images/realisations/vanille-sans-rajout-still.jpeg"],
  },
  {
    slug: "nattes-collees-sans-rajouts",
    images: ["/images/realisations/natte-collee-sans-rajout-still.jpeg"],
  },
  {
    slug: "knotless-sans-meches",
    images: ["/images/realisations/knotless-still.jpeg", "/images/realisations/IMG_3401_still.jpeg"],
  },
  {
    slug: "french-curls-medium",
    images: ["/images/realisations/fulani-sup-boucle-still.jpeg"],
  },
  {
    slug: "fulani-criss-cross-sans-meches",
    images: ["/images/realisations/fulani-still.jpeg", "/images/realisations/IMG_3475_still.jpeg"],
  },
  {
    slug: "vanilles-sans-meches",
    images: ["/images/realisations/vanille-still.jpeg"],
  },
  {
    slug: "boho-island-braid-sans-meches",
    images: ["/images/realisations/boho-braids-still.jpeg", "/images/realisations/FE8CAC4A-8B5A-4FDF-A6AF-67D0E81C5151_still.jpeg"],
  },
  {
    slug: "soft-locks-sans-meches",
    images: ["/images/realisations/soft-locs-still.jpeg"],
  },
  {
    slug: "cornrows-sans-meches",
    images: ["/images/realisations/cornrows-2-still.jpeg"],
  },
  {
    slug: "knotless-avec-meches",
    images: ["/images/realisations/knotless-melange-couleur-still.jpeg", "/images/realisations/knotless-large-still.jpeg"],
  },
  {
    slug: "fulani-criss-cross-avec-meches",
    images: ["/images/realisations/fulani-sup-boucle-2-still.jpeg", "/images/realisations/fulani-8.jpeg"],
  },
  {
    slug: "vanilles-avec-meches",
    images: ["/images/realisations/vanille-2-still.jpeg"],
  },
  {
    slug: "boho-island-braid-avec-meches",
    images: ["/images/realisations/boho-braids-2-still.jpeg"],
  },
  {
    slug: "cornrows-avec-meches",
    images: ["/images/realisations/cornrow-rouge-still.jpeg"],
  },
  {
    slug: "soft-locks-avec-meches",
    images: ["/images/realisations/soft-locks-part-2-still.jpeg"],
  },
  {
    slug: "coiffure-sur-mesure",
    images: ["/images/realisations/fulani-sur-mesure-still.jpeg"],
  },
];

for (const u of updates) {
  const res = await Service.findOneAndUpdate(
    { slug: u.slug },
    { $set: { images: u.images } }
  );
  if (res) {
    console.log(`Updated ${u.slug} -> ${u.images[0]}`);
  } else {
    console.log(`NOT FOUND: ${u.slug}`);
  }
}

await mongoose.disconnect();
console.log("Done updating services!");
