import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Printer } from "lucide-react";

const PrintWorklist = () => {
  const [department, setDepartment] = useState("Laboratory");
  const [location, setLocation] = useState("loc1");
  const [status, setStatus] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [date, setDate] = useState("2026-07-22");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [filterBy, setFilterBy] = useState("Department");
  const [filterValue, setFilterValue] = useState("ALL");
  const [includeTests, setIncludeTests] = useState(true);
  const [includeBarcode, setIncludeBarcode] = useState(true);
  const [descendingOrder, setDescendingOrder] = useState(false);
  const [excludePrinted, setExcludePrinted] = useState(false);

  const departments = ["ALL", "HAEMATOLOGY", "BIOCHEMISTRY", "ENDOCRINOLOGY", "HORMONES", "IMMUNOLOGY", "SEROLOGY", "FLUIDS", "MICROBIOLOGY", "CLINICAL PATHOLOGY", "AYUSH"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Generated WorkList</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Print Worklist</h2></div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Top Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={department} onValueChange={setDepartment}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laboratory">Laboratory</SelectItem><SelectItem value="Radiology">Radiology</SelectItem></SelectContent></Select>
            <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
            <Input className="h-8 text-xs w-[120px]" placeholder="Select status" value={status} onChange={(e) => setStatus(e.target.value)} />
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" className="h-8 text-xs w-[120px]" value={date} onChange={(e) => setDate(e.target.value)} />
            <span className="text-xs">start</span><Input type="time" className="h-8 text-xs w-[90px]" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <span className="text-xs">end</span><Input type="time" className="h-8 text-xs w-[90px]" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-xs font-semibold">Filters</Label>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Order No">Order No</SelectItem>
                  <SelectItem value="Sample Id">Sample Id</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <Label className="text-xs font-semibold">Options</Label>
            <div className="flex items-center gap-1"><Checkbox checked={includeTests} onCheckedChange={(v) => setIncludeTests(v as boolean)} /><span className="text-xs">Include Tests</span></div>
            <div className="flex items-center gap-1"><Checkbox checked={includeBarcode} onCheckedChange={(v) => setIncludeBarcode(v as boolean)} /><span className="text-xs">Include Barcode</span></div>
            <div className="flex items-center gap-1"><Checkbox checked={descendingOrder} onCheckedChange={(v) => setDescendingOrder(v as boolean)} /><span className="text-xs">Descending Order</span></div>
            <div className="flex items-center gap-1"><Checkbox checked={excludePrinted} onCheckedChange={(v) => setExcludePrinted(v as boolean)} /><span className="text-xs">Exclude Printed</span></div>
          </div>

          <Button className="bg-red-600 hover:bg-red-700" onClick={() => toast.success("Worklist generated for printing")}>
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintWorklist;
