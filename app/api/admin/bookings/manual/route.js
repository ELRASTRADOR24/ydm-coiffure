import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getServiceById,
  createBooking,
  getBookings,
  getAvailabilities,
  getUnavailabilities,
  getSettings,
} from "@/lib/store";
import {
  timeToMinutes,
  minutesToTime,
  isSpecificSlotAvailable,
} from "@/lib/availabilityEngine";

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
      status = "CONFIRMED",
    } = body;

    if (!serviceId || !date || !startTime || !customerFirstName || !customerPhone) {
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

    const duration = customDuration || service.duration;
    const price = customPrice !== undefined ? customPrice : service.price;
    const depositAmount = service.depositAmount || 0;
    const remainingBalance = Math.max(0, price - depositAmount);

    const startMin = timeToMinutes(startTime);
    const endMin = startMin + duration;
    const endTime = minutesToTime(endMin);

    // Contrôle facultatif de conflit
    const [availabilities, unavailabilities, existingBookings, settings] =
      await Promise.all([
        getAvailabilities(),
        getUnavailabilities(),
        getBookings({ date }),
        getSettings(),
      ]);

    const targetDate = new Date(`${date}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();
    const weeklyAvailability = availabilities.find((a) => a.dayOfWeek === dayOfWeek);

    const isAvailable = isSpecificSlotAvailable({
      dateStr: date,
      startTime,
      totalDuration: duration,
      weeklyAvailability,
      existingBookings,
      unavailabilities,
      settings,
      now: new Date(),
    });

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Attention : ce créneau chevauche un autre rendez-vous ou une pause. Choisissez un autre horaire.",
        },
        { status: 409 }
      );
    }

    const newBooking = await createBooking({
      customer: {
        firstName: customerFirstName,
        lastName: customerLastName || "",
        email: customerEmail || "client.manuel@ydm-coiffure.fr",
        phone: customerPhone,
        notes: notes || "Réservation manuelle ajoutée par le salon.",
      },
      service: {
        id: service.id || service._id.toString(),
        name: service.name,
        price,
        duration,
        depositAmount,
      },
      selectedOptions: [],
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
