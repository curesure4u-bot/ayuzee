import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home } from "lucide-react";

const HomeCollection = () => {
  const [location, setLocation] = useState("loc1");
  const [startDate, setStartDate] = useState("2026-07-22");
  const [endDate, setEndDate] = useState("2026-07-22");

  return (
    <div className="space-y-4">
      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600 flex items-center justify-center gap-2"><Home className="h-5 w-5" /> Home Collection</h2></div>
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
        <Input type="date" className="h-8 text-xs w-[120px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[120px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8">Go</Button>
      </div>
      <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No home collections scheduled. Patients can request sample collection at their home address.</CardContent></Card>
    </div>
  );
};

export default HomeCollection;
