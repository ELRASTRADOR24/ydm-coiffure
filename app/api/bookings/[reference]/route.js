import { NextResponse } from "next/server";
import { getBookingByReference } from "@/lib/store";
import { normalizeBookingPaymentUrl } from "@/lib/appUrl";

export async function GET(request, { params }) {
  try {
    const { reference } = await params;
    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Référence manquante." },
        { status: 400 }
      );
    }

    const booking = await getBookingByReference(reference);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const resolvedPaymentUrl = booking.stripePaymentUrl
      ? normalizeBookingPaymentUrl(
          booking.stripePaymentUrl,
          booking.bookingReference,
          request
        )
      : undefined;

    // Retourne les données nécessaires au suivi client
    return NextResponse.json({
      success: true,
      booking: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalDuration: booking.totalDuration,
        totalPrice: booking.totalPrice,
        depositAmount: booking.depositAmount,
        remainingBalance: booking.remainingBalance,
        service: booking.service,
        selectedOptions: booking.selectedOptions,
        customerName: `${booking.customer.firstName}${booking.customer.lastName ? ` ${booking.customer.lastName.charAt(0)}.` : ""}`,
        holdExpiresAt: booking.holdExpiresAt,
        stripePaymentUrl: resolvedPaymentUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
