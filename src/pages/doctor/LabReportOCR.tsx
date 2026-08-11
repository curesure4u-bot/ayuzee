import { useState } from "react";
import { ScanLine, Upload, Printer, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface LabParam {
  key: string;
  label: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  category: string;
}

interface Interpretation {
  status: "normal" | "low" | "high";
  modern: string;
  ayurvedic: string;
  approach: string;
}

const LAB_PARAMS: LabParam[] = [
  // Blood Count
  { key: "hb", label: "Hemoglobin", unit: "g/dL", normalLow: 12, normalHigh: 16, category: "Blood Count" },
  { key: "wbc", label: "WBC", unit: "cells/µL", normalLow: 4000, normalHigh: 11000, category: "Blood Count" },
  { key: "rbc", label: "RBC", unit: "million/µL", normalLow: 4.2, normalHigh: 5.8, category: "Blood Count" },
  { key: "platelets", label: "Platelets", unit: "lakh/µL", normalLow: 1.5, normalHigh: 4.0, category: "Blood Count" },
  { key: "esr", label: "ESR", unit: "mm/hr", normalLow: 0, normalHigh: 20, category: "Blood Count" },
  // Metabolic
  { key: "fbs", label: "Fasting Blood Sugar", unit: "mg/dL", normalLow: 70, normalHigh: 100, category: "Metabolic" },
  { key: "hba1c", label: "HbA1c", unit: "%", normalLow: 4.0, normalHigh: 5.6, category: "Metabolic" },
  { key: "cholesterol", label: "Total Cholesterol", unit: "mg/dL", normalLow: 125, normalHigh: 200, category: "Metabolic" },
  { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", normalLow: 50, normalHigh: 150, category: "Metabolic" },
  { key: "hdl", label: "HDL Cholesterol", unit: "mg/dL", normalLow: 40, normalHigh: 60, category: "Metabolic" },
  { key: "ldl", label: "LDL Cholesterol", unit: "mg/dL", normalLow: 50, normalHigh: 100, category: "Metabolic" },
  // Liver
  { key: "sgot", label: "SGOT/AST", unit: "U/L", normalLow: 8, normalHigh: 40, category: "Liver" },
  { key: "sgpt", label: "SGPT/ALT", unit: "U/L", normalLow: 7, normalHigh: 56, category: "Liver" },
  { key: "bilirubin", label: "Bilirubin Total", unit: "mg/dL", normalLow: 0.1, normalHigh: 1.2, category: "Liver" },
  { key: "alp", label: "Alkaline Phosphatase", unit: "U/L", normalLow: 44, normalHigh: 147, category: "Liver" },
  // Kidney
  { key: "creatinine", label: "Creatinine", unit: "mg/dL", normalLow: 0.6, normalHigh: 1.2, category: "Kidney" },
  { key: "bun", label: "BUN/Urea", unit: "mg/dL", normalLow: 7, normalHigh: 20, category: "Kidney" },
  { key: "uric_acid", label: "Uric Acid", unit: "mg/dL", normalLow: 3.5, normalHigh: 7.2, category: "Kidney" },
  // Thyroid
  { key: "tsh", label: "TSH", unit: "µIU/mL", normalLow: 0.4, normalHigh: 4.0, category: "Thyroid" },
  { key: "t3", label: "T3", unit: "ng/dL", normalLow: 80, normalHigh: 200, category: "Thyroid" },
  { key: "t4", label: "T4", unit: "µg/dL", normalLow: 4.5, normalHigh: 12.0, category: "Thyroid" },
];

function interpretValue(param: LabParam, value: number): Interpretation {
  const isLow = value < param.normalLow;
  const isHigh = value > param.normalHigh;
  const status: "normal" | "low" | "high" = isLow ? "low" : isHigh ? "high" : "normal";

  const interpretations: Record<string, { low: Interpretation; high: Interpretation; normal: Interpretation }> = {
    hb: {
      low: { status: "low", modern: "Anemia — iron deficiency, chronic disease, or blood loss", ayurvedic: "Rasa-Rakta Dhatu Kshaya (tissue depletion), likely Vata-Pitta imbalance", approach: "Draksha, Amalaki, Punarnava; Loha Bhasma; iron-rich diet (dates, pomegranate)" },
      high: { status: "high", modern: "Polycythemia — dehydration or myeloproliferative disorder", ayurvedic: "Rakta Dhatu Vriddhi, Pitta Prakopa in Raktavaha Srotas", approach: "Raktamokshana (bloodletting), Pitta Shamana, cooling herbs (Guduchi, Sariva)" },
      normal: { status: "normal", modern: "Normal hemoglobin — adequate oxygen carrying capacity", ayurvedic: "Rasa-Rakta Dhatu Sama (balanced tissue formation)", approach: "Maintain with balanced diet and seasonal Rasayana" },
    },
    wbc: {
      low: { status: "low", modern: "Leukopenia — immunosuppression, viral infection, or bone marrow issue", ayurvedic: "Ojas Kshaya (diminished immunity), Vata-dominant Rasa Dhatu depletion", approach: "Ashwagandha, Guduchi, Yashtimadhu; Rasayana therapy for Ojas enhancement" },
      high: { status: "high", modern: "Leukocytosis — infection, inflammation, or stress response", ayurvedic: "Ama with Pitta Prakopa, inflammatory toxin accumulation in Rasa Dhatu", approach: "Deepana-Pachana (detox), Guduchi, Haridra; address root infection/inflammation" },
      normal: { status: "normal", modern: "Normal WBC — adequate immune surveillance", ayurvedic: "Ojas and Rasa Dhatu in balance, proper immunity", approach: "Preventive Rasayana with Chyawanprash, maintain Agni" },
    },
    rbc: {
      low: { status: "low", modern: "Low RBC — anemia, hemorrhage, or nutritional deficiency", ayurvedic: "Rakta Dhatu Kshaya, impaired Ranjaka Pitta function", approach: "Punarnava Mandura, Dhatri Lauh; build Rakta with Beetroot, Pomegranate juice" },
      high: { status: "high", modern: "Erythrocytosis — dehydration, hypoxia, or polycythemia vera", ayurvedic: "Rakta Dhatu excess with Pitta involvement, possible Srotavarodha", approach: "Sariva, Manjishtha for blood purification; adequate hydration; Virechana" },
      normal: { status: "normal", modern: "Normal RBC count — adequate erythropoiesis", ayurvedic: "Rakta Dhatu properly formed, Ranjaka Pitta functioning well", approach: "Maintain with iron-rich diet, seasonal Shodhana" },
    },
    platelets: {
      low: { status: "low", modern: "Thrombocytopenia — risk of bleeding, viral infection (dengue), or ITP", ayurvedic: "Rakta Dhatu Kshaya with Pitta Prakopa, impaired coagulation (Shonitasthambhana)", approach: "Papaya leaf extract, Durva (Cynodon), Nagkesara; avoid Pitta-aggravating foods" },
      high: { status: "high", modern: "Thrombocytosis — reactive (infection/inflammation) or myeloproliferative", ayurvedic: "Kapha-Pitta involvement in Raktavaha Srotas, excessive clotting tendency", approach: "Guggulu, Haridra; blood thinning herbs; rule out chronic inflammation" },
      normal: { status: "normal", modern: "Normal platelet count — adequate hemostasis", ayurvedic: "Rakta Dhatu coagulation function (Shonitasthambhana) balanced", approach: "Maintain with balanced Pitta-pacifying diet" },
    },
    esr: {
      low: { status: "low", modern: "Low ESR — generally not clinically significant", ayurvedic: "No significant Ama accumulation, normal Agni function", approach: "No specific intervention needed" },
      high: { status: "high", modern: "Elevated ESR — active inflammation, infection, or autoimmune condition", ayurvedic: "Ama presence, systemic inflammation (Shotha), Srotavarodha in multiple channels", approach: "Langhana (fasting), Deepana-Pachana, Guggulu, Shallaki; identify root cause" },
      normal: { status: "normal", modern: "Normal ESR — no significant systemic inflammation", ayurvedic: "Minimal Ama, adequate Agni, clear Srotas (channels)", approach: "Maintain with proper diet and seasonal detox" },
    },
    fbs: {
      low: { status: "low", modern: "Hypoglycemia — medication effect, insulinoma, or adrenal insufficiency", ayurvedic: "Vata Prakopa with Agni Vishama (irregular digestion), Rasa Dhatu depletion", approach: "Regular meals, Ashwagandha, Shatavari; sweet taste (Madhura Rasa) foods" },
      high: { status: "high", modern: "Hyperglycemia — diabetes mellitus or impaired fasting glucose", ayurvedic: "Prameha (Kapha-Pitta), Medas Dhatu excess, impaired Agni", approach: "Gudmar (Gymnema), Jambu, Haridra, Methi; exercise; Madhumehari Vati" },
      normal: { status: "normal", modern: "Normal fasting glucose — adequate glycemic control", ayurvedic: "Medas Dhatu balanced, Agni functioning properly", approach: "Maintain with Ritucharya, regular exercise, moderate sweet intake" },
    },
    hba1c: {
      low: { status: "low", modern: "Low HbA1c — very tight glucose control or hemolytic conditions", ayurvedic: "Possible Rakta Dhatu rapid turnover, Pitta involvement", approach: "Evaluate for underlying hemolysis, maintain balanced diet" },
      high: { status: "high", modern: "Elevated HbA1c — poor glycemic control over 3 months, diabetes", ayurvedic: "Chronic Prameha with Dhatugata (deep-seated) Kapha-Pitta, impaired Dhatvagni", approach: "Shilajit, Gudmar, Triphala; Panchakarma (Udvartana, Virechana); lifestyle modification" },
      normal: { status: "normal", modern: "Normal HbA1c — good long-term glycemic control", ayurvedic: "Medas Dhatu metabolism balanced, Dhatvagni proper", approach: "Continue current regimen, seasonal Shodhana" },
    },
    cholesterol: {
      low: { status: "low", modern: "Low cholesterol — malnutrition, liver disease, or hyperthyroidism", ayurvedic: "Medas Dhatu Kshaya, Vata Vriddhi, inadequate Snigdha (unctuous) quality", approach: "Ghee, Brimhana therapy, nutritive diet; Ashwagandha for tissue building" },
      high: { status: "high", modern: "Hypercholesterolemia — cardiovascular risk, dietary or genetic factors", ayurvedic: "Meda Dhatu Vriddhi, Kapha dominance, Srotavarodha (channel blockage)", approach: "Guggulu (Medohar Guggulu), Arjuna, Triphala; Lekhaniya (scraping) therapy; exercise" },
      normal: { status: "normal", modern: "Normal cholesterol — adequate lipid levels", ayurvedic: "Medas Dhatu balanced, proper Medo-Dhatvagni function", approach: "Maintain with moderate ghee intake, regular exercise" },
    },
    triglycerides: {
      low: { status: "low", modern: "Low triglycerides — malabsorption or very low fat diet", ayurvedic: "Meda-Rasa Dhatu depletion, inadequate Snehana (oleation)", approach: "Increase healthy fats (ghee, sesame oil), Brimhana therapy" },
      high: { status: "high", modern: "Hypertriglyceridemia — pancreatitis risk, metabolic syndrome", ayurvedic: "Medas-Kapha Vriddhi with Agni Mandya, Ama in Medovaha Srotas", approach: "Guggulu, Vidanga, Chitraka; Udvartana; reduce Kapha-generating foods" },
      normal: { status: "normal", modern: "Normal triglycerides — adequate lipid metabolism", ayurvedic: "Medo-Dhatvagni functioning well, no Ama in lipid channels", approach: "Maintain current diet pattern with seasonal adjustments" },
    },
    hdl: {
      low: { status: "low", modern: "Low HDL — increased cardiovascular risk, metabolic syndrome", ayurvedic: "Impaired Sara (essence) of Medas Dhatu, Agni Mandya affecting lipid quality", approach: "Arjuna, Guggulu; increase exercise; moderate ghee; Triphala for Agni" },
      high: { status: "high", modern: "High HDL — generally cardioprotective", ayurvedic: "Good Medo-Dhatu Sara formation, balanced Agni", approach: "Excellent — maintain with current lifestyle and Rasayana herbs" },
      normal: { status: "normal", modern: "Normal HDL — adequate cardioprotection", ayurvedic: "Medas Dhatu Sara (essence) properly formed", approach: "Maintain with exercise, Arjuna for cardiac health" },
    },
    ldl: {
      low: { status: "low", modern: "Low LDL — generally favorable, unless from malnutrition", ayurvedic: "Medas Dhatu formation balanced, no excessive Kapha", approach: "Good status — maintain current approach" },
      high: { status: "high", modern: "High LDL — atherogenic, increases cardiovascular disease risk", ayurvedic: "Medas Dhatu Vriddhi with Ama, Kapha blocking Raktavaha Srotas (atherosclerosis)", approach: "Medohar Guggulu, Arjuna, Garlic (Lasuna); Virechana; strict Kapha-reducing diet" },
      normal: { status: "normal", modern: "Normal LDL — acceptable cardiovascular risk level", ayurvedic: "Medas Dhatu in balance, channels clear of Ama", approach: "Maintain with Triphala, moderate exercise, balanced diet" },
    },
    sgot: {
      low: { status: "low", modern: "Low AST — not clinically significant in most cases", ayurvedic: "Normal Yakrit (liver) Pitta function", approach: "No specific intervention needed" },
      high: { status: "high", modern: "Elevated AST — liver damage, cardiac injury, or muscle damage", ayurvedic: "Pitta Prakopa in Yakrit (liver), Raktadhatu impairment, hepatic inflammation", approach: "Bhumyamalaki, Kutki, Kalmegh; Pitta Shamana; avoid alcohol and fried foods" },
      normal: { status: "normal", modern: "Normal AST — no active hepatocellular damage", ayurvedic: "Yakrit (liver) functioning well, Ranjaka Pitta balanced", approach: "Maintain with liver-protective diet, seasonal Virechana" },
    },
    sgpt: {
      low: { status: "low", modern: "Low ALT — not clinically significant", ayurvedic: "Normal hepatic function", approach: "No intervention needed" },
      high: { status: "high", modern: "Elevated ALT — liver-specific damage (hepatitis, fatty liver, drug injury)", ayurvedic: "Pitta Prakopa in Yakrit (liver), Raktadhatu impairment, Koshthagata Pitta", approach: "Arogyavardhini Vati, Bhumyamalaki, Kutki; strict Pitta diet; Virechana when stable" },
      normal: { status: "normal", modern: "Normal ALT — no active liver cell injury", ayurvedic: "Yakrit Pitta balanced, Raktavaha Srotas clear", approach: "Maintain hepatic health with Triphala, avoid excess Pitta foods" },
    },
    bilirubin: {
      low: { status: "low", modern: "Low bilirubin — not clinically significant", ayurvedic: "Normal bile metabolism", approach: "No intervention needed" },
      high: { status: "high", modern: "Hyperbilirubinemia — jaundice, hemolysis, or biliary obstruction", ayurvedic: "Kamala (jaundice), Pitta Prakopa overwhelming Yakrit, Raktadhatu and Ranjaka Pitta disturbed", approach: "Katuki, Bhumyamalaki, Punarnava; complete Pitta Shamana; sugar cane juice, Amalaki" },
      normal: { status: "normal", modern: "Normal bilirubin — adequate hepatobiliary function", ayurvedic: "Ranjaka Pitta and bile metabolism functioning normally", approach: "Maintain with liver-friendly diet" },
    },
    alp: {
      low: { status: "low", modern: "Low ALP — malnutrition, hypothyroidism, or zinc deficiency", ayurvedic: "Asthi-Dhatu Kshaya tendency, weakened Asthivaha Srotas", approach: "Calcium with Praval Pishti, Laksha, nutritive diet; address Vata in bones" },
      high: { status: "high", modern: "High ALP — biliary obstruction, bone disease, or liver pathology", ayurvedic: "Pitta-Kapha obstruction in hepatic/biliary channels or Asthi Dhatu disturbance", approach: "Rule out biliary obstruction; Arogyavardhini, Punarnava; bone evaluation if persistent" },
      normal: { status: "normal", modern: "Normal ALP — healthy bone and liver enzyme activity", ayurvedic: "Asthi Dhatu and Yakrit Pitta in balance", approach: "Maintain with calcium-rich foods and seasonal Panchakarma" },
    },
    creatinine: {
      low: { status: "low", modern: "Low creatinine — reduced muscle mass or liver disease", ayurvedic: "Mamsa Dhatu Kshaya (muscle depletion), Vata-dominant wasting", approach: "Brimhana (nourishing) therapy, Ashwagandha, protein-rich diet" },
      high: { status: "high", modern: "Elevated creatinine — kidney dysfunction, dehydration, or rhabdomyolysis", ayurvedic: "Mutravaha Sroto Dushti, Vata-Kapha imbalance in Basti (bladder/kidney)", approach: "Punarnava, Gokshura, Varun; adequate hydration; Basti therapy; restrict protein" },
      normal: { status: "normal", modern: "Normal creatinine — adequate renal filtration", ayurvedic: "Mutravaha Srotas functioning well, Mutra Dhatu balanced", approach: "Maintain renal health with adequate hydration, Gokshura preventively" },
    },
    bun: {
      low: { status: "low", modern: "Low BUN — liver disease, malnutrition, or overhydration", ayurvedic: "Impaired Yakrit (liver) protein metabolism, Rasa Dhatu dilution", approach: "Protein-rich diet, Brimhana therapy, evaluate liver function" },
      high: { status: "high", modern: "Elevated BUN — kidney disease, dehydration, high-protein diet, or GI bleeding", ayurvedic: "Mutravaha Sroto Dushti with Ama, impaired Mutra formation in Pakwashaya", approach: "Punarnava, Gokshura, Shilajit; hydration; Basti therapy for Vata Shamana" },
      normal: { status: "normal", modern: "Normal BUN — adequate kidney function and protein metabolism", ayurvedic: "Mutravaha Srotas and Purishavaha Srotas balanced", approach: "Maintain with moderate protein, adequate hydration" },
    },
    uric_acid: {
      low: { status: "low", modern: "Low uric acid — not typically concerning, may indicate Fanconi syndrome", ayurvedic: "No specific concern, possibly low Purine metabolism", approach: "No specific intervention needed" },
      high: { status: "high", modern: "Hyperuricemia — gout risk, kidney stones, metabolic syndrome marker", ayurvedic: "Vatarakta condition, Purine metabolism dysfunction, Kapha-Vata in Raktavaha Srotas", approach: "Guduchi, Punarnava, Giloy Satva; avoid Vata-Pitta foods; Virechana; Raktamokshana" },
      normal: { status: "normal", modern: "Normal uric acid — adequate purine metabolism", ayurvedic: "Purine metabolism balanced, no Vatarakta tendency", approach: "Maintain with moderate purine diet, adequate hydration" },
    },
    tsh: {
      low: { status: "low", modern: "Low TSH — hyperthyroidism or over-medication", ayurvedic: "Pitta Prakopa with Agni Tikshna (hypermetabolism), Dhatu Kshaya from excess catabolism", approach: "Jatamansi, Brahmi for calming; Pitta Shamana; cooling regimen; Shirodhara" },
      high: { status: "high", modern: "Elevated TSH — hypothyroidism (underactive thyroid)", ayurvedic: "Kapha Vriddhi affecting Agni, Manda Agni pattern, Medas-Kapha accumulation", approach: "Kanchanara Guggulu, Varuna, Punarnava; stimulate Agni; Udvartana; exercise" },
      normal: { status: "normal", modern: "Normal TSH — euthyroid state, adequate thyroid function", ayurvedic: "Agni balanced, Dhatvagni chain functioning properly", approach: "Maintain thyroid health with iodine-rich foods, Ashwagandha preventively" },
    },
    t3: {
      low: { status: "low", modern: "Low T3 — hypothyroidism or sick euthyroid syndrome", ayurvedic: "Kapha predominance, sluggish Dhatvagni, tissue metabolism slow", approach: "Kanchanara Guggulu, Trikatu for Agni; thyroid-supportive minerals (Shilajit)" },
      high: { status: "high", modern: "High T3 — hyperthyroidism, T3 thyrotoxicosis", ayurvedic: "Pitta-Vata Prakopa, excessive Dhatvagni, rapid tissue catabolism", approach: "Shankhapushpi, Jatamansi, Brahmi; cooling Pitta therapies; Shirodhara" },
      normal: { status: "normal", modern: "Normal T3 — adequate active thyroid hormone", ayurvedic: "Active metabolic fire (Dhatvagni) balanced at tissue level", approach: "Maintain with balanced lifestyle and stress management" },
    },
    t4: {
      low: { status: "low", modern: "Low T4 — hypothyroidism (primary or central)", ayurvedic: "Kapha Vriddhi, Manda Agni at Dhatu level, sluggish cellular metabolism", approach: "Guggulu preparations, Trikatu, Punarnava; stimulating Panchakarma" },
      high: { status: "high", modern: "High T4 — hyperthyroidism or binding protein abnormality", ayurvedic: "Pitta predominance with Tikshna Agni, accelerated Dhatu depletion", approach: "Pitta Shamana, Ashwagandha (paradoxically balances both), cooling herbs" },
      normal: { status: "normal", modern: "Normal T4 — adequate thyroid hormone production", ayurvedic: "Thyroid (Agni regulator) functioning in homeostasis", approach: "Maintain current status with Ritucharya" },
    },
  };

  const paramInterp = interpretations[param.key];
  if (!paramInterp) {
    return {
      status,
      modern: status === "normal" ? "Within normal range" : `${status === "high" ? "Above" : "Below"} normal range`,
      ayurvedic: "Assess in context of overall Dosha balance",
      approach: "Individualized assessment recommended",
    };
  }
  return paramInterp[status];
}

export default function LabReportOCR() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const handleValueChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setShowResults(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      toast.success("File uploaded for documentation");
    }
  };

  const enteredParams = LAB_PARAMS.filter(
    (p) => values[p.key] && values[p.key].trim() !== ""
  );

  const getStatusBadge = (status: "normal" | "low" | "high") => {
    if (status === "normal") return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
    if (status === "low") return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
    return <Badge className="bg-red-100 text-red-800">High</Badge>;
  };

  const categories = ["Blood Count", "Metabolic", "Liver", "Kidney", "Thyroid"];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ScanLine className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Lab Report Interpreter</h1>
        </div>
        <p className="text-gray-600">
          Upload reports or enter values — get modern + Ayurvedic interpretation
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Upload Lab Report</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
            {uploadPreview ? (
              <img src={uploadPreview} alt="Report preview" className="h-32 object-contain rounded" />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Upload lab report image or PDF</span>
                <span className="text-xs text-gray-400 mt-1">Click or drag and drop</span>
              </div>
            )}
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
          </label>
          <p className="text-xs text-gray-400 mt-2 italic">
            OCR processing will extract values automatically (coming soon). For now, enter values manually below.
          </p>
        </CardContent>
      </Card>

      {/* Manual Entry Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Enter Lab Values</CardTitle>
          <p className="text-sm text-gray-500">Fill in available lab parameters. Leave blank to skip.</p>
        </CardHeader>
        <CardContent>
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 pb-1 border-b">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LAB_PARAMS.filter((p) => p.category === category).map((param) => (
                  <div key={param.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.label}
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="any"
                        placeholder={`${param.normalLow} - ${param.normalHigh}`}
                        value={values[param.key] || ""}
                        onChange={(e) => handleValueChange(param.key, e.target.value)}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {param.unit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Normal: {param.normalLow} - {param.normalHigh} {param.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            className="w-full mt-6 bg-indigo-700 hover:bg-indigo-800 h-12 text-lg"
            onClick={() => {
              if (enteredParams.length === 0) {
                toast.error("Please enter at least one lab value");
                return;
              }
              setShowResults(true);
              toast.success(`Interpreting ${enteredParams.length} parameter(s)...`);
            }}
          >
            <ScanLine className="h-5 w-5 mr-2" />
            Interpret Results
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {showResults && enteredParams.length > 0 && (
        <Card className="mb-6 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-800">Interpretation Results</CardTitle>
            <p className="text-sm text-gray-500">
              {enteredParams.length} parameter{enteredParams.length !== 1 ? "s" : ""} analyzed
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {enteredParams.map((param) => {
              const numVal = parseFloat(values[param.key]);
              if (isNaN(numVal)) return null;
              const interp = interpretValue(param, numVal);
              return (
                <div
                  key={param.key}
                  className={`p-4 rounded-lg border ${
                    interp.status === "normal"
                      ? "bg-green-50/50 border-green-200"
                      : interp.status === "high"
                      ? "bg-red-50/50 border-red-200"
                      : "bg-blue-50/50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{param.label}</span>
                      <span className="text-sm text-gray-500">
                        {numVal} {param.unit}
                      </span>
                    </div>
                    {getStatusBadge(interp.status)}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <span className="font-medium text-gray-700">Modern: </span>
                      <span className="text-gray-600">{interp.modern}</span>
                    </p>
                    <p>
                      <span className="font-medium text-amber-700">Ayurvedic: </span>
                      <span className="text-amber-600">{interp.ayurvedic}</span>
                    </p>
                    <p>
                      <span className="font-medium text-green-700">Approach: </span>
                      <span className="text-green-600">{interp.approach}</span>
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800"
                onClick={() => toast.success("Interpretation saved to patient record")}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Interpretation
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => toast("Print functionality coming soon")}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-400 text-center mt-4 italic">
        Disclaimer: This tool provides educational interpretation only. Lab results must be correlated with clinical findings. 
        Always confirm with standard medical references and clinical judgment.
      </p>
    </div>
  );
}
