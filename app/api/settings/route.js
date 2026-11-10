import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { buildPublicSettings } from "@/lib/siteContent";
import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    const publicSettings = buildPublicSettings(
      settings,
      DEFAULT_SALON_SETTINGS.galleryItems
    );

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
