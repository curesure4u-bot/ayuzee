import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search } from "lucide-react";

const AutoGenerateBarcode = () => {
  const [view, setView] = useState<"new" | "manage">("new");
  const [mode, setMode] = useState<"Container" | "Package">("Container");
  const [location, setLocation] = useState("loc1");
  const [container, setContainer] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [noOfSamples, setNoOfSamples] = useState("");
  const [barcodeLength, setBarcodeLength] = useState("");

  if (view === "manage") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setView("new")} className="text-orange-600 border-orange-300">New</Button>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Generated Barcode</Button>
        </div>
        <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage Generated Barcode</h2></div>
        <div className="flex items-center gap-2">
          <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
          <Input type="date" className="h-8 text-xs w-[120px]" defaultValue="2026-07-22" />
          <Input type="date" className="h-8 text-xs w-[120px]" defaultValue="2026-07-22" />
        </div>
        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div><div className="relative w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8 text-sm" placeholder="Search:" /></div></div>
        <Card><CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50"><tr>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">Generated Time</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">User</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">Start</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">End</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">ContainerID</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">Department</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">No Of Samples</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">Barcode Length</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">Sample Type</th>
              <th className="px-3 py-2 text-left font-semibold text-orange-600">Generate</th>
            </tr></thead>
            <tbody><tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No data available in table</td></tr></tbody>
          </table>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Button size="sm" variant="outline" onClick={() => setView("manage")} className="text-orange-600 border-orange-300">Manage Generated Barcode</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Auto Generate Barcode</h2></div>

      <Card>
        <CardContent className="p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button size="sm" variant={mode === "Container" ? "default" : "outline"} onClick={() => setMode("Container")} className={mode === "Container" ? "bg-blue-600" : ""}>Container</Button>
            <Button size="sm" variant={mode === "Package" ? "default" : "outline"} onClick={() => setMode("Package")} className={mode === "Package" ? "bg-orange-600" : ""}>Package</Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Container</Label>
              <Select value={container} onValueChange={setContainer}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">red</SelectItem>
                  <SelectItem value="blue">blue</SelectItem>
                  <SelectItem value="yellow">yellow</SelectItem>
                  <SelectItem value="purple">purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Sample Type</Label>
              <Select value={sampleType} onValueChange={setSampleType}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">BLOOD</SelectItem>
                  <SelectItem value="serum">SERUM</SelectItem>
                  <SelectItem value="urine">URINE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">No Of Samples</Label>
              <Input placeholder="Sample Id Count" value={noOfSamples} onChange={(e) => setNoOfSamples(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold">BarCode Length</Label>
              <Input placeholder="Barcode Length" value={barcodeLength} onChange={(e) => setBarcodeLength(e.target.value)} />
            </div>
          </div>

          <Button className="bg-green-600 hover:bg-green-700 mt-4" onClick={() => toast.success("Barcodes generated!")}>Generate</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoGenerateBarcode;
