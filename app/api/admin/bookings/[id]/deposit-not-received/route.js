import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
} from "@/lib/store";
import { sendDepositNotReceivedCustomerEmail } from "@/lib/email";
import { sendDepositNotReceivedCustomerSms } from "@/lib/sms";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cette action est uniquement disponible pour un rendez-vous en attente d'acompte.",
        },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const holdHours = settings?.paymentHoldHours || 2;
    const holdExpiresAt = new Date(Date.now() + holdHours * 60 * 60 * 1000);
    const reasonText =
      String(body.reason || "").trim().slice(0, 300) ||
      "Acompte non encore reçu sur notre compte (Wero, Revolut ou PayPal). Merci de vérifier votre virement et de re-valider.";

    const updated = await updateBooking(id, {
      depositDeclared: false,
      depositDeclaredMethod: "",
      depositDeclaredAt: null,
      depositRejectedAt: new Date().toISOString(),
      depositRejectionReason: reasonText,
      holdExpiresAt: holdExpiresAt.toISOString(),
    });

    try {
      await Promise.allSettled([
        sendDepositNotReceivedCustomerEmail(
          updated || booking,
          reasonText,
          settings,
          { request }
        ),
        sendDepositNotReceivedCustomerSms(
          updated || booking,
          reasonText,
          { request }
        ),
      ]);
    } catch (e) {
      console.warn("Erreur notification acompte non reçu (email/SMS):", e.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${updated?.bookingReference || booking.bookingReference}`);

    return NextResponse.json({
      success: true,
      message: "Relance envoyée à la cliente : acompte indiqué comme non reçu.",
      booking: updated,
    });
  } catch (error) {
    console.error("Erreur signalement acompte non reçu:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
