import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBookings } from "@/lib/store";
import {
  normalizeBookingStatus,
  matchesBookingStatusFilter,
} from "@/lib/adminHelpers";

export async function GET(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase();

    const rawBookings = await getBookings({ date });
    let bookings = rawBookings.map((b) => normalizeBookingStatus(b));

    if (status && status !== "ALL") {
      bookings = bookings.filter((b) =>
        matchesBookingStatusFilter(b.status, status)
      );
    }

    if (search) {
      bookings = bookings.filter((b) => {
        const fullName = `${b.customer?.firstName} ${b.customer?.lastName}`.toLowerCase();
        const ref = (b.bookingReference || "").toLowerCase();
        const email = (b.customer?.email || "").toLowerCase();
        const phone = (b.customer?.phone || "").toLowerCase();
        return (
          fullName.includes(search) ||
          ref.includes(search) ||
          email.includes(search) ||
          phone.includes(search)
        );
      });
    }

    return NextResponse.json(
      { success: true, bookings },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Erreur récupération réservations admin:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de charger les réservations." },
      { status: 500 }
    );
  }
}
