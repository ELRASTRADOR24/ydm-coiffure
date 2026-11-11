import test from "node:test";
import assert from "node:assert/strict";
import {
  optimizeCloudinaryMediaUrl,
  buildCloudinaryVideoThumbnail,
  isVideoFilenameOrUrl,
  cleanMediaTitleFromFilename,
  resolveGalleryPosterUrl,
  canUseNextImageUrl,
  extractGalleryFilterCategories,
} from "../lib/uploadMedia.js";

test("isVideoFilenameOrUrl detects common video extensions and Cloudinary video URLs", () => {
  assert.equal(isVideoFilenameOrUrl("IMG_4821.MOV"), true);
  assert.equal(isVideoFilenameOrUrl("coiffure.mp4?v=1"), true);
  assert.equal(isVideoFilenameOrUrl("clip.m4v"), true);
  assert.equal(
    isVideoFilenameOrUrl("https://res.cloudinary.com/demo/video/upload/v1/abc.mov"),
    true
  );
  assert.equal(isVideoFilenameOrUrl("photo_braids.jpeg"), false);
  assert.equal(isVideoFilenameOrUrl(""), false);
});

test("cleanMediaTitleFromFilename cleans filename into readable title with fallback", () => {
  assert.equal(
    cleanMediaTitleFromFilename("boho_braids-été.MOV"),
    "boho braids été"
  );
  assert.equal(cleanMediaTitleFromFilename("   .mp4", "Nouvelle vidéo"), "Nouvelle vidéo");
  assert.equal(cleanMediaTitleFromFilename("", "Nouvelle vidéo"), "Nouvelle vidéo");
});

test("optimizeCloudinaryMediaUrl and buildCloudinaryVideoThumbnail transform video URLs cleanly", () => {
  const rawMov =
    "https://res.cloudinary.com/dvecpg1tz/video/upload/v1700000000/ydm-coiffure/test_clip.mov";

  const optimized = optimizeCloudinaryMediaUrl(rawMov, true);
  assert.equal(
    optimized,
    "https://res.cloudinary.com/dvecpg1tz/video/upload/c_limit,w_1080/q_auto:good,vc_auto/v1700000000/ydm-coiffure/test_clip.mp4"
  );

  // Calling again should not double-apply transformations
  assert.equal(optimizeCloudinaryMediaUrl(optimized, true), optimized);

  // Thumbnail should extract JPG at so_0 without keeping video transformations
  const thumb = buildCloudinaryVideoThumbnail(optimized);
  assert.equal(
    thumb,
    "https://res.cloudinary.com/dvecpg1tz/video/upload/c_limit,q_auto,so_0,w_900/v1700000000/ydm-coiffure/test_clip.jpg"
  );
});

test("resolveGalleryPosterUrl returns explicit image, auto Cloudinary poster, or empty string safely", () => {
  assert.equal(
    resolveGalleryPosterUrl({
      image: " /images/realisations/boho.jpeg ",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/v1/clip.mp4",
    }),
    "/images/realisations/boho.jpeg"
  );

  assert.equal(
    resolveGalleryPosterUrl({
      type: "video",
      image: "",
      videoUrl:
        "https://res.cloudinary.com/dvecpg1tz/video/upload/c_limit,w_1080/q_auto:good,vc_auto/v123/ydm/clip.mp4",
    }),
    "https://res.cloudinary.com/dvecpg1tz/video/upload/c_limit,q_auto,so_0,w_900/v123/ydm/clip.jpg"
  );

  // External MP4 with no poster image safely returns "" so <Image> is skipped
  assert.equal(
    resolveGalleryPosterUrl({
      type: "video",
      image: "",
      videoUrl: "https://cdn.example.com/custom-video.mp4",
    }),
    ""
  );
});

test("canUseNextImageUrl allows local paths and configured Next.js image domains only", () => {
  assert.equal(canUseNextImageUrl("/images/realisations/a.jpeg"), true);
  assert.equal(
    canUseNextImageUrl("https://res.cloudinary.com/dvecpg1tz/image/upload/v1/a.jpg"),
    true
  );
  assert.equal(
    canUseNextImageUrl("https://images.unsplash.com/photo-123"),
    true
  );
  assert.equal(canUseNextImageUrl("https://example.com/unconfigured.jpg"), false);
  assert.equal(canUseNextImageUrl("http://res.cloudinary.com/insecure.jpg"), false);
  assert.equal(canUseNextImageUrl(""), false);
});

test("extractGalleryFilterCategories counts visible photos/videos and appends custom admin categories", () => {
  const items = [
    { id: 1, visible: true, type: "video", category: "Knotless" },
    { id: 2, visible: true, type: "photo", category: "Sur-Mesure" },
    { id: 3, visible: false, type: "video", category: "MasqueeCat" },
  ];

  const filters = extractGalleryFilterCategories(items);
  const byKey = Object.fromEntries(filters.map((f) => [f.key, f]));

  assert.equal(byKey.ALL.count, 2);
  assert.equal(byKey.VIDEO.count, 1);
  assert.equal(byKey.PHOTO.count, 1);
  assert.equal(byKey.Knotless.count, 1);
  assert.equal(byKey["Sur-Mesure"].count, 1);
  assert.equal(byKey.MasqueeCat, undefined);
});
