import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  getBookingByReference,
  updateBooking,
  getSettings,
} from "@/lib/store";
import { sendBookingConfirmedEmail, sendBookingExpiredEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (stripe && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
      } catch (err) {
        console.error("Signature Webhook Stripe invalide:", err.message);
        return NextResponse.json(
          { error: `Webhook Error: ${err.message}` },
          { status: 400 }
        );
      }
    } else {
      // Si test sans signature (par exemple simulation payload JSON)
      try {
        event = JSON.parse(bodyText);
      } catch (e) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }

    // Gestion des événements Stripe
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const ref =
          session.client_reference_id || session.metadata?.bookingReference;

        if (ref) {
          const booking = await getBookingByReference(ref);
          if (booking) {
            // Idempotence : si déjà confirmé, on ne renvoie pas d'e-mail
            if (booking.status === "CONFIRMED") {
              return NextResponse.json({ received: true });
            }

            const updatedBooking = await updateBooking(booking.id || booking._id, {
              status: "CONFIRMED",
              paidDepositAt: new Date().toISOString(),
              stripePaymentIntentId: session.payment_intent,
            });

            const settings = await getSettings();
            await sendBookingConfirmedEmail(updatedBooking || booking, settings);
            console.log(`[STRIPE] Réservation ${ref} confirmée avec succès !`);
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const ref =
          session.client_reference_id || session.metadata?.bookingReference;

        if (ref) {
          const booking = await getBookingByReference(ref);
          if (booking && booking.status === "PENDING_PAYMENT") {
            const updatedBooking = await updateBooking(booking.id || booking._id, {
              status: "EXPIRED",
            });
            await sendBookingExpiredEmail(updatedBooking || booking);
            console.log(`[STRIPE] Session expirée pour la réservation ${ref}.`);
          }
        }
        break;
      }

      default:
        console.log(`Événement Stripe non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur traitement Webhook Stripe:", error);
    return NextResponse.json(
      { error: "Erreur interne lors du traitement du webhook" },
      { status: 500 }
    );
  }
}
