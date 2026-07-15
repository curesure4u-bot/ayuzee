import { describe, it, expect } from "vitest";
import { suggestDoshaCorrelation } from "@/data/ashtavidha";

describe("suggestDoshaCorrelation", () => {
  it("returns Insufficient data when no signals provided", () => {
    expect(suggestDoshaCorrelation({})).toBe("Insufficient data");
  });

  it("classic Vata: hard/dry (Bristol 1) + scanty + irregular + straining", () => {
    const out = suggestDoshaCorrelation({
      akriti_bristol_type: 1,
      pramana: "scanty",
      time_of_day_pattern: "irregular",
      associated_symptoms: ["Straining", "Incomplete evacuation"],
      plava_pariksha: "sinks",
    });
    expect(out).toMatch(/^Vata predominance/);
  });

  it("classic Pitta: loose (Bristol 7) + blood-tinged + frequent + urgency", () => {
    const out = suggestDoshaCorrelation({
      akriti_bristol_type: 7,
      varna: "blood_tinged",
      frequency_per_day: 4,
      associated_symptoms: ["Urgency", "Blood"],
    });
    expect(out).toMatch(/^Pitta predominance/);
  });

  it("classic Kapha: excessive + foul + ama + floats + mucus", () => {
    const out = suggestDoshaCorrelation({
      pramana: "excessive",
      gandha: "foul",
      ama_present: true,
      plava_pariksha: "floats",
      associated_symptoms: ["Mucus"],
      varna: "pale_clay",
    });
    expect(out).toMatch(/^Kapha predominance/);
  });

  it("mixed produces hyphenated label when scores tie", () => {
    const out = suggestDoshaCorrelation({
      akriti_bristol_type: 2, // vata +2
      pramana: "excessive",   // kapha +1
      gandha: "foul",         // kapha +1
      associated_symptoms: ["Straining"], // vata +1 -> V:3 K:2
      plava_pariksha: "floats", // kapha +1 -> V:3 K:3
    });
    expect(out).toMatch(/mixed/);
  });

  it("includes numeric V/P/K breakdown", () => {
    const out = suggestDoshaCorrelation({ akriti_bristol_type: 1 });
    expect(out).toMatch(/V:\d+ · P:\d+ · K:\d+/);
  });
});
