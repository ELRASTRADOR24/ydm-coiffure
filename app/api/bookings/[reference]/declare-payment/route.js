import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getBookingByReference,
  updateBooking,
  getSettings,
} from "@/lib/store";
import { sendDepositDeclaredAdminSms } from "@/lib/sms";

export async function POST(request, { params }) {
  try {
    const { reference } = await params;
    const body = await request.json().catch(() => ({}));
    const method = String(body.method || "Wero / Revolut / PayPal").trim();

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

    if (["CANCELLED", "REJECTED", "EXPIRED"].includes(booking.status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ce dossier n'est plus actif (annulé, refusé ou expiré). Veuillez sélectionner un nouveau créneau.",
        },
        { status: 409 }
      );
    }

    if (booking.status === "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Votre demande est en cours de validation par la coiffeuse. Veuillez patienter avant de verser l'acompte.",
        },
        { status: 409 }
      );
    }

    if (
      booking.status === "PENDING_PAYMENT" &&
      !booking.depositDeclared &&
      booking.holdExpiresAt &&
      new Date(booking.holdExpiresAt).getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le délai de blocage de votre créneau est expiré. Veuillez sélectionner un nouveau créneau en ligne.",
        },
        { status: 409 }
      );
    }

    const wasAlreadyDeclared = Boolean(booking.depositDeclared);

    // Pause officielle du compte à rebours : holdExpiresAt effacé et créneau maintenu bloqué
    const updated = await updateBooking(booking.id || booking._id, {
      depositDeclared: true,
      depositDeclaredMethod: method,
      depositDeclaredAt: booking.depositDeclaredAt || new Date().toISOString(),
      holdExpiresAt: null,
    });

    if (!wasAlreadyDeclared) {
      try {
        const settings = await getSettings();
        await sendDepositDeclaredAdminSms(
          updated || booking,
          method,
          settings?.phone
        );
      } catch (e) {
        console.warn("Erreur envoi SMS admin déclaration:", e.message);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");
    revalidatePath(`/reserver/statut/${reference}`);

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
