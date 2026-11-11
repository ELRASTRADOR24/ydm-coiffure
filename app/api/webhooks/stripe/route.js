import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Paiement Stripe non utilisé : les acomptes sont réglés en direct via Wero, Revolut ou PayPal.",
    },
    { status: 410 }
  );
}
