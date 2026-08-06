import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

const ManageOrder = () => {
  const [location, setLocation] = useState("loc1");
  const [department, setDepartment] = useState("Laboratory");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("");
  const [startDate, setStartDate] = useState("2026-07-22");
  const [endDate, setEndDate] = useState("2026-07-22");
  const [tab, setTab] = useState("lab");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      {/* Tab: Lab | Misc */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="lab">Lab</TabsTrigger>
          <TabsTrigger value="misc">Misc</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage Order</h2></div>

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
            <SelectItem value="AYUSH">AYUSH</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue placeholder="ALL" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            <SelectItem value="Ordered">Ordered</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Dispatched">Dispatched</SelectItem>
          </SelectContent>
        </Select>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="" /></SelectTrigger>
          <SelectContent></SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[120px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[120px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div>
        <div className="relative w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-green-600">Patient</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Referred By</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Provider</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No data available in table</td></tr>
            </tbody>
          </table>
          <div className="px-4 py-3 border-t text-sm text-muted-foreground">Showing 0 to 0 of 0 entries</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageOrder;
