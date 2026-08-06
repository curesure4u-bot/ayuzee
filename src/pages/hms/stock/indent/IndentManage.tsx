import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const IndentManage = () => {
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");
  const [viewType, setViewType] = useState<"open" | "byDate">("byDate");

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/indent/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New Indent</Button>
        </Link>
        <div className="relative">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Indent</Button>
        </div>
        <Link to="/hms/stock/indent/gdn/new">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">New GDN</Button>
        </Link>
        <Link to="/hms/stock/indent/gdn/manage">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">Manage GDN</Button>
        </Link>
      </div>

      {/* View Type Tabs */}
      <div className="flex gap-2">
        <Button size="sm" variant={viewType === "open" ? "default" : "outline"} onClick={() => setViewType("open")} className={viewType === "open" ? "bg-green-600" : ""}>Open Indent</Button>
        <Button size="sm" variant={viewType === "byDate" ? "default" : "outline"} onClick={() => setViewType("byDate")}>Indent By Date</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Indent</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={fromStore} onValueChange={setFromStore}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="From store" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
          </SelectContent>
        </Select>
        <Select value={toStore} onValueChange={setToStore}>
          <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="To store" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
            <SelectItem value="theni">Al Shifa Ayush Center Theni</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Indent No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Order Date</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Requested By</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Requested To</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Ordered By</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No data available</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndentManage;
