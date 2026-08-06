import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Brain, Shield, Search } from "lucide-react";

const drugs = [
  { name: "Rasnasaptakam Kashayam", schedule: "None", category: "Ayurveda - OTC", dispensing: "No restriction", prescription: "Optional" },
  { name: "Simhanada Guggulu", schedule: "None", category: "Ayurveda - OTC", dispensing: "No restriction", prescription: "Optional" },
  { name: "Swarna Bhasma", schedule: "None", category: "Rasa Shastra - Restricted", dispensing: "Doctor supervision required", prescription: "Mandatory" },
  { name: "Visha Drugs (Aconite prep)", schedule: "Schedule E1", category: "Poisonous - Restricted", dispensing: "Registered practitioner only", prescription: "Mandatory + Record" },
  { name: "Cannabis-based (Vijaya)", schedule: "NDPS Act", category: "Narcotic (AYUSH exemption for Bhang)", dispensing: "Special license required", prescription: "Mandatory + NDPS Register" },
  { name: "Methotrexate 15mg", schedule: "Schedule H1", category: "Allopathy - Cytotoxic", dispensing: "Prescription only + record", prescription: "Mandatory" },
  { name: "Prednisolone 5mg", schedule: "Schedule H", category: "Allopathy - Steroid", dispensing: "Prescription only", prescription: "Mandatory" },
  { name: "Paracetamol 500mg", schedule: "None (OTC)", category: "Allopathy - OTC", dispensing: "No restriction", prescription: "Optional" },
];

const DrugSchedule = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-red-600" /> Drug Schedule & Classification</h1><p className="text-muted-foreground mt-1">Legal drug classification for compliant dispensing — AYUSH + Allopathy</p></div>
      </div>

      <div className="flex gap-2 max-w-md"><Search className="h-4 w-4 mt-2 text-muted-foreground" /><Input placeholder="Search medicine for schedule info..." /></div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Drug Schedule Database</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Medicine</th><th className="px-3 py-2 text-center">Schedule</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Dispensing Rule</th><th className="px-3 py-2 text-center">Prescription</th></tr></thead><tbody>
          {drugs.map((d, i) => (<tr key={i} className={`border-b ${d.schedule.includes("NDPS") ? "bg-red-50" : d.schedule.includes("H1") ? "bg-amber-50" : d.schedule.includes("E1") ? "bg-orange-50" : ""}`}><td className="px-3 py-2 font-medium text-xs">{d.name}</td><td className="px-3 py-2 text-center"><Badge variant={d.schedule === "None" || d.schedule === "None (OTC)" ? "outline" : "destructive"} className={`text-[10px] ${d.schedule === "None" || d.schedule === "None (OTC)" ? "text-green-600" : ""}`}>{d.schedule}</Badge></td><td className="px-3 py-2 text-xs">{d.category}</td><td className="px-3 py-2 text-xs">{d.dispensing}</td><td className="px-3 py-2 text-center"><Badge variant={d.prescription === "Mandatory" || d.prescription === "Mandatory + Record" || d.prescription === "Mandatory + NDPS Register" ? "default" : "secondary"} className="text-[10px]">{d.prescription}</Badge></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30"><CardContent className="p-4 text-xs text-blue-700 space-y-1"><p><strong>Schedule H:</strong> Prescription-only drugs (antibiotics, steroids, etc.)</p><p><strong>Schedule H1:</strong> Higher restriction — must maintain sale record (cytotoxics, anti-TB, etc.)</p><p><strong>Schedule E1:</strong> Poisonous substances requiring extra caution in Ayurveda (Vatsanabha, Bhallataka)</p><p><strong>NDPS:</strong> Narcotic and Psychotropic Substances Act — special license + register for cannabis-based AYUSH preparations</p><p><strong>Rasa Shastra:</strong> Mercury/metal-based preparations requiring practitioner supervision</p></CardContent></Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Compliance Check</p><p className="text-sm text-purple-700">HMS auto-blocks dispensing of Schedule H/H1 drugs without valid prescription in system. For Rasa Shastra preparations, AI verifies doctor qualification (MD Rasa Shastra) before allowing prescription. NDPS items require digital log entry — system auto-maintains register.</p></div></CardContent></Card>
    </div>
  );
};

export default DrugSchedule;
