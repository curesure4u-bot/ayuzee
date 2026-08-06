import { type DietChart, type Language, LANGUAGE_LABELS } from "@/data/dietChartData";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  chart: DietChart;
  lang: Language;
  patientName?: string;
  doctorName?: string;
  date?: string;
  customPathya?: string;
  customApathya?: string;
};

const DAYS: Record<Language, string[]> = {
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  hi: ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार"],
  ta: ["திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி", "ஞாயிறு"],
  ml: ["തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി", "ഞായർ"],
  kn: ["ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ", "ಭಾನುವಾರ"],
};

const LABELS: Record<Language, Record<string, string>> = {
  en: { title: "Weekly Diet Chart", pathya: "Do's (Pathya)", apathya: "Don'ts (Apathya)", lifestyle: "Lifestyle", breakfast: "Breakfast", midMorning: "Mid-Morning", lunch: "Lunch", evening: "Evening", dinner: "Dinner", day: "Day", notes: "Important Notes", doctor: "Doctor", patient: "Patient", date: "Date", poweredBy: "Powered by Ayuzee AYUSH HMS", custom: "Doctor's Additional Notes" },
  hi: { title: "साप्ताहिक आहार चार्ट", pathya: "पथ्य (करें)", apathya: "अपथ्य (न करें)", lifestyle: "जीवनशैली", breakfast: "नाश्ता", midMorning: "मध्य-सुबह", lunch: "दोपहर भोजन", evening: "शाम", dinner: "रात्रि भोजन", day: "दिन", notes: "महत्वपूर्ण नोट", doctor: "चिकित्सक", patient: "रोगी", date: "दिनांक", poweredBy: "Ayuzee AYUSH HMS द्वारा संचालित", custom: "चिकित्सक के अतिरिक्त नोट" },
  ta: { title: "வாராந்திர உணவுத் திட்டம்", pathya: "பத்யம் (செய்யவேண்டியவை)", apathya: "அபத்யம் (தவிர்க்கவேண்டியவை)", lifestyle: "வாழ்க்கை முறை", breakfast: "காலை உணவு", midMorning: "இடை காலை", lunch: "மதிய உணவு", evening: "மாலை", dinner: "இரவு உணவு", day: "நாள்", notes: "முக்கிய குறிப்புகள்", doctor: "மருத்துவர்", patient: "நோயாளி", date: "தேதி", poweredBy: "Ayuzee AYUSH HMS மூலம்", custom: "மருத்துவரின் கூடுதல் குறிப்புகள்" },
  ml: { title: "പ്രതിവാര ഭക്ഷണ ചാർട്ട്", pathya: "പഥ്യം (ചെയ്യേണ്ടവ)", apathya: "അപഥ്യം (ഒഴിവാക്കേണ്ടവ)", lifestyle: "ജീവിതശൈലി", breakfast: "പ്രഭാത ഭക്ഷണം", midMorning: "ഇടക്കാലം", lunch: "ഉച്ച ഭക്ഷണം", evening: "വൈകുന്നേരം", dinner: "അത്താഴം", day: "ദിവസം", notes: "പ്രധാന കുറിപ്പുകൾ", doctor: "ഡോക്ടർ", patient: "രോഗി", date: "തീയതി", poweredBy: "Ayuzee AYUSH HMS വഴി", custom: "ഡോക്ടറുടെ അധിക കുറിപ്പുകൾ" },
  kn: { title: "ವಾರದ ಆಹಾರ ಚಾರ್ಟ್", pathya: "ಪಥ್ಯ (ಮಾಡಬೇಕಾದವು)", apathya: "ಅಪಥ್ಯ (ಮಾಡಬಾರದವು)", lifestyle: "ಜೀವನಶೈಲಿ", breakfast: "ಬೆಳಗಿನ ಊಟ", midMorning: "ಮಧ್ಯಾಹ್ನ ಪೂರ್ವ", lunch: "ಮಧ್ಯಾಹ್ನ ಊಟ", evening: "ಸಂಜೆ", dinner: "ರಾತ್ರಿ ಊಟ", day: "ದಿನ", notes: "ಪ್ರಮುಖ ಟಿಪ್ಪಣಿಗಳು", doctor: "ವೈದ್ಯ", patient: "ರೋಗಿ", date: "ದಿನಾಂಕ", poweredBy: "Ayuzee AYUSH HMS ಮೂಲಕ", custom: "ವೈದ್ಯರ ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು" },
};

/**
 * Printable Diet Chart component - designed for window.print() or PDF generation
 * Clean layout with Ayuzee branding, Do's/Don'ts, and 7-day meal plan
 */
