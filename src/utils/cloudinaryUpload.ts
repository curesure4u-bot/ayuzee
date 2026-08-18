/**
 * Cloudinary Upload Utility
 * 
 * Uploads files (images, PDFs, documents) to Cloudinary instead of Supabase Storage.
 * This saves your Supabase storage for database use.
 * 
 * Cloudinary free tier: 25 GB storage, 25 GB bandwidth/month
 * 
 * Usage:
 *   import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
 *   
 *   // Upload a file and get the URL
 *   const result = await uploadToCloudinary(file);
 *   console.log(result.url); // https://res.cloudinary.com/khcxf5nw/...
 *   
 *   // Upload with image compression (for photos)
 *   const result = await uploadToCloudinary(file, { compress: true });
 *   
 *   // Upload to a specific subfolder
 *   const result = await uploadToCloudinary(file, { folder: "prescriptions" });
 */

import { compressImage } from "./imageCompression";

const CLOUD_NAME = "khcxf5nw";
const UPLOAD_PRESET = "ayuzee_uploads";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export interface CloudinaryUploadResult {
  /** The public URL of the uploaded file */
  url: string;
  /** Secure HTTPS URL */
  secureUrl: string;
  /** Cloudinary public ID (used for transformations) */
  publicId: string;
  /** File format (jpg, png, pdf, etc.) */
  format: string;
  /** File size in bytes */
  bytes: number;
  /** Width (for images) */
  width?: number;
  /** Height (for images) */
  height?: number;
  /** Original filename */
  originalFilename: string;
}

export interface UploadOptions {
  /** Compress images before upload (default: true for images) */
  compress?: boolean;
  /** Subfolder within ayuzee/ folder (e.g., "prescriptions", "profiles") */
  folder?: string;
  /** Custom tags for organizing (e.g., ["patient", "medical"]) */
  tags?: string[];
  /** Callback for upload progress (0-100) */
  onProgress?: (percent: number) => void;
}

/**
 * Upload a single file to Cloudinary.
 * Returns the URL to store in your database.
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const { compress = true, folder, tags, onProgress } = options;

  // Compress images before upload (saves bandwidth + storage)
  let fileToUpload = file;
  if (compress && file.type.startsWith("image/")) {
    fileToUpload = await compressImage(file);
  }

  // Build form data for Cloudinary upload
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("upload_preset", UPLOAD_PRESET);

  if (folder) {
    formData.append("folder", `ayuzee/${folder}`);
  }

  if (tags && tags.length > 0) {
    formData.append("tags", tags.join(","));
  }

  // Upload with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_URL);

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.url,
          secureUrl: response.secure_url,
          publicId: response.public_id,
          format: response.format,
          bytes: response.bytes,
          width: response.width,
          height: response.height,
          originalFilename: response.original_filename,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed: Network error"));
    xhr.send(formData);
  });
}

/**
 * Upload multiple files to Cloudinary.
 * Returns array of results in the same order.
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];
  for (const file of files) {
    const result = await uploadToCloudinary(file, options);
    results.push(result);
  }
  return results;
}

/**
 * Get an optimized image URL from Cloudinary.
 * Automatically serves the right size and format for the device.
 * 
 * Example:
 *   getOptimizedUrl("ayuzee/profiles/abc123", { width: 200 })
 *   → "https://res.cloudinary.com/khcxf5nw/image/upload/w_200,f_auto,q_auto/ayuzee/profiles/abc123"
 */
export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  const transforms: string[] = [];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  transforms.push("f_auto"); // Auto format (WebP for Chrome, JPEG for Safari)
  transforms.push(`q_${options.quality || "auto"}`); // Auto quality

  const transformStr = transforms.join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}
