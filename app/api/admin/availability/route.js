import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAvailabilities, updateAvailability } from "@/lib/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const availabilities = await getAvailabilities();
  return NextResponse.json({ success: true, availabilities });
}

export async function PUT(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dayOfWeek, ...data } = body;

    if (dayOfWeek === undefined) {
      return NextResponse.json(
        { success: false, error: "Jour de la semaine requis (0-6)." },
        { status: 400 }
      );
    }

    const updated = await updateAvailability(dayOfWeek, data);
    return NextResponse.json({ success: true, availability: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
