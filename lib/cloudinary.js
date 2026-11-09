import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dvecpg1tz",
  api_key: process.env.CLOUDINARY_API_KEY || "638433529399836",
  api_secret: process.env.CLOUDINARY_API_SECRET || "r94h9y8JZOg9w_2Gb5viVRSV3t4",
  secure: true,
});

export default cloudinary;

/**
 * Upload an image or video buffer / base64 / URL to Cloudinary
 * @param {string|Buffer} file - Base64 string, remote URL, or buffer
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<object>} Upload result containing secure_url, public_id, resource_type, etc.
 */
export async function uploadMedia(file, options = {}) {
  const defaultOptions = {
    folder: "ydm-coiffure",
    resource_type: "auto", // auto handles images and videos
    quality: "auto:good",
    fetch_format: "auto",
    ...options,
  };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, defaultOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

/**
 * Generate an optimized delivery URL for images or videos
 */
export function getOptimizedMediaUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto",
    fetch_format: "auto",
    ...options,
  });
}
