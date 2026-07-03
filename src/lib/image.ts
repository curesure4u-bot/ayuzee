const SUPABASE_OBJECT_PATH = /\/storage\/v1\/object\/public\/(.+)$/;

export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

/** Apply Supabase Storage image transforms when the URL is from our bucket. */
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  options: ImageTransformOptions = {},
): string | undefined => {
  if (!url) return undefined;

  const match = url.match(SUPABASE_OBJECT_PATH);
  if (!match) return url;

  const { width, height, quality = 80, resize = "contain" } = options;
  const base = url.split("/storage/v1/object/public/")[0];
  const params = new URLSearchParams();
  if (width) params.set("width", String(Math.round(width)));
  if (height) params.set("height", String(Math.round(height)));
  params.set("quality", String(quality));
  params.set("resize", resize);

  return `${base}/storage/v1/render/image/public/${match[1]}?${params}`;
};

export const buildImageSrcSet = (
  url: string | null | undefined,
  widths: number[],
  options?: Omit<ImageTransformOptions, "width">,
): string | undefined => {
  if (!url) return undefined;

  const entries = widths
    .map((width) => {
      const src = getOptimizedImageUrl(url, { ...options, width });
      return src ? `${src} ${width}w` : null;
    })
    .filter((entry): entry is string => entry !== null);

  return entries.length > 0 ? entries.join(", ") : undefined;
};
