import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeSecretKey && !stripeSecretKey.includes("sk_test_51...")
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" })
  : null;

export async function createDepositCheckoutSession({
  booking,
  successUrl,
  cancelUrl,
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Mode simulation / fallback si Stripe n'est pas encore configuré
  if (!stripe) {
    const demoUrl = `${appUrl}/paiement/simulation?ref=${booking.bookingReference}&amount=${booking.depositAmount}`;
    return {
      id: `sim_session_${Date.now()}`,
      url: demoUrl,
      simulated: true,
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: booking.customer.email,
    client_reference_id: booking.bookingReference,
    metadata: {
      bookingId: booking._id ? booking._id.toString() : booking.id,
      bookingReference: booking.bookingReference,
    },
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(booking.depositAmount * 100), // En centimes
          product_data: {
            name: `Acompte — ${booking.service.name}`,
            description: `Réservation pour le ${booking.date} de ${booking.startTime} à ${booking.endTime}. Référence: ${booking.bookingReference}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url:
      successUrl ||
      `${appUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}&ref=${booking.bookingReference}`,
    cancel_url:
      cancelUrl ||
      `${appUrl}/paiement/annule?ref=${booking.bookingReference}`,
  });

  return session;
}
