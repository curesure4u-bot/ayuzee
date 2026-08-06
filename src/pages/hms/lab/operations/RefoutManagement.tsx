import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RefoutManagement = () => {
  const [location, setLocation] = useState("loc1");
  const [startDate, setStartDate] = useState("2026-07-22");
  const [endDate, setEndDate] = useState("2026-07-22");

  return (
    <div className="space-y-4">
      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">RefOut Management</h2></div>
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
        <span className="text-xs">Start Date</span><Input type="date" className="h-8 text-xs w-[120px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span className="text-xs">End Date</span><Input type="date" className="h-8 text-xs w-[120px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>
      <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No refout records found for the selected period.</CardContent></Card>
    </div>
  );
};

export default RefoutManagement;
