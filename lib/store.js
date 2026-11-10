import fs from "fs";
import path from "path";
import { connectToDatabase } from "./db.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Availability from "../models/Availability.js";
import Unavailability from "../models/Unavailability.js";
import SalonSettings from "../models/SalonSettings.js";
import {
  DEFAULT_SETTINGS,
  DEFAULT_AVAILABILITIES,
  DEFAULT_SERVICES,
} from "./seedData.js";
import { hashPassword } from "./auth.js";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureLocalDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function getLocalData() {
  ensureLocalDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const adminPasswordHash = await hashPassword(
      process.env.ADMIN_PASSWORD || "YdmLuxe2026!"
    );
    const initialData = {
      settings: { ...DEFAULT_SETTINGS },
      availabilities: [...DEFAULT_AVAILABILITIES],
      services: [...DEFAULT_SERVICES],
      unavailabilities: [],
      bookings: [
        {
          id: "bk_demo_1",
          bookingReference: "YDM-2026-9482",
          customer: {
            firstName: "Sarah",
            lastName: "B.",
            email: "sarah.b@example.com",
            phone: "06 12 34 56 78",
            notes: "Cheveux propres et démêlés.",
          },
          service: {
            id: "srv_knotless_sans_meches",
            name: "Knotless (Sans mèches fournies)",
            price: 40,
            duration: 210,
            depositAmount: 10,
          },
          selectedOptions: [
            {
              name: "Longueur souhaitée",
              choice: "Mi-long (40 €)",
              priceDiff: 10,
              durationDiff: 30,
            },
          ],
          date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
          startTime: "10:00",
          endTime: "13:30",
          totalDuration: 210,
          totalPrice: 40,
          depositAmount: 10,
          remainingBalance: 30,
          status: "CONFIRMED",
          paidDepositAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: "bk_demo_2",
          bookingReference: "YDM-2026-4719",
          customer: {
            firstName: "Léa",
            lastName: "M.",
            email: "lea.m@example.com",
            phone: "07 98 76 54 32",
            notes: "Demande en attente de validation.",
          },
          service: {
            id: "srv_fulani_criss_cross_avec_meches",
            name: "Fulani / Criss Cross (Mèches incluses)",
            price: 60,
            duration: 210,
            depositAmount: 10,
          },
          selectedOptions: [
            {
              name: "Longueur souhaitée",
              choice: "Mi-long (60 €)",
              priceDiff: 10,
              durationDiff: 30,
            },
          ],
          date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
          startTime: "14:00",
          endTime: "17:30",
          totalDuration: 210,
          totalPrice: 60,
          depositAmount: 10,
          remainingBalance: 50,
          status: "PENDING_APPROVAL",
          createdAt: new Date().toISOString(),
        },
      ],
      customers: [
        {
          id: "cust_1",
          firstName: "Sarah",
          lastName: "B.",
          email: "sarah.b@example.com",
          phone: "06 12 34 56 78",
          totalBookings: 1,
          totalSpent: 40,
          lastBookingAt: new Date().toISOString(),
        },
        {
          id: "cust_2",
          firstName: "Fatou",
          lastName: "Camara",
          email: "fatou.c@example.com",
          phone: "07 98 76 54 32",
          totalBookings: 1,
          totalSpent: 60,
          lastBookingAt: new Date().toISOString(),
        },
      ],
      users: [
        {
          id: "usr_admin",
          name: "Yasmine D. (Coiffeuse & Fondatrice)",
          email: (process.env.ADMIN_EMAIL || "admin@ydm-coiffure.fr").toLowerCase(),
          password: adminPasswordHash,
          role: "ADMIN",
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function saveLocalData(data) {
  ensureLocalDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function generateBookingReference() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `YDM-${year}-${random}`;
}

// ============================================================================
// SETTINGS
// ============================================================================
export async function getSettings() {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    let settings = await SalonSettings.findOne().lean();
    if (!settings) {
      settings = await SalonSettings.create(DEFAULT_SETTINGS);
    }
    return JSON.parse(JSON.stringify(settings));
  }
  const data = await getLocalData();
  return data.settings || DEFAULT_SETTINGS;
}

export async function updateSettings(newSettings) {
  const sanitized = { ...newSettings };
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;

  const isMongo = await connectToDatabase();
  if (isMongo) {
    const updated = await SalonSettings.findOneAndUpdate(
      {},
      { $set: sanitized },
      {
        new: true,
        upsert: true,
      }
    ).lean();
    return JSON.parse(JSON.stringify(updated));
  }
  const data = await getLocalData();
  data.settings = { ...data.settings, ...sanitized };
  saveLocalData(data);
  return data.settings;
}

// ============================================================================
// AVAILABILITIES
// ============================================================================
export async function getAvailabilities() {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    let list = await Availability.find().sort({ dayOfWeek: 1 }).lean();
    if (list.length === 0) {
      await Availability.insertMany(DEFAULT_AVAILABILITIES);
      list = await Availability.find().sort({ dayOfWeek: 1 }).lean();
    }
    return JSON.parse(JSON.stringify(list));
  }
  const data = await getLocalData();
  return data.availabilities || DEFAULT_AVAILABILITIES;
}

export async function updateAvailability(dayOfWeek, updateData) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const updated = await Availability.findOneAndUpdate(
      { dayOfWeek },
      updateData,
      { new: true, upsert: true }
    ).lean();
    return JSON.parse(JSON.stringify(updated));
  }
  const data = await getLocalData();
  const index = data.availabilities.findIndex((a) => a.dayOfWeek === dayOfWeek);
  if (index !== -1) {
    data.availabilities[index] = { ...data.availabilities[index], ...updateData };
  } else {
    data.availabilities.push({ dayOfWeek, ...updateData });
  }
  saveLocalData(data);
  return data.availabilities[index];
}

