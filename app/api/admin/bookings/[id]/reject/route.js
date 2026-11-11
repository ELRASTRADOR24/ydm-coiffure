import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getBookingById, updateBooking, getSettings } from "@/lib/store";
import { sendBookingRejectedEmail } from "@/lib/email";
import { sendBookingRejectedSms } from "@/lib/sms";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Créneau non disponible ou indisponibilité exceptionnelle.";

    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const updated = await updateBooking(id, {
      status: "REJECTED",
      rejectionReason: reason,
    });

    const settings = await getSettings();
    try {
      await Promise.allSettled([
        sendBookingRejectedEmail(updated || booking, reason, settings),
        sendBookingRejectedSms(updated || booking, reason),
      ]);
    } catch (e) {
      console.warn("Erreur envoi refus (email/SMS):", e.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${updated?.bookingReference || booking.bookingReference}`);

    return NextResponse.json({
      success: true,
      message: "Demande refusée et créneau libéré.",
      booking: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
