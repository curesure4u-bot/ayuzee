import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Languages, Printer, MessageCircle, Brain } from "lucide-react";

const englishRx = [
  { name: "Simhanada Guggulu", dose: "2 tablets", freq: "Twice daily after food", duration: "30 days" },
  { name: "Rasnasaptakam Kashayam", dose: "15ml with 45ml warm water", freq: "Twice daily before food", duration: "30 days" },
  { name: "Kottamchukkadi Taila", dose: "Apply on joints", freq: "At night before sleep", duration: "30 days" },
  { name: "Ashwagandha Churna", dose: "3 grams with warm milk", freq: "Once at bedtime", duration: "30 days" },
];

const tamilRx = [
  { name: "சிம்ஹநாத குக்குலு", dose: "2 மாத்திரைகள்", freq: "தினமும் இரண்டு வேளை உணவுக்குப் பின்", duration: "30 நாட்கள்" },
  { name: "ரஸ்நாசப்தகம் கஷாயம்", dose: "15 மி.லி + 45 மி.லி வெந்நீர்", freq: "தினமும் இரண்டு வேளை உணவுக்கு முன்", duration: "30 நாட்கள்" },
  { name: "கொட்டம்சுக்காடி தைலம்", dose: "மூட்டுகளில் தடவுக", freq: "இரவு தூங்குமுன்", duration: "30 நாட்கள்" },
  { name: "அஸ்வகந்தா சூர்ணம்", dose: "3 கிராம் + வெதுவெதுப்பான பால்", freq: "இரவு படுக்கும்போது", duration: "30 நாட்கள்" },
];

const DoctorRegionalRx = () => {
  const [language, setLanguage] = useState("Tamil");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Languages className="h-6 w-6 text-blue-600" /> Regional Language Prescription (AI)</h1>
          <p className="text-muted-foreground mt-1">AI-translated prescriptions in patient's preferred language</p>
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem><SelectItem value="Hindi">Hindi (हिन्दी)</SelectItem><SelectItem value="Malayalam">Malayalam (മലയാളം)</SelectItem><SelectItem value="Telugu">Telugu (తెలుగు)</SelectItem><SelectItem value="Kannada">Kannada (ಕನ್ನಡ)</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 bg-blue-50"><CardTitle className="text-base">English Prescription</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-2">Medicine</th><th className="text-left p-2">Dose</th><th className="text-left p-2">Frequency</th><th className="text-left p-2">Duration</th></tr></thead>
              <tbody>{englishRx.map((r, i) => <tr key={i} className="border-b"><td className="p-2 font-medium">{r.name}</td><td className="p-2">{r.dose}</td><td className="p-2">{r.freq}</td><td className="p-2">{r.duration}</td></tr>)}</tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 bg-green-50"><CardTitle className="text-base">{language} Prescription (AI Translated)</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-2">மருந்து</th><th className="text-left p-2">அளவு</th><th className="text-left p-2">எப்போது</th><th className="text-left p-2">காலம்</th></tr></thead>
              <tbody>{tamilRx.map((r, i) => <tr key={i} className="border-b"><td className="p-2 font-medium">{r.name}</td><td className="p-2">{r.dose}</td><td className="p-2">{r.freq}</td><td className="p-2">{r.duration}</td></tr>)}</tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Translation Note</p><p className="text-sm text-purple-700">Translated with medical accuracy. Dosage instructions simplified for patient comprehension. Medicine names kept in original Sanskrit/Ayurvedic form with Tamil phonetic transliteration.</p></div></CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => toast.success(`${language} Rx sent to printer`)}><Printer className="h-4 w-4 mr-1" /> Print {language} Rx</Button>
        <Button variant="outline" onClick={() => toast.success(`${language} Rx sent via WhatsApp`)}><MessageCircle className="h-4 w-4 mr-1" /> Send via WhatsApp ({language})</Button>
      </div>
    </div>
  );
};

export default DoctorRegionalRx;
