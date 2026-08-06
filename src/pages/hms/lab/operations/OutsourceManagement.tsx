import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OutsourceManagement = () => {
  const [location, setLocation] = useState("loc1");
  const [department, setDepartment] = useState("Laboratory");
  const [startDate, setStartDate] = useState("2026-07-22");
  const [endDate, setEndDate] = useState("2026-07-22");
  const [activeTab, setActiveTab] = useState("outsource");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={activeTab === "outsource" ? "default" : "outline"} onClick={() => setActiveTab("outsource")} className={activeTab === "outsource" ? "bg-orange-600" : "text-orange-600 border-orange-300"}>Outsource</Button>
        <Button size="sm" variant={activeTab === "newTrf" ? "default" : "outline"} onClick={() => setActiveTab("newTrf")} className={activeTab === "newTrf" ? "bg-orange-600" : "text-orange-600 border-orange-300"}>New TRF</Button>
        <Button size="sm" variant={activeTab === "viewTrf" ? "default" : "outline"} onClick={() => setActiveTab("viewTrf")} className={activeTab === "viewTrf" ? "bg-orange-600" : "text-orange-600 border-orange-300"}>View TRF</Button>
        <Button size="sm" variant={activeTab === "status" ? "default" : "outline"} onClick={() => setActiveTab("status")} className={activeTab === "status" ? "bg-blue-600" : "text-blue-600 border-blue-300"}>Status</Button>
        <Button size="sm" variant={activeTab === "search" ? "default" : "outline"} onClick={() => setActiveTab("search")} className={activeTab === "search" ? "bg-green-600" : "text-green-600 border-green-300"}>Search</Button>
        <Button size="sm" variant={activeTab === "revert" ? "default" : "outline"} onClick={() => setActiveTab("revert")} className={activeTab === "revert" ? "bg-red-600" : "text-red-600 border-red-300"}>Revert</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Outsource Management</h2></div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}><SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select>
        <Select value={department} onValueChange={setDepartment}><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laboratory">Laboratory</SelectItem><SelectItem value="Radiology">Radiology</SelectItem></SelectContent></Select>
        <span className="text-xs">Start Date</span><Input type="date" className="h-8 text-xs w-[120px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span className="text-xs">End Date</span><Input type="date" className="h-8 text-xs w-[120px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>

      <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No outsourced orders found for the selected period.</CardContent></Card>
    </div>
  );
};

export default OutsourceManagement;
