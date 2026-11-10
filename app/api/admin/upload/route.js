import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// GET: Génère une signature sécurisée pour permettre l'envoi direct depuis le navigateur vers Cloudinary (supporte les vidéos volumineuses sans limite de taille Vercel)
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "ydm-coiffure";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "r94h9y8JZOg9w_2Gb5viVRSV3t4";
    const apiKey = process.env.CLOUDINARY_API_KEY || "638433529399836";
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dvecpg1tz";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Impossible de générer la signature Cloudinary : " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload buffer to Cloudinary with automatic optimization
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ydm-coiffure",
          resource_type: "auto",
          quality: "auto:good",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { success: false, error: "Échec de l'envoi sur Cloudinary : " + error.message },
      { status: 500 }
    );
  }
}
