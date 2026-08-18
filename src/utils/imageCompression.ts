/**
 * Image Compression Utility
 * 
 * Compresses images before upload to save storage.
 * - Resizes large images to max 1200px width
 * - Compresses quality to keep file under 200 KB
 * - Converts to JPEG/WebP for smaller size
 * 
 * Usage:
 *   import { compressImage } from "@/utils/imageCompression";
 *   const compressed = await compressImage(file);
 *   // compressed is a new File object, much smaller
 */

interface CompressOptions {
  /** Maximum width in pixels (default: 1200) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 1200) */
  maxHeight?: number;
  /** Quality 0-1 (default: 0.7 = 70% quality, good balance) */
  quality?: number;
  /** Target max file size in bytes (default: 200KB) */
  maxSizeBytes?: number;
}

/**
 * Compresses an image file.
 * Returns a smaller File object ready for upload.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.7,
    maxSizeBytes = 200 * 1024, // 200 KB
  } = options;

  // Skip if not an image
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Skip if already small enough
  if (file.size <= maxSizeBytes) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Try to compress to target size
      let currentQuality = quality;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original
              return;
            }

            // If still too big and quality can be reduced, try again
            if (blob.size > maxSizeBytes && currentQuality > 0.3) {
              currentQuality -= 0.1;
              tryCompress();
              return;
            }

            // Create a new File object with the compressed data
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            console.log(
              `[Compress] ${file.name}: ${(file.size / 1024).toFixed(0)} KB → ${(compressedFile.size / 1024).toFixed(0)} KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% smaller)`
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          currentQuality
        );
      };

      tryCompress();
    };

    img.onerror = () => resolve(file); // Fallback to original on error
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compresses multiple image files.
 */
export async function compressImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
