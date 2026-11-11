/**
 * Optimise une URL Cloudinary pour garantir une diffusion légère et fluide
 * (transcodage MP4 H.264/VC auto max 1080p pour les vidéos, WebP/AVIF auto max 1600px pour les images).
 */
export function optimizeCloudinaryMediaUrl(url, isVideo = false) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // Ne pas dupliquer si une transformation est déjà appliquée
  const [prefix, rest] = url.split("/upload/");
  if (!rest) return url;
  const firstSegment = rest.split("/")[0] || "";
  const alreadyTransformed =
    firstSegment.includes("q_auto") ||
    firstSegment.includes("f_auto") ||
    firstSegment.includes("vc_auto") ||
    firstSegment.includes("c_limit");

  if (alreadyTransformed) {
    return isVideo ? url.replace(/\.[^/.?#]+(\?.*)?$/, ".mp4$1") : url;
  }

  if (isVideo) {
    const cleanRest = rest.replace(/\.[^/.?#]+(\?.*)?$/, ".mp4$1");
    return `${prefix}/upload/c_limit,w_1080/q_auto:good,vc_auto/${cleanRest}`;
  }

  return `${prefix}/upload/c_limit,w_1600/f_auto,q_auto:good/${rest}`;
}

/**
 * Génère la vignette JPG optimisée (première image) d'une vidéo Cloudinary.
 */
export function buildCloudinaryVideoThumbnail(url) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url.replace(/\.[^/.?#]+(\?.*)?$/, ".jpg$1");
  }

  const [prefix, rest] = url.split("/upload/");
  if (!rest) return url.replace(/\.[^/.?#]+(\?.*)?$/, ".jpg$1");

  // Enlever d'éventuelles transformations vidéo existantes avant de reconstruire la vignette JPG
  const versionMatch = rest.match(/(?:^|\/)(v\d+\/.+)$/);
  const tail = versionMatch ? versionMatch[1] : rest;
  const jpgTail = tail.replace(/\.[^/.?#]+(\?.*)?$/, ".jpg$1");

  return `${prefix}/upload/c_limit,q_auto,so_0,w_900/${jpgTail}`;
}

export function isVideoFilenameOrUrl(input = "") {
  if (!input || typeof input !== "string") return false;
  return (
    input.includes("/video/upload/") ||
    /\.(mp4|mov|m4v|webm|avi|3gp)(\?.*)?$/i.test(input.trim())
  );
}

export function cleanMediaTitleFromFilename(filename = "", fallback = "Nouvelle réalisation") {
  if (!filename || typeof filename !== "string") return fallback;
  const cleaned = filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

/**
 * Résout l'URL d'affiche / miniature pour un élément de galerie.
 * Évite qu'un item vidéo sans image explicite ne fasse planter <Image src="" />.
 */
export function resolveGalleryPosterUrl(item) {
  const rawImg = typeof item?.image === "string" ? item.image.trim() : "";
  if (rawImg) return rawImg;
  const rawVid =
    typeof item?.videoUrl === "string"
      ? item.videoUrl.trim()
      : typeof item?.video === "string"
      ? item.video.trim()
      : "";
  if (rawVid && rawVid.includes("res.cloudinary.com") && rawVid.includes("/upload/")) {
    return buildCloudinaryVideoThumbnail(rawVid);
  }
  return "";
}

/**
 * Indique si une URL d'image est compatible avec <Image /> de Next.js (domains autorisés dans next.config.mjs).
 */
export function canUseNextImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "res.cloudinary.com" || parsed.hostname === "images.unsplash.com")
    );
  } catch {
    return false;
  }
}

const STANDARD_GALLERY_CATEGORIES = [
  "Knotless",
  "French Curls",
  "Fulani",
  "Boho Braids",
  "Vanilles",
  "Nattes collées",
  "Cornrows",
  "Soft Locs",
];

/**
 * Retourne les filtres de la galerie publique en incluant toute nouvelle catégorie créée par l'admin.
 */
export function extractGalleryFilterCategories(items = []) {
  const visibleItems = Array.isArray(items)
    ? items.filter((item) => item && item.visible !== false)
    : [];

  const filters = [
    { key: "ALL", label: "Toutes", count: visibleItems.length },
  ];

  const videoCount = visibleItems.filter((m) => m.type === "video").length;
  if (videoCount > 0) {
    filters.push({ key: "VIDEO", label: "Vidéos", isType: true, count: videoCount });
  }

  const photoCount = visibleItems.filter((m) => m.type !== "video").length;
  if (photoCount > 0) {
    filters.push({ key: "PHOTO", label: "Photos", isType: true, count: photoCount });
  }

  const countsByCategory = new Map();
  for (const item of visibleItems) {
    const cat = typeof item?.category === "string" ? item.category.trim() : "";
    if (!cat) continue;
    countsByCategory.set(cat, (countsByCategory.get(cat) || 0) + 1);
  }

  const added = new Set();
  for (const stdCat of STANDARD_GALLERY_CATEGORIES) {
    const c = countsByCategory.get(stdCat) || 0;
    if (c > 0) {
      filters.push({ key: stdCat, label: stdCat, count: c });
      added.add(stdCat);
    }
  }

  for (const [cat, c] of countsByCategory.entries()) {
    if (!added.has(cat) && c > 0) {
      filters.push({ key: cat, label: cat, count: c });
    }
  }

  return filters;
}

function formatUploadedResult(cloudData, file) {
  const isVideo =
    cloudData.resource_type === "video" ||
    Boolean(file?.type?.startsWith("video/")) ||
    isVideoFilenameOrUrl(file?.name || "");
  const rawUrl = cloudData.secure_url || cloudData.url;
  const optimizedUrl = optimizeCloudinaryMediaUrl(rawUrl, isVideo);
  const thumbnailUrl = isVideo
    ? buildCloudinaryVideoThumbnail(rawUrl)
    : optimizedUrl;

  return {
    success: true,
    url: optimizedUrl,
    rawUrl,
    thumbnailUrl,
    isVideo,
    resourceType: cloudData.resource_type,
    format: isVideo ? "mp4" : cloudData.format,
    publicId: cloudData.public_id,
    bytes: cloudData.bytes,
  };
}

function uploadWithXhrProgress(endpoint, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      try {
        const parsed = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          if (typeof onProgress === "function") onProgress(100);
          resolve(parsed);
        } else {
          reject(
            new Error(parsed?.error?.message || parsed?.error || "Erreur Cloudinary")
          );
        }
      } catch (_) {
        reject(new Error("Réponse invalide lors de l'envoi sur Cloudinary."));
      }
    };

    xhr.onerror = () => reject(new Error("Erreur réseau pendant le téléversement."));
    xhr.send(formData);
  });
}

