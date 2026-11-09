import { NextResponse } from "next/server";
import { getServiceBySlug } from "@/lib/store";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const service = await getServiceBySlug(slug);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Prestation non trouvée." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
