import { describe, expect, it } from "vitest";
import { buildImageSrcSet, getOptimizedImageUrl } from "@/lib/image";

describe("getOptimizedImageUrl", () => {
  it("transforms Supabase public storage URLs", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/products/item.jpg";
    const result = getOptimizedImageUrl(url, { width: 400, quality: 80 });

    expect(result).toBe(
      "https://example.supabase.co/storage/v1/render/image/public/products/item.jpg?width=400&quality=80&resize=contain",
    );
  });

  it("returns external URLs unchanged", () => {
    const url = "https://cdn.example.com/photo.jpg";
    expect(getOptimizedImageUrl(url, { width: 200 })).toBe(url);
  });
});

describe("buildImageSrcSet", () => {
  it("builds width descriptors for Supabase URLs", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/products/item.jpg";
    const srcSet = buildImageSrcSet(url, [200, 400]);

    expect(srcSet).toContain("200w");
    expect(srcSet).toContain("400w");
    expect(srcSet).toContain("render/image/public");
  });
});
