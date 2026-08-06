import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const CampManagement = () => {
  const [view, setView] = useState<"new" | "manage" | "inactive">("new");
  const [location, setLocation] = useState("loc1");
  const [name, setName] = useState("");
  const [date, setDate] = useState("2026-07-22");
  const [creditProvider, setCreditProvider] = useState("");
  const [tests, setTests] = useState<{ sNo: number; name: string }[]>([]);
  const [newTest, setNewTest] = useState("");

  const handleAddTest = () => {
    if (!newTest.trim()) return;
    setTests([...tests, { sNo: tests.length + 1, name: newTest.trim() }]);
    setNewTest("");
  };

  const handleSave = () => {
    if (!name) { toast.error("Camp name is required"); return; }
    if (!creditProvider) { toast.error("Credit provider is required"); return; }
    toast.success("Camp created successfully");
  };

  if (view === "manage" || view === "inactive") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setView("new")} className="text-orange-600 border-orange-300">New Camp</Button>
          <Button size="sm" variant={view === "manage" ? "default" : "outline"} onClick={() => setView("manage")} className={view === "manage" ? "bg-orange-600" : "text-orange-600 border-orange-300"}>Manage Camp</Button>
          <Button size="sm" variant={view === "inactive" ? "default" : "outline"} onClick={() => setView("inactive")} className={view === "inactive" ? "bg-orange-600" : "text-orange-600 border-orange-300"}>Manage Inactive Camp</Button>
        </div>
        <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">{view === "manage" ? "Manage Camp" : "Manage Inactive Camp"}</h2></div>
        <div className="flex items-center gap-2">
          <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
          <Input type="date" className="h-8 text-xs w-[120px]" defaultValue="2026-07-22" />
          <Input type="date" className="h-8 text-xs w-[120px]" defaultValue="2026-07-22" />
          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
        </div>
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No camps found for the selected criteria.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New Camp</Button>
        <Button size="sm" variant="outline" onClick={() => setView("manage")} className="text-orange-600 border-orange-300">Manage Camp</Button>
        <Button size="sm" variant="outline" onClick={() => setView("inactive")} className="text-orange-600 border-orange-300">Manage Inactive Camp</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">New Camp</h2></div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Camp Info */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Camp Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><Label className="text-xs font-semibold text-red-600">Location * :</Label><Select value={location} onValueChange={setLocation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select></div>
              <div><Label className="text-xs font-semibold text-red-600">Name * :</Label><Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label className="text-xs font-semibold text-red-600">Date * :</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label className="text-xs font-semibold text-red-600">CreditProvider * :</Label><Select value={creditProvider} onValueChange={setCreditProvider}><SelectTrigger><SelectValue placeholder="" /></SelectTrigger><SelectContent><SelectItem value="cp1">Provider A</SelectItem><SelectItem value="cp2">Provider B</SelectItem></SelectContent></Select></div>
            </div>
          </div>

          {/* Test Info */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Test Info</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left">S.No</th><th className="px-3 py-2 text-left">Tests</th><th className="px-3 py-2"></th></tr></thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.sNo} className="border-b"><td className="px-3 py-2">{t.sNo}</td><td className="px-3 py-2">{t.name}</td><td className="px-3 py-2"><button className="text-red-500" onClick={() => setTests(tests.filter(x => x.sNo !== t.sNo))}>x</button></td></tr>
                ))}
                <tr><td className="px-3 py-2"></td><td className="px-3 py-2"><Input placeholder="Particular" value={newTest} onChange={(e) => setNewTest(e.target.value)} className="h-8" /></td><td className="px-3 py-2"><Button size="sm" className="bg-red-600 hover:bg-red-700 h-8" onClick={handleAddTest}>Add</Button></td></tr>
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-8">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampManagement;
