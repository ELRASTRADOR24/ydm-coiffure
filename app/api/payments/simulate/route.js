import { NextResponse } from "next/server";
import {
  getBookingByReference,
  updateBooking,
  getSettings,
} from "@/lib/store";
import { sendBookingConfirmedEmail } from "@/lib/email";

export async function POST(request) {
  const allowSimulation =
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_PAYMENT_SIMULATION === "true";

  if (!allowSimulation) {
    return NextResponse.json(
      {
        success: false,
        error:
          "La simulation de paiement est désactivée. Veuillez régler votre acompte en direct via les moyens officiels (Wero, Revolut ou PayPal).",
      },
      { status: 403 }
    );
  }

  try {
    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Référence requise." },
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

    if (booking.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        message: "Réservation déjà confirmée.",
        booking,
      });
    }

    const updatedBooking = await updateBooking(booking.id || booking._id, {
      status: "CONFIRMED",
      paidDepositAt: new Date().toISOString(),
      stripePaymentIntentId: `pi_simulated_${Date.now()}`,
    });

    const settings = await getSettings();
    await sendBookingConfirmedEmail(updatedBooking || booking, settings);

    return NextResponse.json({
      success: true,
      message: "Paiement simulé avec succès. Réservation confirmée !",
      booking: updatedBooking,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
