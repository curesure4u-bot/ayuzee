import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { GraduationCap, Award, Calendar, ExternalLink } from "lucide-react";

const cmeRecords = [
  { title: "Panchakarma in Autoimmune Disorders", provider: "CCRAS Webinar", date: "15/06/2026", credits: 4, status: "Completed" },
  { title: "AYUSH-Allopathy Integrative Protocols", provider: "AIIA Delhi", date: "02/05/2026", credits: 6, status: "Completed" },
  { title: "AI in Ayurveda Clinical Practice", provider: "Ayuzee Academy", date: "20/04/2026", credits: 3, status: "Completed" },
  { title: "Drug Interactions: AYUSH + Modern Medicine", provider: "WHO-TM Collab", date: "10/03/2026", credits: 5, status: "Completed" },
  { title: "Advanced Agnikarma Techniques", provider: "MUHS Nashik", date: "Upcoming - Aug 2026", credits: 8, status: "Enrolled" },
];

const DoctorCme = () => {
  const totalCredits = cmeRecords.filter(c => c.status === "Completed").reduce((s, c) => s + c.credits, 0);
  const requiredCredits = 30;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6 text-blue-600" /> CME / CPD Credit Tracking</h1>
          <p className="text-muted-foreground mt-1">Track Continuing Medical Education credits for license renewal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><Award className="h-5 w-5 mx-auto text-amber-500" /><p className="text-2xl font-bold mt-1">{totalCredits}</p><p className="text-xs text-muted-foreground">Credits Earned</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{requiredCredits}</p><p className="text-xs text-muted-foreground">Required (Annual)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Progress value={(totalCredits/requiredCredits)*100} className="h-3 mt-2" /><p className="text-sm font-bold mt-1">{Math.round((totalCredits/requiredCredits)*100)}%</p><p className="text-xs text-muted-foreground">Completion</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">CME Records</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Course/Webinar</th><th className="px-3 py-2 text-left">Provider</th><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-center">Credits</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
            <tbody>{cmeRecords.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{c.title}</td>
                <td className="px-3 py-2 text-muted-foreground">{c.provider}</td>
                <td className="px-3 py-2 text-center text-xs">{c.date}</td>
                <td className="px-3 py-2 text-center font-bold">{c.credits}</td>
                <td className="px-3 py-2 text-center"><Badge variant={c.status === "Completed" ? "outline" : "default"} className={`text-[10px] ${c.status === "Completed" ? "text-green-600" : ""}`}>{c.status}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div></CardContent>
      </Card>

      <Button variant="outline" onClick={() => toast.info("Opening course catalog...")}><ExternalLink className="h-4 w-4 mr-1" /> Browse CME Courses</Button>
    </div>
  );
};

export default DoctorCme;
