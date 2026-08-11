import { useState, useMemo } from "react";
import { AlertTriangle, Search, Shield, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Interaction {
  drug1: string;
  drug2: string;
  level: "None" | "Mild" | "Moderate" | "Severe" | "Beneficial";
  description: string;
  recommendation: string;
  references: string[];
}

const interactionDatabase: Interaction[] = [
  {
    drug1: "Ashwagandha",
    drug2: "Benzodiazepines",
    level: "Moderate",
    description: "Ashwagandha has GABAergic activity that may enhance the sedative effects of benzodiazepines, leading to excessive drowsiness.",
    recommendation: "Monitor for excessive sedation. Consider dose reduction of benzodiazepine if combination is necessary. Advise patients not to drive.",
    references: ["Bhattacharya SK et al., Phytomedicine 2000", "AYUSH Drug Interaction Database v2.1"],
  },
  {
    drug1: "Ashwagandha",
    drug2: "Thyroid medications",
    level: "Moderate",
    description: "Ashwagandha may stimulate thyroid hormone production (T3/T4), potentially leading to hyperthyroid symptoms when combined with levothyroxine.",
    recommendation: "Monitor thyroid function tests every 4-6 weeks. Adjust thyroid medication dosage as needed.",
    references: ["Sharma AK et al., J Altern Complement Med 2018", "Panda S et al., Pharmacognosy Res 2011"],
  },
  {
    drug1: "Ashwagandha",
    drug2: "Immunosuppressants",
    level: "Moderate",
    description: "Ashwagandha has immunostimulant properties that may counteract the effects of immunosuppressive therapy.",
    recommendation: "Avoid combination in transplant patients. If used, monitor immune markers closely.",
    references: ["Mikolai J et al., J Altern Complement Med 2009"],
  },
  {
    drug1: "Brahmi",
    drug2: "Anticholinergics",
    level: "Moderate",
    description: "Brahmi (Bacopa monnieri) has cholinergic activity that may interact with anticholinergic drugs, causing unpredictable effects.",
    recommendation: "Monitor for changes in cognitive function. May need to adjust anticholinergic dose.",
    references: ["Aguiar S et al., Rejuvenation Res 2013"],
  },
  {
    drug1: "Brahmi",
    drug2: "CNS Depressants",
    level: "Mild",
    description: "Brahmi may have mild sedative effects that add to CNS depressant activity.",
    recommendation: "Advise patients about potential enhanced drowsiness. Generally safe with monitoring.",
    references: ["Stough C et al., Psychopharmacology 2001"],
  },
  {
    drug1: "Guggulu",
    drug2: "Anticoagulants (Warfarin)",
    level: "Severe",
    description: "Guggulu has significant antiplatelet activity and may dramatically increase bleeding risk when combined with warfarin or other anticoagulants.",
    recommendation: "AVOID combination. If unavoidable, monitor INR frequently (every 3-5 days). Watch for signs of bleeding.",
    references: ["Ulbricht C et al., J Herb Pharmacother 2005", "WHO Traditional Medicine Guidelines"],
  },
  {
    drug1: "Guggulu",
    drug2: "Thyroid drugs",
    level: "Moderate",
    description: "Guggulsterones may stimulate thyroid function, enhancing the effects of thyroid medications.",
    recommendation: "Monitor TSH levels. May need to reduce thyroid medication dose.",
    references: ["Tripathi YB et al., Planta Med 1988"],
  },
  {
    drug1: "Triphala",
    drug2: "Antidiabetics",
    level: "Mild",
    description: "Triphala has mild hypoglycemic properties that may add to the blood sugar lowering effect of antidiabetic drugs.",
    recommendation: "Monitor blood glucose regularly. Generally considered safe but watch for hypoglycemia symptoms.",
    references: ["Rajan SS et al., Indian J Exp Biol 2008"],
  },
  {
    drug1: "Triphala",
    drug2: "Anticoagulants",
    level: "Moderate",
    description: "Triphala components (especially Amalaki) have antiplatelet activity that may increase bleeding risk with anticoagulants.",
    recommendation: "Monitor INR if patient is on warfarin. Watch for unusual bruising or bleeding.",
    references: ["Baskaran UL et al., BMC Complement Altern Med 2015"],
  },
  {
    drug1: "Neem",
    drug2: "Antidiabetics",
    level: "Moderate",
    description: "Neem (Azadirachta indica) has significant hypoglycemic activity that may cause additive blood sugar lowering with antidiabetic medications.",
    recommendation: "Monitor blood glucose closely. May need to reduce antidiabetic dose. Risk of hypoglycemia.",
    references: ["Sunarwidhi AL et al., J Ethnopharmacol 2014"],
  },
  {
    drug1: "Neem",
    drug2: "Immunosuppressants",
    level: "Moderate",
    description: "Neem has immunostimulant properties that may counteract immunosuppressive therapy.",
    recommendation: "Avoid in transplant patients and those on immunosuppression for autoimmune conditions.",
    references: ["Mukherjee S et al., Indian J Biochem Biophys 1999"],
  },
  {
    drug1: "Turmeric",
    drug2: "Anticoagulants",
    level: "Moderate",
    description: "Curcumin in turmeric inhibits platelet aggregation and may increase bleeding risk with anticoagulants.",
    recommendation: "Monitor INR. Use caution with therapeutic doses of turmeric/curcumin supplements. Culinary use generally safe.",
    references: ["Keihanian F et al., Phytother Res 2018", "Shah BH et al., Biochem Pharmacol 1999"],
  },
  {
    drug1: "Turmeric",
    drug2: "Antidiabetics",
    level: "Mild",
    description: "Curcumin has mild blood sugar lowering properties that may add to antidiabetic effects.",
    recommendation: "Monitor glucose levels. Generally safe but be aware of additive hypoglycemic effect.",
    references: ["Zhang DW et al., Biomed Pharmacother 2013"],
  },
  {
    drug1: "Tulsi",
    drug2: "Anticoagulants",
    level: "Mild",
    description: "Tulsi (Holy Basil) has mild antiplatelet activity that may slightly increase bleeding tendency.",
    recommendation: "Monitor for unusual bruising. Generally low risk but inform patients.",
    references: ["Sethi J et al., Indian J Physiol Pharmacol 2004"],
  },
  {
    drug1: "Arjuna",
    drug2: "Cardiac glycosides",
    level: "Moderate",
    description: "Terminalia arjuna has inotropic effects that may be additive with cardiac glycosides like digoxin, risking toxicity.",
    recommendation: "Monitor digoxin levels and ECG. Watch for signs of digoxin toxicity (nausea, visual disturbances, arrhythmia).",
    references: ["Dwivedi S et al., J Assoc Physicians India 2007"],
  },
  {
    drug1: "Arjuna",
    drug2: "Antihypertensives",
    level: "Mild",
    description: "Arjuna has mild hypotensive effects that may add to antihypertensive therapy.",
    recommendation: "Monitor blood pressure. May be a beneficial combination with proper monitoring.",
    references: ["Bharani A et al., Int J Cardiol 2002"],
  },
  {
    drug1: "Shankhpushpi",
    drug2: "Antiepileptics",
    level: "Moderate",
    description: "Shankhpushpi (Convolvulus pluricaulis) may alter the bioavailability and metabolism of antiepileptic drugs like phenytoin.",
    recommendation: "Monitor serum drug levels of antiepileptics. Watch for breakthrough seizures or toxicity signs.",
    references: ["Agarwa P et al., Indian J Pharmacol 2014"],
  },
  {
    drug1: "Licorice (Yashtimadhu)",
    drug2: "Digoxin",
    level: "Severe",
    description: "Glycyrrhizin in licorice causes potassium depletion (hypokalemia), which dramatically increases the risk of digoxin toxicity and fatal arrhythmias.",
    recommendation: "AVOID combination. If licorice must be used, monitor potassium and digoxin levels closely. Use DGL (deglycyrrhizinated licorice) as safer alternative.",
    references: ["Stormer FC et al., Food Chem Toxicol 1993", "European Medicines Agency monograph"],
  },
  {
    drug1: "Licorice (Yashtimadhu)",
    drug2: "Antihypertensives",
    level: "Severe",
    description: "Licorice causes sodium retention and potassium excretion, leading to pseudoaldosteronism that directly counteracts antihypertensive therapy.",
    recommendation: "AVOID combination. Can cause treatment failure and hypertensive crisis. Use DGL formulation if licorice benefits needed.",
    references: ["Sigurjonsdottir HA et al., J Hum Hypertens 2001"],
  },
  {
    drug1: "Licorice (Yashtimadhu)",
    drug2: "Diuretics",
    level: "Moderate",
    description: "Both licorice and diuretics (especially thiazides and loop diuretics) can cause potassium depletion, risking dangerous hypokalemia.",
    recommendation: "Monitor serum potassium. Consider potassium supplementation if combination is used. Prefer potassium-sparing diuretics.",
    references: ["Farese RV et al., N Engl J Med 1991"],
  },
  {
    drug1: "Sarpagandha",
    drug2: "Antihypertensives",
    level: "Severe",
    description: "Sarpagandha (Rauwolfia serpentina) contains reserpine which has potent hypotensive effects. Combination may cause dangerous hypotension.",
    recommendation: "AVOID combination or use with extreme caution. Monitor BP closely. Risk of syncope and organ hypoperfusion.",
    references: ["Lobay D et al., Integr Med 2015", "Indian Pharmacopoeia Commission"],
  },
  {
    drug1: "Sarpagandha",
    drug2: "Levodopa",
    level: "Moderate",
    description: "Reserpine in Sarpagandha depletes dopamine stores, directly counteracting the therapeutic effect of levodopa in Parkinson's disease.",
    recommendation: "AVOID combination. Will reduce efficacy of levodopa therapy. Choose alternative AYUSH herbs for these patients.",
    references: ["Carlsson A et al., Pharmacol Rev 1965"],
  },
  {
    drug1: "Haridra (Turmeric)",
    drug2: "Chemotherapy",
    level: "Moderate",
    description: "Curcumin may alter CYP450 enzyme activity affecting metabolism of chemotherapy agents. May both enhance and inhibit drug effects unpredictably.",
    recommendation: "Discuss with oncologist before combining. Time administration separately if used. Evidence is mixed.",
    references: ["Hejazi J et al., Nutr Cancer 2016", "Shehzad A et al., BioFactors 2013"],
  },
  {
    drug1: "Pippali",
    drug2: "Phenytoin",
    level: "Moderate",
    description: "Piperine in Pippali (Long pepper) inhibits CYP3A4 and P-glycoprotein, significantly increasing bioavailability and serum levels of phenytoin.",
    recommendation: "Monitor phenytoin levels closely. May need to reduce phenytoin dose by 20-30% if Pippali is co-administered.",
    references: ["Bano G et al., Eur J Clin Pharmacol 1991"],
  },
  {
    drug1: "Ginger (Sunthi)",
    drug2: "Anticoagulants",
    level: "Mild",
    description: "Ginger has mild antiplatelet activity through thromboxane synthetase inhibition. Low risk but may add to anticoagulant effect.",
    recommendation: "Generally safe at culinary doses. Monitor at therapeutic doses (>4g/day). Inform patients about signs of bleeding.",
    references: ["Marx W et al., Eur J Nutr 2017"],
  },
  {
    drug1: "Garlic (Lasuna)",
    drug2: "Anticoagulants",
    level: "Moderate",
    description: "Garlic has significant antiplatelet and fibrinolytic activity (ajoene compound) that may increase bleeding risk with anticoagulants.",
    recommendation: "Discontinue garlic supplements 7-10 days before surgery. Monitor INR with warfarin. Culinary amounts generally safe.",
    references: ["Rahman K et al., J Nutr 2006", "Tattelman E et al., Am Fam Physician 2005"],
  },
  {
    drug1: "Garlic (Lasuna)",
    drug2: "Antihypertensives",
    level: "Mild",
    description: "Garlic has mild antihypertensive properties that may add to blood pressure lowering medications.",
    recommendation: "Monitor blood pressure. May be a beneficial adjunct with proper monitoring.",
    references: ["Ried K et al., BMC Cardiovasc Disord 2008"],
  },
  {
    drug1: "Amalaki",
    drug2: "Iron supplements",
    level: "Beneficial",
    description: "Amalaki (Indian Gooseberry) is rich in Vitamin C which significantly enhances iron absorption from supplements. This is a beneficial interaction.",
    recommendation: "Encourage combination. Take Amalaki with iron supplements to improve absorption by 2-3 fold. Excellent for iron deficiency anemia.",
    references: ["Sharma DC et al., Indian J Clin Biochem 2004"],
  },
  {
    drug1: "Shilajit",
    drug2: "Antidiabetics",
    level: "Mild",
    description: "Shilajit has mild hypoglycemic properties through multiple mechanisms including improved insulin sensitivity.",
    recommendation: "Monitor blood glucose. Generally safe but watch for hypoglycemia especially with sulfonylureas.",
    references: ["Trivedi NA et al., Phytomedicine 2004"],
  },
  {
    drug1: "Kutki",
    drug2: "Hepatotoxic drugs",
    level: "Beneficial",
    description: "Kutki (Picrorhiza kurroa) has strong hepatoprotective properties and may protect the liver from drug-induced damage.",
    recommendation: "Consider adding Kutki as hepatoprotective support when prescribing known hepatotoxic drugs (ATT, statins, methotrexate). Beneficial combination.",
    references: ["Thyagarajan SP et al., Lancet 1988", "Vaidya AB et al., J Postgrad Med 1996"],
  },
];

const safeCombinations = [
  { combo: "Triphala + Probiotics", note: "Synergistic gut health support — Triphala acts as prebiotic" },
  { combo: "Ashwagandha + Vitamin D", note: "Complementary stress and bone support without interaction" },
  { combo: "Turmeric + Black Pepper (Trikatu)", note: "Piperine enhances curcumin bioavailability by 2000%" },
  { combo: "Amalaki + Iron supplements", note: "Vitamin C in Amalaki enhances iron absorption significantly" },
  { combo: "Brahmi + Omega-3 fatty acids", note: "Complementary cognitive support — no known interactions" },
  { combo: "Guduchi + Multivitamins", note: "Safe immunomodulator — no interference with vitamin absorption" },
];

const allDrugs = Array.from(
  new Set(interactionDatabase.flatMap((i) => [i.drug1, i.drug2]))
).sort();

export default function DrugHerbInteractionChecker() {
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [result, setResult] = useState<Interaction | null>(null);
  const [searched, setSearched] = useState(false);

  const suggestions1 = useMemo(
    () =>
      drug1.length > 0
        ? allDrugs.filter((d) => d.toLowerCase().includes(drug1.toLowerCase()))
        : [],
    [drug1]
  );

  const suggestions2 = useMemo(
    () =>
      drug2.length > 0
        ? allDrugs.filter((d) => d.toLowerCase().includes(drug2.toLowerCase()))
        : [],
    [drug2]
  );

  const checkInteraction = () => {
    if (!drug1.trim() || !drug2.trim()) {
      toast.error("Please enter both drugs/medicines to check interaction");
      return;
    }

    const found = interactionDatabase.find(
      (i) =>
        (i.drug1.toLowerCase().includes(drug1.toLowerCase()) &&
          i.drug2.toLowerCase().includes(drug2.toLowerCase())) ||
        (i.drug1.toLowerCase().includes(drug2.toLowerCase()) &&
          i.drug2.toLowerCase().includes(drug1.toLowerCase()))
    );

    setResult(found || null);
    setSearched(true);

    if (found) {
      if (found.level === "Severe") {
        toast.error("Severe interaction detected! Review recommendation carefully.");
      } else if (found.level === "Beneficial") {
        toast.success("Beneficial interaction found!");
      } else {
        toast.info("Interaction information found.");
      }
    } else {
      toast.info("No known interaction found in database.");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Severe":
        return "bg-red-100 text-red-800 border-red-300";
      case "Moderate":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Mild":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Beneficial":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Severe":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "Moderate":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "Beneficial":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Drug-Herb Interaction Checker
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Check for potential interactions between modern drugs and Ayurvedic/Homeopathic medicines.
          Based on published literature and AYUSH pharmacovigilance data.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drug 1 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drug/Medicine 1
              </label>
              <Input
                placeholder="e.g., Ashwagandha, Warfarin..."
                value={drug1}
                onChange={(e) => {
                  setDrug1(e.target.value);
                  setShowSuggestions1(true);
                }}
                onFocus={() => setShowSuggestions1(true)}
                onBlur={() => setTimeout(() => setShowSuggestions1(false), 200)}
              />
              {showSuggestions1 && suggestions1.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {suggestions1.map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      onMouseDown={() => {
                        setDrug1(s);
                        setShowSuggestions1(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drug 2 */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drug/Medicine 2
              </label>
              <Input
                placeholder="e.g., Turmeric, Metformin..."
                value={drug2}
                onChange={(e) => {
                  setDrug2(e.target.value);
                  setShowSuggestions2(true);
                }}
                onFocus={() => setShowSuggestions2(true)}
                onBlur={() => setTimeout(() => setShowSuggestions2(false), 200)}
              />
              {showSuggestions2 && suggestions2.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {suggestions2.map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      onMouseDown={() => {
                        setDrug2(s);
                        setShowSuggestions2(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button onClick={checkInteraction} className="w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Check Interaction
          </Button>
        </CardContent>
      </Card>

      {/* Result Section */}
      {searched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interaction Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                <div className="flex items-center gap-3">
                  {getLevelIcon(result.level)}
                  <span className="font-medium">Interaction Level:</span>
                  <Badge className={getLevelColor(result.level)}>
                    {result.level}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {result.drug1} + {result.drug2}
                  </h4>
                  <p className="text-gray-700">{result.description}</p>
                </div>

                <div className={`p-4 rounded-lg ${
                  result.level === "Severe" ? "bg-red-50 border border-red-200" :
                  result.level === "Beneficial" ? "bg-green-50 border border-green-200" :
                  "bg-orange-50 border border-orange-200"
                }`}>
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Clinical Recommendation
                  </h4>
                  <p className="text-sm">{result.recommendation}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 text-sm mb-1">References:</h4>
                  <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                    {result.references.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-medium text-green-700">
                  No Known Interaction Found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  No interaction between "{drug1}" and "{drug2}" was found in our database.
                  This does not guarantee safety — always use clinical judgment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Safe Combinations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Common Safe Combinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safeCombinations.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="font-medium text-green-800 text-sm">{item.combo}</p>
                <p className="text-xs text-green-600 mt-1">{item.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        This tool is for clinical reference only. Always verify interactions with updated pharmacovigilance databases and use clinical judgment.
        Data sourced from published Ayurvedic pharmacology literature and AYUSH interaction databases.
      </p>
    </div>
  );
}