// ============================================================================
// UNAVAILABILITIES (Congés & fermetures exceptionnelles)
// ============================================================================
export async function getUnavailabilities() {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const list = await Unavailability.find().sort({ date: 1 }).lean();
    return JSON.parse(JSON.stringify(list));
  }
  const data = await getLocalData();
  return data.unavailabilities || [];
}

export async function addUnavailability(item) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const created = await Unavailability.create(item);
    return JSON.parse(JSON.stringify(created));
  }
  const data = await getLocalData();
  const newItem = { id: `unav_${Date.now()}`, ...item, createdAt: new Date().toISOString() };
  data.unavailabilities.push(newItem);
  saveLocalData(data);
  return newItem;
}

export async function deleteUnavailability(id) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    await Unavailability.findByIdAndDelete(id);
    return true;
  }
  const data = await getLocalData();
  data.unavailabilities = data.unavailabilities.filter((u) => u.id !== id && u._id !== id);
  saveLocalData(data);
  return true;
}

// ============================================================================
// SERVICES
// ============================================================================
export async function getServices(onlyActive = false) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const query = onlyActive ? { isActive: true } : {};
    let list = await Service.find(query).sort({ order: 1, createdAt: 1 }).lean();
    if (list.length === 0) {
      await Service.insertMany(DEFAULT_SERVICES);
      list = await Service.find(query).sort({ order: 1, createdAt: 1 }).lean();
    }
    return JSON.parse(JSON.stringify(list));
  }
  const data = await getLocalData();
  let list = data.services || DEFAULT_SERVICES;
  if (onlyActive) {
    list = list.filter((s) => s.isActive);
  }
  return list;
}

export async function getServiceBySlug(slug) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const item = await Service.findOne({ slug }).lean();
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }
  const data = await getLocalData();
  return (data.services || []).find((s) => s.slug === slug) || null;
}

export async function getServiceById(id) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const item = await Service.findById(id).lean();
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }
  const data = await getLocalData();
  return (data.services || []).find((s) => s.id === id || s._id === id) || null;
}

export async function createService(serviceData) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const created = await Service.create(serviceData);
    return JSON.parse(JSON.stringify(created));
  }
  const data = await getLocalData();
  const newService = {
    id: `srv_${Date.now()}`,
    ...serviceData,
    createdAt: new Date().toISOString(),
  };
  data.services.push(newService);
  saveLocalData(data);
  return newService;
}

export async function updateService(id, updateData) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const updated = await Service.findByIdAndUpdate(id, updateData, { new: true }).lean();
    return updated ? JSON.parse(JSON.stringify(updated)) : null;
  }
  const data = await getLocalData();
  const index = data.services.findIndex((s) => s.id === id || s._id === id);
  if (index === -1) return null;
  data.services[index] = { ...data.services[index], ...updateData };
  saveLocalData(data);
  return data.services[index];
}

export async function deleteService(id) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    await Service.findByIdAndDelete(id);
    return true;
  }
  const data = await getLocalData();
  data.services = data.services.filter((s) => s.id !== id && s._id !== id);
  saveLocalData(data);
  return true;
}

