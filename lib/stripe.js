// Stripe n'est pas utilisé : tous les acomptes sont réglés en direct via Wero, Revolut ou PayPal.
export const stripe = null;

export async function createDepositCheckoutSession({ booking }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const statusUrl = `${appUrl}/reserver/statut/${booking.bookingReference}`;

  return {
    id: `direct_transfer_${Date.now()}`,
    url: statusUrl,
    simulated: false,
    directTransfer: true,
  };
}
