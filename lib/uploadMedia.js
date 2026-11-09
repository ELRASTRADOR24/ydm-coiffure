/**
 * Téléversement de fichiers vidéo ou image vers Cloudinary depuis le navigateur.
 * Utilise la signature directe pour supporter de gros fichiers (vidéos HD/4K) sans blocage Vercel.
 */
export async function uploadMediaClient(file) {
  if (!file) throw new Error("Aucun fichier sélectionné.");

  // 1. Téléversement direct signé vers l'API Cloudinary
  try {
    const signRes = await fetch("/api/admin/upload");
    const signData = await signRes.json();

    if (signData.success && signData.signature) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        const isVideo =
          cloudData.resource_type === "video" || file.type.startsWith("video/");
        const url = cloudData.secure_url;
        const thumbnailUrl = isVideo
          ? url.replace(/\.[^/.]+$/, ".jpg")
          : url;

        return {
          success: true,
          url,
          thumbnailUrl,
          isVideo,
          resourceType: cloudData.resource_type,
          format: cloudData.format,
          publicId: cloudData.public_id,
        };
      } else if (cloudData.error) {
        throw new Error(cloudData.error.message || "Erreur Cloudinary");
      }
    }
  } catch (directErr) {
    console.warn("Direct upload fallback:", directErr);
  }

  // 2. Repli serveur via /api/admin/upload
  const fallbackData = new FormData();
  fallbackData.append("file", file);
  const serverRes = await fetch("/api/admin/upload", {
    method: "POST",
    body: fallbackData,
  });
  const serverResult = await serverRes.json();
  if (!serverResult.success) {
    throw new Error(serverResult.error || "Échec de l'envoi sur Cloudinary.");
  }

  const isVideo =
    serverResult.resourceType === "video" || file.type.startsWith("video/");
  const url = serverResult.url;
  const thumbnailUrl = isVideo ? url.replace(/\.[^/.]+$/, ".jpg") : url;

  return {
    success: true,
    url,
    thumbnailUrl,
    isVideo,
    resourceType: serverResult.resourceType,
    format: serverResult.format,
    publicId: serverResult.publicId,
  };
}