export default function DietChartPrintable({ chart, lang, patientName, doctorName, date, customPathya, customApathya }: Props) {
  const l = LABELS[lang];
  const days = DAYS[lang];
  // Fallback: if plan not available in selected lang, use English
  const plan = chart.weeklyPlan[lang] || chart.weeklyPlan.en || [];
  const pathyaItems = chart.pathya[lang] || chart.pathya.en || [];
  const apathyaItems = chart.apathya[lang] || chart.apathya.en || [];
  const lifestyleP = chart.lifestylePathya[lang] || chart.lifestylePathya.en || [];
  const lifestyleA = chart.lifestyleApathya[lang] || chart.lifestyleApathya.en || [];
  const diseaseTitle = chart.diseaseName[lang] || chart.diseaseName.en || "";
  const noteText = chart.notes[lang] || chart.notes.en || "";

  return (
    <div className="print-diet-chart bg-white p-6 max-w-4xl mx-auto text-sm font-sans" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="border-b-2 border-green-600 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-green-800">{l.title}</h1>
            <p className="text-base font-semibold text-green-700">{diseaseTitle}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p className="font-bold text-green-700">Ayuzee</p>
            <p>{l.poweredBy}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-gray-600">
          {patientName && <span><b>{l.patient}:</b> {patientName}</span>}
          {doctorName && <span><b>{l.doctor}:</b> {doctorName}</span>}
          {date && <span><b>{l.date}:</b> {date}</span>}
        </div>
      </div>

      {/* Pathya / Apathya */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-green-200 rounded p-3 bg-green-50/50">
          <h3 className="font-bold text-green-800 text-xs mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {l.pathya}
          </h3>
          <ul className="space-y-0.5">
            {pathyaItems.map((item, i) => (
              <li key={i} className="text-xs text-green-900">• {item}</li>
            ))}
          </ul>
          <h4 className="font-semibold text-green-700 text-[10px] mt-2 mb-1">{l.lifestyle}:</h4>
          <ul className="space-y-0.5">
            {lifestyleP.map((item, i) => (
              <li key={i} className="text-[10px] text-green-800">✓ {item}</li>
            ))}
          </ul>
        </div>
        <div className="border border-red-200 rounded p-3 bg-red-50/50">
          <h3 className="font-bold text-red-800 text-xs mb-2 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> {l.apathya}
          </h3>
          <ul className="space-y-0.5">
            {apathyaItems.map((item, i) => (
              <li key={i} className="text-xs text-red-900">• {item}</li>
            ))}
          </ul>
          <h4 className="font-semibold text-red-700 text-[10px] mt-2 mb-1">{l.lifestyle}:</h4>
          <ul className="space-y-0.5">
            {lifestyleA.map((item, i) => (
              <li key={i} className="text-[10px] text-red-800">✗ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weekly Meal Plan Table */}
      <div className="border rounded overflow-hidden mb-4">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="p-1.5 text-left border-r border-green-600">{l.day}</th>
              <th className="p-1.5 text-left border-r border-green-600">{l.breakfast}</th>
              <th className="p-1.5 text-left border-r border-green-600">{l.midMorning}</th>
              <th className="p-1.5 text-left border-r border-green-600">{l.lunch}</th>
              <th className="p-1.5 text-left border-r border-green-600">{l.evening}</th>
              <th className="p-1.5 text-left">{l.dinner}</th>
            </tr>
          </thead>
          <tbody>
            {plan.map((meal, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-green-50/30"}>
                <td className="p-1.5 border-r border-t font-semibold text-green-800">{days[i]}</td>
                <td className="p-1.5 border-r border-t">{meal.breakfast}</td>
                <td className="p-1.5 border-r border-t">{meal.midMorning}</td>
                <td className="p-1.5 border-r border-t">{meal.lunch}</td>
                <td className="p-1.5 border-r border-t">{meal.evening}</td>
                <td className="p-1.5 border-t">{meal.dinner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="border border-amber-200 rounded p-2 bg-amber-50/50 text-[10px] text-amber-900">
        <b>{l.notes}:</b> {noteText}
      </div>

      {/* Doctor's custom Pathya/Apathya - writable space */}
      {(customPathya || customApathya) && (
        <div className="border border-gray-300 rounded p-3 mt-3">
          <h4 className="font-bold text-xs mb-1">{l.custom}:</h4>
          {customPathya && <p className="text-xs text-green-800 mb-1"><b>✓ {l.pathya}:</b> {customPathya}</p>}
          {customApathya && <p className="text-xs text-red-800"><b>✗ {l.apathya}:</b> {customApathya}</p>}
        </div>
      )}

      {/* Blank writable lines for doctor to add during consultation */}
      <div className="border border-dashed border-gray-300 rounded p-3 mt-3">
        <h4 className="font-semibold text-[10px] text-gray-500 mb-2">{l.custom}:</h4>
        <div className="space-y-3">
          <div><span className="text-[10px] text-green-700 font-medium">✓ {l.pathya}: </span><span className="border-b border-gray-300 inline-block w-[85%] min-h-[14px]">&nbsp;</span></div>
          <div><span className="text-[10px] text-green-700 font-medium">✓ </span><span className="border-b border-gray-300 inline-block w-[92%] min-h-[14px]">&nbsp;</span></div>
          <div><span className="text-[10px] text-red-700 font-medium">✗ {l.apathya}: </span><span className="border-b border-gray-300 inline-block w-[85%] min-h-[14px]">&nbsp;</span></div>
          <div><span className="text-[10px] text-red-700 font-medium">✗ </span><span className="border-b border-gray-300 inline-block w-[92%] min-h-[14px]">&nbsp;</span></div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t text-[9px] text-gray-400 flex justify-between">
        <span>Source: CCRAS, Dept. of AYUSH, Govt. of India</span>
        <span>{l.poweredBy}</span>
      </div>
    </div>
  );
}
