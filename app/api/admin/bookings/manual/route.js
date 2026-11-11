import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getServiceById,
  createBooking,
  getBookings,
  getUnavailabilities,
} from "@/lib/store";
import { timeToMinutes, minutesToTime } from "@/lib/availabilityEngine";
import { findManualBookingConflict } from "@/lib/adminHelpers";

function revalidateBookingRoutes() {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/customers");
  revalidatePath("/reserver");
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      serviceId,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      date,
      startTime,
      notes,
      totalPrice: customPrice,
      duration: customDuration,
      selectedOptions: rawSelectedOptions,
      status = "CONFIRMED",
    } = body;

    if (!["CONFIRMED", "PENDING_PAYMENT", "PENDING_APPROVAL"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Statut de réservation invalide." },
        { status: 400 }
      );
    }

    if (
      !serviceId ||
      !date ||
      !startTime ||
      !String(customerFirstName || "").trim() ||
      !String(customerPhone || "").trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner tous les champs requis." },
        { status: 400 }
      );
    }

    const service = await getServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Prestation introuvable." },
        { status: 404 }
      );
    }

    const parsedDuration = Number(customDuration || service.duration);
    const duration =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? Math.round(parsedDuration)
        : 180;
    const rawPrice = customPrice !== undefined ? Number(customPrice) : Number(service.price);
    const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : service.price;
    const rawDeposit = Number(service.depositAmount);
    const depositAmount =
      Number.isFinite(rawDeposit) && rawDeposit >= 0 ? rawDeposit : 10;
    const remainingBalance = Math.max(0, price - depositAmount);

    const [unavailabilities, existingBookings] = await Promise.all([
      getUnavailabilities(),
      getBookings({ date }),
    ]);

    const conflictCheck = findManualBookingConflict({
      date,
      startTime,
      duration,
      existingBookings,
      unavailabilities,
    });

    if (conflictCheck.conflict) {
      return NextResponse.json(
        {
          success: false,
          error:
            conflictCheck.reason ||
            "Attention : ce créneau chevauche un autre rendez-vous ou une indisponibilité.",
        },
        { status: conflictCheck.type === "invalid" ? 400 : 409 }
      );
    }

    const startMin = timeToMinutes(startTime);
    const endMin = startMin + duration;
    const endTime = minutesToTime(endMin);

    const sanitizedOptions = Array.isArray(rawSelectedOptions)
      ? rawSelectedOptions
          .filter((o) => o && typeof o === "object" && String(o.name || "").trim() && String(o.choice || "").trim())
          .map((o) => ({
            name: String(o.name).trim(),
            choice: String(o.choice).trim(),
            priceDiff: Number(o.priceDiff) || 0,
            durationDiff: Number(o.durationDiff) || 0,
          }))
      : [];

    const newBooking = await createBooking({
      customer: {
        firstName: String(customerFirstName).trim(),
        lastName: String(customerLastName || "").trim(),
        email: String(customerEmail || "").trim().toLowerCase(),
        phone: String(customerPhone).trim(),
        notes: String(notes || "").trim() || "Réservation manuelle ajoutée par le salon.",
      },
      service: {
        id: service.id || service._id.toString(),
        name: service.name,
        price,
        duration,
        depositAmount,
      },
      selectedOptions: sanitizedOptions,
      date,
      startTime,
      endTime,
      totalDuration: duration,
      totalPrice: price,
      depositAmount,
      remainingBalance,
      status,
      paidDepositAt: status === "CONFIRMED" ? new Date().toISOString() : null,
    });

    revalidateBookingRoutes();

    return NextResponse.json({
      success: true,
      message: "Rendez-vous ajouté avec succès au planning.",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Erreur création manuelle:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
