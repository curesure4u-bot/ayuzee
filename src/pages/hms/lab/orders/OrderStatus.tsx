import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrderStatus = () => {
  const [location, setLocation] = useState("loc1");
  const [department, setDepartment] = useState("Laboratory");
  const [startDate, setStartDate] = useState("2026-07-22");
  const [endDate, setEndDate] = useState("2026-07-22");
  const [viewType, setViewType] = useState("patient");

  return (
    <div className="space-y-4">
      {/* Top Sub-nav Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Status</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Communication</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Search</Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-300">Revert</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Export</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Dispatch</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Order</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Staged Test Orders</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Status</h2></div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
        </Select>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Laboratory">Laboratory</SelectItem>
            <SelectItem value="Radiology">Radiology</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[120px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[120px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>

      {/* View Type */}
      <div className="flex gap-4 text-sm">
        <button className={`${viewType === "patient" ? "font-bold text-black" : "text-orange-600"}`} onClick={() => setViewType("patient")}>Patient Wise</button>
        <button className={`${viewType === "department" ? "font-bold text-black" : "text-orange-600"}`} onClick={() => setViewType("department")}>Department Wise</button>
        <button className={`${viewType === "test" ? "font-bold text-black" : "text-orange-600"}`} onClick={() => setViewType("test")}>Test Wise</button>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          No orders found for the selected criteria. Use filters above and click "Go".
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatus;
