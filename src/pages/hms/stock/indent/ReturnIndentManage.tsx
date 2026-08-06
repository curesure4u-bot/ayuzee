import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ReturnIndentManage = () => {
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/indent/return/new"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button></Link>
        <Link to="/hms/stock/indent/return/empty-store"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Empty Store</Button></Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Return Indent</Button>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage Return Indent</h2></div>

      <div className="flex items-center gap-2 flex-wrap">
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
        <Select value={fromStore} onValueChange={setFromStore}>
          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Please select from store" /></SelectTrigger>
          <SelectContent><SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem></SelectContent>
        </Select>
        <Select value={toStore} onValueChange={setToStore}>
          <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Please select to store" /></SelectTrigger>
          <SelectContent><SelectItem value="theni">Al Shifa Ayush Center Theni</SelectItem></SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Return Indent No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Returned Date</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Returned from</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Returned To</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Returned by</th>
              </tr>
            </thead>
            <tbody><tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No data available</td></tr></tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnIndentManage;
