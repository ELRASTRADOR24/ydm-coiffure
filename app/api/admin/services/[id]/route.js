import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { updateService, deleteService, getServiceById } from "@/lib/store";
import { slugify } from "@/lib/utils";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.name) {
      body.slug = slugify(body.name);
    }

    const updated = await updateService(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Prestation introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteService(id);
    return NextResponse.json({ success: true, message: "Prestation supprimée." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
