import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getServices, createService } from "@/lib/store";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const services = await getServices(false); // get all including inactive
  return NextResponse.json({ success: true, services });
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.duration) {
      return NextResponse.json(
        { success: false, error: "Nom, prix et durée sont requis." },
        { status: 400 }
      );
    }

    const slug = slugify(body.name);
    const newService = await createService({
      ...body,
      slug,
      depositAmount: body.depositAmount ?? Math.round(body.price * 0.25),
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
