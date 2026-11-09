import { NextResponse } from "next/server";
import { getBookingByReference, updateBooking } from "@/lib/store";
import { sendDepositDeclaredAdminSms } from "@/lib/sms";

export async function POST(request, { params }) {
  try {
    const { reference } = await params;
    const body = await request.json().catch(() => ({}));
    const method = body.method || "Wero / Revolut / PayPal";

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
        message: "Cet acompte est déjà confirmé.",
        booking,
      });
    }

    const updated = await updateBooking(booking.id || booking._id, {
      depositDeclared: true,
      depositDeclaredMethod: method,
      depositDeclaredAt: new Date().toISOString(),
    });

    // Envoyer SMS d'alerte immédiat à la coiffeuse
    try {
      await sendDepositDeclaredAdminSms(updated || booking, method);
    } catch (e) {
      console.warn("Erreur envoi SMS admin déclaration:", e.message);
    }

    return NextResponse.json({
      success: true,
      message: "Déclaration d'acompte transmise à la coiffeuse.",
      booking: updated,
    });
  } catch (error) {
    console.error("Erreur déclaration acompte:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
