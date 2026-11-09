import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBookingById, updateBooking } from "@/lib/store";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Annulation à la demande de la cliente ou du salon.";

    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    const updated = await updateBooking(id, {
      status: "CANCELLED",
      cancellationReason: reason,
    });

    return NextResponse.json({
      success: true,
      message: "Réservation annulée et créneau libéré.",
      booking: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
