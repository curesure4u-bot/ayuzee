import type { ImgHTMLAttributes } from "react";
import { getOptimizedImageUrl, buildImageSrcSet } from "@/lib/image";

type OptimizedImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes"
> & {
  src?: string | null;
  /** Default image request width when srcSet is not used. */
  optimizedWidth?: number;
  /** Widths for responsive srcset generation. */
  srcWidths?: number[];
  sizes?: string;
};

export const OptimizedImage = ({
  src,
  optimizedWidth = 640,
  srcWidths = [320, 640, 960],
  sizes = "(max-width: 640px) 100vw, 640px",
  width,
  height,
  loading = "lazy",
  decoding = "async",
  alt = "",
  ...props
}: OptimizedImageProps) => {
  const resolvedSrc = getOptimizedImageUrl(src, { width: optimizedWidth, height }) ?? src ?? undefined;
  const srcSet = buildImageSrcSet(src, srcWidths, height ? { height } : undefined);

  if (!resolvedSrc) return null;

  return (
    <img
      src={resolvedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      alt={alt}
      {...props}
    />
  );
};
