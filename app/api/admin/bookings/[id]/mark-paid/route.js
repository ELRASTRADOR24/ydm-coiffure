import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
} from "@/lib/store";
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

    const updated = await updateBooking(id, {
      status: "CONFIRMED",
      paidDepositAt: new Date().toISOString(),
      holdExpiresAt: null,
      depositRejectedAt: null,
      depositRejectionReason: "",
      stripePaymentIntentId: "manual_cash_or_transfer",
    });

    const settings = await getSettings();
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
