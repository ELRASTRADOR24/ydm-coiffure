import { connectToDatabase } from "../lib/db.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Availability from "../models/Availability.js";
import SalonSettings from "../models/SalonSettings.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import {
  DEFAULT_SETTINGS,
  DEFAULT_AVAILABILITIES,
  DEFAULT_SERVICES,
} from "../lib/seedData.js";
import { hashPassword } from "../lib/auth.js";
import fs from "fs";
import path from "path";

async function runSeed() {
  console.log("[SEED] Demarrage de l'initialisation des donnees YDM Coiffure...");

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@ydm-coiffure.fr").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "YdmLuxe2026!";
  const hashedPassword = await hashPassword(adminPassword);

  const mongoConn = await connectToDatabase();
  if (mongoConn) {
    console.log("[DB] Connexion a MongoDB Atlas reussie. Injection des collections...");

    await User.deleteMany({});
    await User.create({
      name: "Yasmine D.",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    });

    await Service.deleteMany({});
    await Service.insertMany(DEFAULT_SERVICES);

    await Availability.deleteMany({});
    await Availability.insertMany(DEFAULT_AVAILABILITIES);

    await SalonSettings.deleteMany({});
    await SalonSettings.create(DEFAULT_SETTINGS);

    console.log("[DB] Donnees MongoDB Atlas initialisees avec succes.");
  } else {
    console.log("[FS] MONGODB_URI non configure, initialisation du stockage local (.data/db.json)...");
    const dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbFile = path.join(dataDir, "db.json");
    const localData = {
      settings: DEFAULT_SETTINGS,
      availabilities: DEFAULT_AVAILABILITIES,
      services: DEFAULT_SERVICES,
      unavailabilities: [],
      bookings: [],
      customers: [],
      users: [
        {
          id: "usr_admin",
          name: "Yasmine D.",
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
        },
      ],
    };
    fs.writeFileSync(dbFile, JSON.stringify(localData, null, 2), "utf-8");
    console.log("[FS] Fichier .data/db.json cree et initialise.");
  }

  console.log("[OK] Seeding termine. Compte administrateur pret :");
  console.log(`   E-mail : ${adminEmail}`);
  console.log(`   Mot de passe : ${adminPassword}`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("[ERROR] Erreur lors du seeding:", err);
  process.exit(1);
});
