import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const IssueManage = () => {
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/issue/new"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button></Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Issue</Button>
        <Link to="/hms/stock/issue/ward-request"><Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Ward Request</Button></Link>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Manage Issue</h2></div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Show All</SelectItem></SelectContent>
        </Select>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Bill No</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Amount</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">To Whom</th>
                <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody><tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No data available</td></tr></tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueManage;
