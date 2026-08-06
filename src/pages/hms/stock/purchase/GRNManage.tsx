import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const GRNManage = () => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/purchase/grn/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button>
        </Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage GRN</Button>
        <Link to="/hms/stock/purchase/grn/drafts">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GRN Drafts</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage GRN</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
          </SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All</SelectItem>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
          </SelectContent>
        </Select>
        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8">Go</Button>
      </div>

      {/* Entries & Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select className="border rounded px-2 py-1 text-sm"><option>100</option></select>
          <span>entries</span>
        </div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">GRN No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Supplier</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Received Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Invoice Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Invoice No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Invoice Amount</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Created At</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Created By</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                    No data available in table
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing 0 to 0 of 0 entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GRNManage;
