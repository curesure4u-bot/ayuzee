import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const QuotationManage = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/purchase/quotation">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button>
        </Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Quotation</Button>
        <Link to="/hms/stock/purchase/quotation/inactive">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Inactive Quotation</Button>
        </Link>
        <Link to="/hms/stock/purchase/quotation/find">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Find Quotation By Product</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Quotation</h2>
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
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">S.No</th>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Quotation No</th>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Supplier</th>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Quotation Date</th>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No data available in table
                </td>
              </tr>
            </tbody>
          </table>
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

export default QuotationManage;
