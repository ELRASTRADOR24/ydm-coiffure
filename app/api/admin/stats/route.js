import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBookings } from "@/lib/store";
import { getParisDateString } from "@/lib/adminHelpers";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const allBookings = await getBookings();
    const todayStr = getParisDateString();

    const todayBookings = allBookings.filter(
      (b) => b.date === todayStr && b.status === "CONFIRMED"
    );

    const pendingApprovals = allBookings.filter(
      (b) => b.status === "PENDING_APPROVAL"
    );

    const pendingPayments = allBookings.filter(
      (b) => b.status === "PENDING_PAYMENT"
    );

    const confirmedBookings = allBookings.filter(
      (b) => b.status === "CONFIRMED"
    );

    const totalDepositsCollected = confirmedBookings.reduce(
      (sum, b) => sum + (b.depositAmount || 0),
      0
    );

    const totalExpectedRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );

    // Prochains rendez-vous (futurs, triés par date et heure)
    const upcomingBookings = allBookings
      .filter((b) => b.date >= todayStr && b.status !== "CANCELLED" && b.status !== "REJECTED")
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      stats: {
        todayCount: todayBookings.length,
        pendingApprovalsCount: pendingApprovals.length,
        pendingPaymentsCount: pendingPayments.length,
        confirmedCount: confirmedBookings.length,
        totalDepositsCollected,
        totalExpectedRevenue,
        upcomingBookings,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
