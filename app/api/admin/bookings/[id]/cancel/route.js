import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
  adjustCustomerStats,
} from "@/lib/store";
import { getEffectiveBookingStatus } from "@/lib/adminHelpers";
import { sendBookingCancelledCustomerEmail } from "@/lib/email";
import { sendBookingCancelledSms } from "@/lib/sms";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Annulation à la demande de la cliente ou du salon.";

    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const effectiveStatus = getEffectiveBookingStatus(booking);
    if (["CANCELLED", "REJECTED", "EXPIRED"].includes(effectiveStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Cette réservation est déjà annulée, refusée ou expirée.",
        },
        { status: 409 }
      );
    }

    const wasConfirmed = booking.status === "CONFIRMED";

    const updated = await updateBooking(id, {
      status: "CANCELLED",
      cancellationReason: reason,
      holdExpiresAt: null,
    });

    if (wasConfirmed) {
      await adjustCustomerStats(
        booking.customer,
        -1,
        -(Number(booking.totalPrice) || 0),
        { updateLastBookingAt: false }
      );
    }

    const settings = await getSettings();
    try {
      await Promise.allSettled([
        sendBookingCancelledCustomerEmail(updated || booking, reason, settings, { request }),
        sendBookingCancelledSms(updated || booking, reason),
      ]);
    } catch (e) {
      console.warn("Erreur notification annulation (email/SMS):", e.message);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/customers");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${updated?.bookingReference || booking.bookingReference}`);

    return NextResponse.json({
      success: true,
      message: "Réservation annulée et créneau libéré.",
      booking: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
