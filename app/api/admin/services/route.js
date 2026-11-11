import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getServices, createService } from "@/lib/store";
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

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const services = await getServices(false); // get all including inactive
  return NextResponse.json(
    { success: true, services },
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
    const duration = Number(body.duration) || 180;
    const rawName = String(body.name || "").trim();

    if (
      !rawName ||
      body.price === undefined ||
      body.price === null ||
      body.price === ""
    ) {
      return NextResponse.json(
        { success: false, error: "Nom et prix de base sont requis." },
        { status: 400 }
      );
    }

    const normalized = normalizeServiceServerPayload({
      ...body,
      name: rawName,
      duration,
    });

    const existingList = await getServices(false);
    const slug = ensureUniqueServiceSlug(slugify(rawName), existingList);
    const includesHair =
      typeof normalized.includesHair === "boolean"
        ? normalized.includesHair
        : inferIncludesHairFromCategory(normalized.category, false);

    const newService = await createService({
      ...normalized,
      slug,
      includesHair,
      depositAmount:
        normalized.depositAmount !== undefined ? normalized.depositAmount : 10,
      isActive: normalized.isActive ?? true,
    });

    revalidateServicePages();

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
