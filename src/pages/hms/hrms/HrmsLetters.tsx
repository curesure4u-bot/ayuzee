import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileSignature, Plus, Printer, Download, FileText } from "lucide-react";

const MOCK_LETTERS = [
  { id: "l1", employeeName: "Anita D", type: "appointment", subject: "Appointment Letter", issuedDate: "2024-08-01", delivered: true, acknowledged: true },
  { id: "l2", employeeName: "Dr. Arun Sharma", type: "increment", subject: "Annual Increment Letter - 2026", issuedDate: "2026-04-01", delivered: true, acknowledged: true },
  { id: "l3", employeeName: "Preethi S", type: "offer", subject: "Offer Letter - Therapist", issuedDate: "2026-07-20", delivered: true, acknowledged: true },
  { id: "l4", employeeName: "Mohan P", type: "warning", subject: "First Written Warning - Attendance", issuedDate: "2026-07-15", delivered: true, acknowledged: false },
  { id: "l5", employeeName: "Kavita S", type: "confirmation", subject: "Confirmation Letter", issuedDate: "2022-12-15", delivered: true, acknowledged: true },
];

const TEMPLATES = [
  { id: "tp1", name: "Offer Letter", type: "offer", description: "Pre-joining offer with CTC details" },
  { id: "tp2", name: "Appointment Letter", type: "appointment", description: "Post-joining formal appointment" },
  { id: "tp3", name: "Confirmation Letter", type: "confirmation", description: "After probation confirmation" },
  { id: "tp4", name: "Increment Letter", type: "increment", description: "Annual increment communication" },
  { id: "tp5", name: "Experience Certificate", type: "experience", description: "On exit/request" },
  { id: "tp6", name: "Relieving Letter", type: "relieving", description: "Post full & final settlement" },
  { id: "tp7", name: "Warning Letter", type: "warning", description: "Disciplinary warning" },
  { id: "tp8", name: "Transfer Letter", type: "transfer", description: "Branch/department transfer" },
];

const typeColors: Record<string, string> = {
  offer: "bg-blue-100 text-blue-700", appointment: "bg-green-100 text-green-700",
  confirmation: "bg-emerald-100 text-emerald-700", increment: "bg-purple-100 text-purple-700",
  warning: "bg-red-100 text-red-700", experience: "bg-amber-100 text-amber-700",
  relieving: "bg-slate-100 text-slate-700", transfer: "bg-cyan-100 text-cyan-700",
};

const HrmsLetters = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileSignature className="h-6 w-6 text-purple-600" /> HR Letters</h1>
        <p className="text-sm text-muted-foreground">Generate, issue & track HR letters and certificates</p>
      </div>
      <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Generate Letter</Button>
    </div>

    {/* Templates */}
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Letter Templates</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="border rounded-lg p-3 hover:bg-muted/30 cursor-pointer transition" onClick={() => toast.info(`Generate ${t.name}`)}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Badge className={`text-[8px] border-0 ${typeColors[t.type] || "bg-gray-100"}`}>{t.type}</Badge>
              </div>
              <p className="text-xs font-medium">{t.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Issued Letters */}
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Issued Letters</CardTitle></CardHeader>
      <CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/40"><tr>
            <th className="px-3 py-2 text-left font-medium">Employee</th>
            <th className="px-3 py-2 text-left font-medium">Letter</th>
            <th className="px-3 py-2 text-center font-medium">Type</th>
            <th className="px-3 py-2 text-center font-medium">Issued</th>
            <th className="px-3 py-2 text-center font-medium">Acknowledged</th>
            <th className="px-3 py-2 text-center font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {MOCK_LETTERS.map((l) => (
              <tr key={l.id} className="border-b hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{l.employeeName}</td>
                <td className="px-3 py-2">{l.subject}</td>
                <td className="px-3 py-2 text-center"><Badge className={`text-[8px] border-0 capitalize ${typeColors[l.type]}`}>{l.type}</Badge></td>
                <td className="px-3 py-2 text-center text-[10px]">{new Date(l.issuedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-3 py-2 text-center">{l.acknowledged ? <Badge className="text-[8px] bg-green-100 text-green-700 border-0">Yes</Badge> : <Badge className="text-[8px] bg-amber-100 text-amber-700 border-0">Pending</Badge>}</td>
                <td className="px-3 py-2 text-center"><div className="flex justify-center gap-1">
                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0"><Printer className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0"><Download className="h-3 w-3" /></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent>
    </Card>
  </div>
);

export default HrmsLetters;
