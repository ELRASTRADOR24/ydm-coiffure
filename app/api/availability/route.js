import { NextResponse } from "next/server";
import {
  getAvailabilities,
  getUnavailabilities,
  getBookings,
  getSettings,
} from "@/lib/store";
import { calculateAvailableSlots } from "@/lib/availabilityEngine";
import { isValidDateString } from "@/lib/adminHelpers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    // Mode pour récupérer les dates entièrement bloquées, jours fermés et règles d'avance
    if (mode === "blocked") {
      const [unavailabilities, weekly, settings] = await Promise.all([
        getUnavailabilities(),
        getAvailabilities(),
        getSettings(),
      ]);
      const blockedDates = unavailabilities
        .filter((u) => u.isAllDay)
        .map((u) => u.date);
      const closedDayOfWeeks = weekly
        .filter((w) => !w.isOpen)
        .map((w) => w.dayOfWeek);

      return NextResponse.json(
        {
          success: true,
          blockedDates,
          closedDayOfWeeks,
          maxDaysInAdvance: settings?.maxDaysInAdvance ?? 60,
          minNoticeHours: settings?.minNoticeHours ?? 24,
          paymentHoldHours: settings?.paymentHoldHours ?? 2,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const durationStr = searchParams.get("duration") || "60";

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: "La date est requise." },
        { status: 400 }
      );
    }

    if (!isValidDateString(dateStr)) {
      return NextResponse.json(
        { success: false, error: "Format de date invalide (attendu: YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    const totalDuration = parseInt(durationStr, 10);
    if (isNaN(totalDuration) || totalDuration <= 0) {
      return NextResponse.json(
        { success: false, error: "Durée invalide." },
        { status: 400 }
      );
    }

    const targetDate = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Dimanche, 1 = Lundi, ...

    const [availabilities, unavailabilities, existingBookings, settings] =
      await Promise.all([
        getAvailabilities(),
        getUnavailabilities(),
        getBookings({ date: dateStr }),
        getSettings(),
      ]);

    const weeklyAvailability = availabilities.find(
      (a) => a.dayOfWeek === dayOfWeek
    );

    const slots = calculateAvailableSlots({
      dateStr,
      totalDuration,
      weeklyAvailability,
      existingBookings,
      unavailabilities,
      settings,
      now: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        date: dateStr,
        slots,
        isOpen: weeklyAvailability ? weeklyAvailability.isOpen : false,
        totalDuration,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Erreur calcul disponibilités:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du calcul des créneaux." },
      { status: 500 }
    );
  }
}
