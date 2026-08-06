import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GDNManage = () => {
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/indent/new"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New Indent</Button></Link>
        <Link to="/hms/stock/indent/manage"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Indent</Button></Link>
        <Link to="/hms/stock/indent/gdn/new"><Button size="sm" variant="outline" className="text-red-600 border-red-300">New GDN</Button></Link>
        <Button size="sm" className="bg-red-600 hover:bg-red-700">Manage GDN</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage GDN</h2></div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={fromStore} onValueChange={setFromStore}>
          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Please select from store" /></SelectTrigger>
          <SelectContent><SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem><SelectItem value="ip">IP Pharmacy Store</SelectItem></SelectContent>
        </Select>
        <Select value={toStore} onValueChange={setToStore}>
          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Please select to store" /></SelectTrigger>
          <SelectContent><SelectItem value="theni">Al Shifa Ayush Center Theni</SelectItem></SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">GDN No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">From</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">To</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Dispatch Date</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
              </tr>
            </thead>
            <tbody><tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No data available</td></tr></tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDNManage;
