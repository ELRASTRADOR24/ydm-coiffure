import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/store";
import { isValidDateString } from "@/lib/adminHelpers";

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const dateStr = String(body.date || "").trim();
    const reopened = Boolean(body.reopened);

    if (!isValidDateString(dateStr)) {
      return NextResponse.json(
        { success: false, error: "Date invalide (format YYYY-MM-DD attendu)." },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const current = Array.isArray(settings?.reopenedDates)
      ? settings.reopenedDates
      : [];
    const nextReopenedDates = reopened
      ? Array.from(new Set([...current, dateStr])).sort()
      : current.filter((d) => d !== dateStr);

    const updated = await updateSettings({ reopenedDates: nextReopenedDates });

    revalidatePath("/admin/calendar");
    revalidatePath("/reserver");

    return NextResponse.json({
      success: true,
      reopenedDates: updated?.reopenedDates || nextReopenedDates,
      message: reopened
        ? "Journée réouverte aux réservations en ligne."
        : "Verrouillage automatique réactivé pour cette journée.",
    });
  } catch (error) {
    console.error("Erreur réouverture journée:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
