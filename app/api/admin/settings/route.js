import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const settings = await getSettings();
  return NextResponse.json(
    { success: true, settings },
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
    const updated = await updateSettings(body);
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/prestations");
    revalidatePath("/galerie");
    revalidatePath("/a-propos");
    revalidatePath("/contact");
    revalidatePath("/conditions-reservation");
    revalidatePath("/mentions-legales");
    revalidatePath("/politique-confidentialite");
    revalidatePath("/reserver");
    revalidatePath("/admin");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/site-editor");
    revalidatePath("/admin/emails");
    revalidatePath("/admin/availability");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/services");
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
