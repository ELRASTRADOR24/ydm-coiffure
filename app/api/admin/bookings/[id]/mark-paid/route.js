import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
  getBookings,
  getUnavailabilities,
  adjustCustomerStats,
} from "@/lib/store";
import {
  getEffectiveBookingStatus,
  findManualBookingConflict,
} from "@/lib/adminHelpers";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { sendBookingConfirmedSms } from "@/lib/sms";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    if (booking.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        message: "Cette réservation est déjà confirmée.",
        booking,
      });
    }

    const effectiveStatus = getEffectiveBookingStatus(booking);
    if (["CANCELLED", "REJECTED", "EXPIRED"].includes(effectiveStatus)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de valider l'acompte : cette réservation est expirée, refusée ou annulée.",
        },
        { status: 409 }
      );
    }

    if (effectiveStatus !== "PENDING_PAYMENT") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Veuillez d'abord accepter cette demande avant de confirmer la réception de l'acompte.",
        },
        { status: 400 }
      );
    }

    const [unavailabilities, existingBookings, settings] = await Promise.all([
      getUnavailabilities(),
      getBookings({ date: booking.date }),
      getSettings(),
    ]);

    const conflictCheck = findManualBookingConflict({
      date: booking.date,
      startTime: booking.startTime,
      duration: booking.totalDuration || booking.service?.duration || 60,
      existingBookings,
      unavailabilities,
      excludeBookingId: id,
    });

    if (conflictCheck.conflict) {
      return NextResponse.json(
        {
          success: false,
          error:
            conflictCheck.reason ||
            "Ce créneau chevauche un autre rendez-vous ou une indisponibilité.",
        },
        { status: 409 }
      );
    }

    const updated = await updateBooking(id, {
      status: "CONFIRMED",
      paidDepositAt: new Date().toISOString(),
      holdExpiresAt: null,
      depositRejectedAt: null,
      depositRejectionReason: "",
      stripePaymentIntentId: "manual_cash_or_transfer",
    });

    await adjustCustomerStats(
      updated?.customer || booking.customer,
      1,
      Number(updated?.totalPrice ?? booking.totalPrice) || 0,
      { updateLastBookingAt: true }
    );

    try {
      await Promise.allSettled([
        sendBookingConfirmedEmail(updated || booking, settings, { request }),
        sendBookingConfirmedSms(updated || booking),
      ]);
    } catch (e) {
      console.warn("Erreur notification confirmation (email/SMS):", e.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/customers");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${updated?.bookingReference || booking.bookingReference}`);

    return NextResponse.json({
      success: true,
      message: "Acompte marqué comme payé et réservation confirmée !",
      booking: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
