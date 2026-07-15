import { CATEGORIES, type Category, type Disease, type Medicine } from "@/data/astg";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type DiseaseHit = {
  type: "disease";
  category: Category;
  disease: Disease;
  id: string;
};

export type MedicineHit = {
  type: "medicine";
  name: string;
  uses: { category: Category; disease: Disease; level: number; medicine: Medicine }[];
};

export type SymptomHit = {
  type: "symptom";
  symptom: string;
  category: Category;
  disease: Disease;
};

export type SearchResults = {
  diseases: DiseaseHit[];
  medicines: MedicineHit[];
  symptoms: SymptomHit[];
};

export const ALL_DISEASES: DiseaseHit[] = CATEGORIES.flatMap((category) =>
  category.diseases.map((disease) => ({
    type: "disease" as const,
    category,
    disease,
    id: `${category.key}-${disease.key}`,
  })),
);

export type MedicineIndexEntry = {
  name: string;
  uses: { category: Category; disease: Disease; level: number; medicine: Medicine }[];
};

export const MEDICINE_INDEX: MedicineIndexEntry[] = (() => {
  const map = new Map<string, MedicineIndexEntry>();
  for (const category of CATEGORIES) {
    for (const disease of category.diseases) {
      for (const lvl of disease.levels ?? []) {
        for (const medicine of lvl.medicines) {
          const key = medicine.name.toLowerCase();
          const entry =
            map.get(key) ?? { name: medicine.name, uses: [] };
          entry.uses.push({ category, disease, level: lvl.level, medicine });
          map.set(key, entry);
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

export function search(query: string): SearchResults {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { diseases: [], medicines: [], symptoms: [] };

  const diseases = ALL_DISEASES.filter(
    (h) =>
      h.disease.name.toLowerCase().includes(q) ||
      h.disease.modern.toLowerCase().includes(q),
  ).slice(0, 8);

  const medicines: MedicineHit[] = MEDICINE_INDEX
    .filter((m) => m.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((m) => ({ type: "medicine", name: m.name, uses: m.uses }));

  const symptoms: SymptomHit[] = [];
  for (const { category, disease } of ALL_DISEASES) {
    for (const s of disease.lakshana ?? []) {
      if (s.toLowerCase().includes(q)) {
        symptoms.push({ type: "symptom", symptom: s, category, disease });
        if (symptoms.length >= 8) break;
      }
    }
    if (symptoms.length >= 8) break;
  }

  return { diseases, medicines, symptoms };
}

// ----- Filters -----
export type DoshaFilter = "all" | "vata" | "pitta" | "kapha" | "tridosha";
export type LevelFilter = "all" | 1 | 2 | 3;

export function diseaseMatchesDosha(disease: Disease, dosha: DoshaFilter): boolean {
  if (dosha === "all") return true;
  const haystack = [
    disease.definition ?? "",
    disease.nidana ?? "",
    ...(disease.lakshana ?? []),
    ...(disease.levels ?? []).flatMap((l) =>
      l.medicines.map((m) => `${m.dosha ?? ""} ${m.notes ?? ""}`),
    ),
  ]
    .join(" ")
    .toLowerCase();
  if (dosha === "tridosha") return /tridosh|sannipata/.test(haystack);
  return haystack.includes(dosha);
}

export function diseaseMatchesLevel(disease: Disease, level: LevelFilter): boolean {
  if (level === "all") return true;
  return (disease.levels ?? []).some((l) => l.level === level);
}

// ----- PDF Export -----
export function exportDiseasePDF(category: Category, disease: Disease) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Ayuzee ASTG Reference — ${disease.name}`, margin, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `${disease.modern}  ·  Chapter ${disease.ch}  ·  ${category.name}`,
    margin,
    68,
  );
  doc.setDrawColor(180);
  doc.line(margin, 78, pageWidth - margin, 78);

  let y = 100;

  const addParagraph = (label: string, body?: string) => {
    if (!body) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(body, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 8;
    if (y > 760) {
      doc.addPage();
      y = 60;
    }
  };

  addParagraph("Definition", disease.definition);
  addParagraph("Nidana (Causes)", disease.nidana);
  if (disease.lakshana?.length)
    addParagraph("Lakshana (Symptoms)", disease.lakshana.map((s) => `• ${s}`).join("\n"));
  addParagraph("Diagnostic Criteria", disease.diagnostic);

  for (const lvl of disease.levels ?? []) {
    if (y > 700) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${lvl.label} — ${lvl.facility}`, margin, y);
    y += 14;
    if (lvl.description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(lvl.description, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 11 + 4;
    }
    autoTable(doc, {
      startY: y,
      head: [["Medicine", "Formulation", "Dose", "Anupana", "Duration"]],
      body: lvl.medicines.map((m) => [
        m.name,
        m.formulation ?? "—",
        m.dose ?? "—",
        m.anupana ?? "—",
        m.duration ?? "—",
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 30, 30] },
      margin: { left: margin, right: margin },
    });
    // @ts-expect-error autoTable adds lastAutoTable
    y = (doc.lastAutoTable?.finalY ?? y) + 18;
    if (lvl.panchakarma) addParagraph("Panchakarma", lvl.panchakarma);
  }

  addParagraph("Pathya (Recommended)", disease.pathya);
  addParagraph("Apathya (Avoid)", disease.apathya);
  addParagraph("Prognosis", disease.prognosis);
  addParagraph("References", disease.references);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      "Source: Ministry of AYUSH Standard Treatment Guidelines, 2017",
      margin,
      820,
    );
    doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin - 50, 820);
    doc.setTextColor(0);
  }

  doc.save(`ASTG-${disease.name.replace(/\s+/g, "_")}.pdf`);
}