/**
 * Téléversement de fichiers vidéo ou image vers Cloudinary depuis le navigateur.
 * Utilise la signature directe pour supporter de gros fichiers (vidéos HD/4K) sans blocage Vercel,
 * puis applique automatiquement les transformations d'allègement et de fluidité Cloudinary.
 */
export async function uploadMediaClient(file, options = {}) {
  if (!file) throw new Error("Aucun fichier sélectionné.");
  const { onProgress } = options || {};

  // 1. Téléversement direct signé vers l'API Cloudinary (avec suivi de progression)
  let directErrorMessage = "";
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

      const endpoint = `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`;
      const cloudData =
        typeof XMLHttpRequest !== "undefined"
          ? await uploadWithXhrProgress(endpoint, formData, onProgress)
          : await (await fetch(endpoint, { method: "POST", body: formData })).json();

      if (cloudData.secure_url) {
        return formatUploadedResult(cloudData, file);
      } else if (cloudData.error) {
        throw new Error(cloudData.error.message || "Erreur Cloudinary");
      }
    }
  } catch (directErr) {
    directErrorMessage = directErr?.message || "";
    console.warn("Direct upload fallback:", directErr);
  }

  // 2. Repli serveur via /api/admin/upload
  const fallbackData = new FormData();
  fallbackData.append("file", file);
  const serverRes = await fetch("/api/admin/upload", {
    method: "POST",
    body: fallbackData,
  });
  let serverResult = {};
  try {
    serverResult = await serverRes.json();
  } catch {
    if (serverRes.status === 413) {
      throw new Error(
        "Vidéo trop volumineuse pour l'envoi de secours (> 4,5 Mo)." +
          (directErrorMessage ? ` Détail Cloudinary : ${directErrorMessage}` : "")
      );
    }
    throw new Error(
      directErrorMessage || "Échec de l'envoi sur Cloudinary."
    );
  }
  if (!serverResult.success) {
    throw new Error(
      serverResult.error || directErrorMessage || "Échec de l'envoi sur Cloudinary."
    );
  }

  if (typeof onProgress === "function") onProgress(100);

  return formatUploadedResult(
    {
      secure_url: serverResult.url,
      resource_type: serverResult.resourceType,
      format: serverResult.format,
      public_id: serverResult.publicId,
    },
    file
  );
}