// ============================================================================
// BOOKINGS
// ============================================================================
export async function getBookings(filters = {}) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const query = {};
    if (filters.date) query.date = filters.date;
    if (filters.status) query.status = filters.status;
    const list = await Booking.find(query).sort({ date: 1, startTime: 1 }).lean();
    return JSON.parse(JSON.stringify(list));
  }
  const data = await getLocalData();
  let list = data.bookings || [];
  if (filters.date) {
    list = list.filter((b) => b.date === filters.date);
  }
  if (filters.status) {
    list = list.filter((b) => b.status === filters.status);
  }
  return list;
}

export async function getBookingById(id) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const b = await Booking.findById(id).lean();
    return b ? JSON.parse(JSON.stringify(b)) : null;
  }
  const data = await getLocalData();
  return (data.bookings || []).find((b) => b.id === id || b._id === id) || null;
}

export async function getBookingByReference(reference) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const b = await Booking.findOne({ bookingReference: reference }).lean();
    return b ? JSON.parse(JSON.stringify(b)) : null;
  }
  const data = await getLocalData();
  return (data.bookings || []).find((b) => b.bookingReference === reference) || null;
}

export async function createBooking(bookingData) {
  const isMongo = await connectToDatabase();
  const ref = bookingData.bookingReference || generateBookingReference();

  if (isMongo) {
    const created = await Booking.create({
      ...bookingData,
      bookingReference: ref,
    });

    // Update customer statistics
    await recordCustomerBooking(bookingData.customer, bookingData.totalPrice);
    return JSON.parse(JSON.stringify(created));
  }

  const data = await getLocalData();
  const newBooking = {
    id: `bk_${Date.now()}`,
    ...bookingData,
    bookingReference: ref,
    createdAt: new Date().toISOString(),
  };
  data.bookings.push(newBooking);

  // Sync customer
  const customerEmail = bookingData.customer.email.toLowerCase();
  let customer = data.customers.find((c) => c.email.toLowerCase() === customerEmail);
  if (customer) {
    customer.totalBookings += 1;
    customer.totalSpent += bookingData.totalPrice || 0;
    customer.lastBookingAt = new Date().toISOString();
  } else {
    data.customers.push({
      id: `cust_${Date.now()}`,
      firstName: bookingData.customer.firstName,
      lastName: bookingData.customer.lastName,
      email: customerEmail,
      phone: bookingData.customer.phone,
      instagram: bookingData.customer.instagram || "",
      totalBookings: 1,
      totalSpent: bookingData.totalPrice || 0,
      lastBookingAt: new Date().toISOString(),
    });
  }

  saveLocalData(data);
  return newBooking;
}

export async function updateBooking(id, updateData) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const updated = await Booking.findByIdAndUpdate(id, updateData, { new: true }).lean();
    return updated ? JSON.parse(JSON.stringify(updated)) : null;
  }
  const data = await getLocalData();
  const index = data.bookings.findIndex((b) => b.id === id || b._id === id);
  if (index === -1) return null;
  data.bookings[index] = { ...data.bookings[index], ...updateData };
  saveLocalData(data);
  return data.bookings[index];
}

export async function recordCustomerBooking(customerInfo, amount = 0) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    await Customer.findOneAndUpdate(
      { email: customerInfo.email.toLowerCase() },
      {
        $set: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone,
          instagram: customerInfo.instagram || "",
          lastBookingAt: new Date(),
        },
        $inc: {
          totalBookings: 1,
          totalSpent: amount,
        },
      },
      { upsert: true, new: true }
    );
  }
}

// ============================================================================
// CUSTOMERS
// ============================================================================
export async function getCustomers() {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const list = await Customer.find().sort({ lastBookingAt: -1 }).lean();
    return JSON.parse(JSON.stringify(list));
  }
  const data = await getLocalData();
  return data.customers || [];
}

// ============================================================================
// USERS (AUTH)
// ============================================================================
export async function getUserByEmail(email) {
  const isMongo = await connectToDatabase();
  if (isMongo) {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }
  const data = await getLocalData();
  return (
    (data.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
    null
  );
}

export async function createAdminUserIfMissing() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@ydm-coiffure.fr").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "YdmLuxe2026!";

  const isMongo = await connectToDatabase();
  if (isMongo) {
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await hashPassword(adminPassword);
      await User.create({
        name: "Yasmine D.",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      });
      console.log(`[AUTH] Compte administrateur créé pour : ${adminEmail}`);
    }
  }
}
