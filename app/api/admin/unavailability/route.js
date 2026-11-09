import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getUnavailabilities, addUnavailability } from "@/lib/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const list = await getUnavailabilities();
  return NextResponse.json({ success: true, unavailabilities: list });
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
      datesToBlock.push(...body.dates);
    } else if (body.startDate && body.endDate) {
      // Générer tous les jours entre startDate et endDate inclus
      const start = new Date(body.startDate);
      const end = new Date(body.endDate);
      const curr = new Date(start);
      while (curr <= end) {
        datesToBlock.push(curr.toISOString().slice(0, 10));
        curr.setDate(curr.getDate() + 1);
      }
    } else if (body.date) {
      datesToBlock.push(body.date);
    }

    if (datesToBlock.length === 0) {
      return NextResponse.json(
        { success: false, error: "Au moins une date ou une plage est requise." },
        { status: 400 }
      );
    }

    const createdList = [];
    const isAllDay = body.isAllDay ?? true;
    const startTime = !isAllDay ? (body.startTime || "09:00") : null;
    const endTime = !isAllDay ? (body.endTime || "19:00") : null;
    const reason = body.reason || "Indisponibilité exceptionnelle";

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
