import { describe, expect, it } from "vitest";
import { parseStoragePath } from "@/lib/storage";

describe("parseStoragePath", () => {
  it("returns bare paths unchanged", () => {
    expect(parseStoragePath("user-1/reports/file.pdf")).toBe("user-1/reports/file.pdf");
  });

  it("parses legacy public object URLs", () => {
    const url =
      "https://example.supabase.co/storage/v1/object/public/prescriptions/user-1/reports/file.pdf";
    expect(parseStoragePath(url)).toBe("user-1/reports/file.pdf");
  });
});
