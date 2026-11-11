import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { updateService, deleteService, getServiceById, getServices } from "@/lib/store";
import { slugify } from "@/lib/utils";
import {
  normalizeServiceServerPayload,
  inferIncludesHairFromCategory,
} from "@/lib/servicePricing";
import { ensureUniqueServiceSlug } from "@/lib/adminHelpers";

function revalidateServicePages() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/prestations");
  revalidatePath("/reserver");
  revalidatePath("/admin");
  revalidatePath("/admin/services");
  revalidatePath("/admin/calendar");
}

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await getServiceById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Prestation introuvable." },
        { status: 404 }
      );
    }

    const normalized = normalizeServiceServerPayload(body, existing);

    if (normalized.name) {
      normalized.name = String(normalized.name).trim();
      const allServices = await getServices(false);
      normalized.slug = ensureUniqueServiceSlug(
        slugify(normalized.name),
        allServices,
        id
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(normalized, "category") &&
      !Object.prototype.hasOwnProperty.call(normalized, "includesHair")
    ) {
      normalized.includesHair = inferIncludesHairFromCategory(
        normalized.category,
        existing.includesHair
      );
    }

    const updated = await updateService(id, normalized);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Prestation introuvable." },
        { status: 404 }
      );
    }

    revalidateServicePages();

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
    revalidateServicePages();
    return NextResponse.json({ success: true, message: "Prestation supprimée." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
