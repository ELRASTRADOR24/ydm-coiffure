import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getAvailabilities, updateAvailability } from "@/lib/store";
import { isValidTimeString } from "@/lib/adminHelpers";
import { timeToMinutes } from "@/lib/availabilityEngine";

function revalidateAvailabilityRoutes() {
  revalidatePath("/");
  revalidatePath("/reserver");
  revalidatePath("/admin");
  revalidatePath("/admin/availability");
  revalidatePath("/admin/calendar");
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const availabilities = await getAvailabilities();
  return NextResponse.json(
    { success: true, availabilities },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      dayOfWeek,
      _id,
      id,
      __v,
      createdAt,
      updatedAt,
      ...rest
    } = body || {};

    if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: "Jour de la semaine requis (0-6)." },
        { status: 400 }
      );
    }

    if (rest.isOpen !== false) {
      if (!isValidTimeString(rest.startTime) || !isValidTimeString(rest.endTime)) {
        return NextResponse.json(
          { success: false, error: "Veuillez saisir des horaires valides (HH:mm)." },
          { status: 400 }
        );
      }
      if (timeToMinutes(rest.startTime) >= timeToMinutes(rest.endTime)) {
        return NextResponse.json(
          {
            success: false,
            error: "L'heure de fermeture doit être postérieure à l'heure d'ouverture.",
          },
          { status: 400 }
        );
      }
    }

    if (rest.breaks !== undefined) {
      if (!Array.isArray(rest.breaks)) {
        return NextResponse.json(
          { success: false, error: "Format des pauses invalide." },
          { status: 400 }
        );
      }
      const sanitizedBreaks = [];
      for (const brk of rest.breaks) {
        if (!brk || !isValidTimeString(brk.start) || !isValidTimeString(brk.end)) {
          return NextResponse.json(
            {
              success: false,
              error: "Veuillez saisir des horaires de pause valides (HH:mm).",
            },
            { status: 400 }
          );
        }
        const bStart = timeToMinutes(brk.start);
        const bEnd = timeToMinutes(brk.end);
        if (bStart >= bEnd) {
          return NextResponse.json(
            {
              success: false,
              error: "La fin de la pause doit être postérieure au début de la pause.",
            },
            { status: 400 }
          );
        }
        if (
          rest.isOpen !== false &&
          (bStart < timeToMinutes(rest.startTime) || bEnd > timeToMinutes(rest.endTime))
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "La pause doit être comprise dans les horaires d'ouverture.",
            },
            { status: 400 }
          );
        }
        sanitizedBreaks.push({
          start: brk.start,
          end: brk.end,
          label: String(brk.label || "Pause déjeuner").trim() || "Pause déjeuner",
        });
      }
      rest.breaks = sanitizedBreaks;
    }

    const updated = await updateAvailability(dayOfWeek, rest);
    revalidateAvailabilityRoutes();
    return NextResponse.json({ success: true, availability: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
