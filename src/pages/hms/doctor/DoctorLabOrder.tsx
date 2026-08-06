import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FlaskConical, Plus, Brain, Search, CheckCircle } from "lucide-react";

const quickTests = ["CBC", "LFT", "RFT", "Lipid Profile", "HbA1c", "Thyroid (TSH)", "Urine R/M", "ESR/CRP", "X-ray LS Spine", "Blood Sugar (F/PP)"];

const existingOrders = [
  { test: "CBC (Complete Blood Count)", priority: "Routine", status: "Completed", date: "20/07/2026", result: "Hb: 12.5, WBC: 7800, Plt: 2.5L" },
  { test: "ESR", priority: "Routine", status: "Completed", date: "20/07/2026", result: "ESR: 42 mm/hr (High)" },
  { test: "CRP (Quantitative)", priority: "Urgent", status: "In Progress", date: "22/07/2026", result: "Pending" },
  { test: "X-ray LS Spine (AP/Lat)", priority: "Routine", status: "Ordered", date: "22/07/2026", result: "—" },
];

const DoctorLabOrder = () => {
  const [patient] = useState("Mr. Nagaraj (AL-8472)");
  const [searchTest, setSearchTest] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const addTest = (test: string) => {
    if (!selectedTests.includes(test)) {
      setSelectedTests([...selectedTests, test]);
      toast.success(`${test} added to order`);
    }
  };

  const placeOrder = () => {
    if (selectedTests.length === 0) return toast.error("Select at least one test");
    toast.success(`${selectedTests.length} tests ordered for ${patient}`);
    setSelectedTests([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-blue-600" /> Order Investigation / Lab Test</h1>
          <p className="text-muted-foreground">Patient: <strong>{patient}</strong></p>
        </div>
      </div>

      {/* AI Suggestion */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div><p className="font-semibold text-purple-800">AI Recommendation</p><p className="text-sm text-purple-700 mt-1">Based on patient's condition (Amavata + Methotrexate use), recommend: CBC, LFT, ESR/CRP for monthly monitoring. HbA1c due (last done 3 months ago).</p></div>
        </CardContent>
      </Card>

      {/* Quick Test Buttons */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Quick Order — Common Tests</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickTests.map(t => (
              <Button key={t} size="sm" variant={selectedTests.includes(t) ? "default" : "outline"} className="text-xs" onClick={() => addTest(t)}>
                {selectedTests.includes(t) && <CheckCircle className="h-3 w-3 mr-1" />}{t}
              </Button>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search other tests..." className="pl-8" value={searchTest} onChange={(e) => setSearchTest(e.target.value)} /></div>
            <Button variant="outline" onClick={() => { if (searchTest) { addTest(searchTest); setSearchTest(""); } }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
          {selectedTests.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected Tests ({selectedTests.length}):</p>
              <div className="flex flex-wrap gap-1">{selectedTests.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={placeOrder}><FlaskConical className="h-3 w-3 mr-1" /> Place Order</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Added to patient bill")}>Add to Bill</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Orders */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Existing Orders for this Patient</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50"><tr>
              <th className="px-3 py-2 text-left">Test</th><th className="px-3 py-2 text-center">Priority</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Result</th>
            </tr></thead>
            <tbody>{existingOrders.map((o, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{o.test}</td>
                <td className="px-3 py-2 text-center"><Badge variant={o.priority === "Urgent" ? "destructive" : "secondary"} className="text-[10px]">{o.priority}</Badge></td>
                <td className="px-3 py-2 text-center"><Badge variant={o.status === "Completed" ? "outline" : o.status === "In Progress" ? "default" : "secondary"} className={`text-[10px] ${o.status === "Completed" ? "text-green-600" : ""}`}>{o.status}</Badge></td>
                <td className="px-3 py-2 text-xs">{o.date}</td>
                <td className="px-3 py-2 text-xs">{o.result}</td>
              </tr>
            ))}</tbody>
          </table>
        </div></CardContent>
      </Card>
    </div>
  );
};

export default DoctorLabOrder;
