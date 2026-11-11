import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { deleteUnavailability } from "@/lib/store";

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteUnavailability(id);
    revalidatePath("/");
    revalidatePath("/reserver");
    revalidatePath("/admin");
    revalidatePath("/admin/availability");
    revalidatePath("/admin/calendar");
    return NextResponse.json({ success: true, message: "Indisponibilité supprimée." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
