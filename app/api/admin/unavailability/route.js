import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getUnavailabilities, addUnavailability } from "@/lib/store";
import {
  expandDateRangeInclusive,
  isValidDateString,
  isValidTimeString,
} from "@/lib/adminHelpers";
import { timeToMinutes } from "@/lib/availabilityEngine";

function revalidateUnavailabilityRoutes() {
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

  const list = await getUnavailabilities();
  return NextResponse.json(
    { success: true, unavailabilities: list },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Récupérer la liste des dates à bloquer (soit dates directes, soit plage startDate -> endDate, soit date unique)
    const datesToBlock = [];

    if (Array.isArray(body.dates) && body.dates.length > 0) {
      for (const d of body.dates) {
        if (!isValidDateString(d)) {
          return NextResponse.json(
            { success: false, error: "Une date de la sélection est invalide." },
            { status: 400 }
          );
        }
        datesToBlock.push(d);
      }
    } else if (body.startDate && body.endDate) {
      const expanded = expandDateRangeInclusive(body.startDate, body.endDate);
      if (expanded.error) {
        return NextResponse.json(
          { success: false, error: expanded.error },
          { status: 400 }
        );
      }
      datesToBlock.push(...expanded.dates);
    } else if (body.date) {
      if (!isValidDateString(body.date)) {
        return NextResponse.json(
          { success: false, error: "Format de date invalide (attendu : AAAA-MM-JJ)." },
          { status: 400 }
        );
      }
      datesToBlock.push(body.date);
    }

    if (datesToBlock.length === 0) {
      return NextResponse.json(
        { success: false, error: "Au moins une date ou une plage est requise." },
        { status: 400 }
      );
    }

    const isAllDay = body.isAllDay ?? true;
    const startTime = !isAllDay ? body.startTime || "09:00" : null;
    const endTime = !isAllDay ? body.endTime || "19:00" : null;

    if (!isAllDay) {
      if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
        return NextResponse.json(
          { success: false, error: "Veuillez saisir des horaires valides (HH:mm)." },
          { status: 400 }
        );
      }
      if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        return NextResponse.json(
          {
            success: false,
            error: "L'heure de fin doit être postérieure à l'heure de début.",
          },
          { status: 400 }
        );
      }
    }

    const reason =
      String(body.reason || "").trim() || "Indisponibilité exceptionnelle";

    const createdList = [];
    for (const d of datesToBlock) {
      const created = await addUnavailability({
        date: d,
        isAllDay,
        startTime,
        endTime,
        reason,
      });
      createdList.push(created);
    }

    revalidateUnavailabilityRoutes();

    return NextResponse.json({
      success: true,
      unavailabilities: createdList,
      unavailability: createdList[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
