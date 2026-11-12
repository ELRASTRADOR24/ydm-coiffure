import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBookingById,
  updateBooking,
  getSettings,
  adjustCustomerStats,
} from "@/lib/store";
import { buildUnvalidateBookingTransition } from "@/lib/adminHelpers";
import { createDepositCheckoutSession } from "@/lib/stripe";

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

    const settings = await getSettings();
    const transition = buildUnvalidateBookingTransition(booking, {
      targetStatus: body.targetStatus,
      paymentHoldHours: settings?.paymentHoldHours || 2,
    });

    if (!transition.allowed) {
      return NextResponse.json(
        { success: false, error: transition.error },
        { status: 409 }
      );
    }

    const patch = { ...transition.patch };
    if (transition.needsCheckoutUrl) {
      const checkoutSession = await createDepositCheckoutSession({
        booking,
        request,
      });
      patch.stripePaymentUrl = checkoutSession.url;
      patch.stripeSessionId = checkoutSession.id;
    }

    const updated = await updateBooking(id, patch);

    if (transition.shouldRollbackStats) {
      await adjustCustomerStats(
        booking.customer,
        -1,
        -(Number(booking.totalPrice) || 0),
        { updateLastBookingAt: false }
      );
    }

    const ref = updated?.bookingReference || booking.bookingReference;
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    if (transition.shouldRollbackStats) {
      revalidatePath("/admin/customers");
    }
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${ref}`);

    return NextResponse.json({
      success: true,
      message: transition.message,
      booking: updated,
    });
  } catch (error) {
    console.error("Erreur dévalidation réservation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
