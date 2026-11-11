import { buildBookingStatusUrl } from "./appUrl.js";

// Stripe n'est pas utilisé : tous les acomptes sont réglés en direct via Wero, Revolut ou PayPal.
export const stripe = null;

export async function createDepositCheckoutSession({
  booking,
  request = null,
  appUrl = "",
}) {
  const statusUrl = buildBookingStatusUrl(
    booking?.bookingReference,
    request,
    appUrl
  );

  return {
    id: `direct_transfer_${Date.now()}`,
    url: statusUrl,
    simulated: false,
    directTransfer: true,
  };
}
