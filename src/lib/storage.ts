import { supabase } from "@/integrations/supabase/client";

const PRIVATE_BUCKETS = new Set([
  "prescriptions",
  "patient-files",
  "posture-images",
  "doctor-documents",
  "student-docs",
  "therapist-docs",
  "venue-docs",
]);

/** Extract storage object path from a legacy public URL or return path as-is. */
export const parseStoragePath = (
  value: string,
  bucket = "prescriptions",
): string | null => {
  if (!value) return null;
  if (!value.startsWith("http")) return value;

  const objectMatch = value.match(new RegExp(`/object/public/${bucket}/(.+)$`));
  if (objectMatch?.[1]) return decodeURIComponent(objectMatch[1]);

  const renderMatch = value.match(new RegExp(`/render/image/public/${bucket}/(.+?)\\?`));
  if (renderMatch?.[1]) return decodeURIComponent(renderMatch[1]);

  return null;
};

export const uploadPrivateFile = async (
  bucket: string,
  path: string,
  file: File,
  contentType?: string,
) => {
  if (!PRIVATE_BUCKETS.has(bucket)) {
    console.warn(`[storage] uploading to non-private bucket: ${bucket}`);
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: contentType ?? file.type,
  });

  if (error) throw error;
  return path;
};

export const createSignedStorageUrl = async (
  bucket: string,
  pathOrUrl: string,
  expiresInSeconds = 3600,
) => {
  const path = parseStoragePath(pathOrUrl, bucket) ?? pathOrUrl;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
};

export const openSignedStorageUrl = async (
  bucket: string,
  pathOrUrl: string,
  expiresInSeconds = 3600,
) => {
  const signedUrl = await createSignedStorageUrl(bucket, pathOrUrl, expiresInSeconds);
  window.open(signedUrl, "_blank", "noopener,noreferrer");
};
