import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
  getBookings,
  getUnavailabilities,
} from "@/lib/store";
import { findManualBookingConflict } from "@/lib/adminHelpers";
import { createDepositCheckoutSession } from "@/lib/stripe";
import { sendBookingApprovedPaymentEmail } from "@/lib/email";
import { sendBookingApprovedPaymentSms } from "@/lib/sms";

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

    if (booking.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          success: false,
          error: `Cette réservation est déjà au statut ${booking.status}.`,
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
            "Ce créneau chevauche désormais un autre rendez-vous ou une indisponibilité.",
        },
        { status: 409 }
      );
    }

    const holdHours = settings?.paymentHoldHours || 2; // Délai officiel strict de 2 heures
    const holdExpiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000);

    // Génération du lien direct de suivi & règlement d'acompte (Wero, Revolut, PayPal)
    const checkoutSession = await createDepositCheckoutSession({
      booking,
      request,
    });

    // Mise à jour de la réservation
    const updated = await updateBooking(id, {
      status: "PENDING_PAYMENT",
      holdExpiresAt: holdExpiresAt.toISOString(),
      stripeSessionId: checkoutSession.id,
      stripePaymentUrl: checkoutSession.url,
    });

    // Envoi de l'e-mail et du SMS avec le lien de paiement
    try {
      await Promise.allSettled([
        sendBookingApprovedPaymentEmail(
          updated || booking,
          checkoutSession.url,
          holdHours,
          settings,
          { request }
        ),
        sendBookingApprovedPaymentSms(
          updated || booking,
          checkoutSession.url,
          holdHours,
          { request }
        ),
      ]);
    } catch (e) {
      console.warn("Erreur envoi notification validation (email/SMS):", e.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${updated?.bookingReference || booking.bookingReference}`);

    return NextResponse.json({
      success: true,
      message: "Demande approuvée et lien de paiement envoyé à la cliente.",
      booking: updated,
    });
  } catch (error) {
    console.error("Erreur approbation réservation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
