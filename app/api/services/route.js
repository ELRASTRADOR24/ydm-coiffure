import { NextResponse } from "next/server";
import { getServices } from "@/lib/store";

export async function GET() {
  try {
    const services = await getServices(true);
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("Erreur lors de la récupération des prestations:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de charger les prestations." },
      { status: 500 }
    );
  }
}
