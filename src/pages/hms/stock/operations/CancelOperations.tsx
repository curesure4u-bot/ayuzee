import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { CancelType } from "@/types/stock-hms";

interface CancelOperationsProps {
  cancelType: CancelType;
}

const cancelTypeConfig: Record<CancelType, { title: string }> = {
  "Sale Bill": { title: "Manage Cancel Sale Bill" },
  "Return Bill": { title: "Manage Cancel Return Bill" },
  "Purchase Order": { title: "Manage Cancel PO" },
  "Goods Received Note": { title: "Manage Cancel GReturn" },
  "Goods Returned Note": { title: "Manage Cancel GReturn" },
  "Issue": { title: "Manage Cancel Issue" },
};

const CancelOperations = ({ cancelType }: CancelOperationsProps) => {
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");

  const config = cancelTypeConfig[cancelType];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">{config.title}</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[250px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8">Go</Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          No cancelled {cancelType.toLowerCase()}s found for the selected criteria.
        </CardContent>
      </Card>
    </div>
  );
};

// Individual page components for each cancel type
export const CancelSaleBill = () => <CancelOperations cancelType="Sale Bill" />;
export const CancelReturnBill = () => <CancelOperations cancelType="Return Bill" />;
export const CancelPurchaseOrder = () => <CancelOperations cancelType="Purchase Order" />;
export const CancelGRN = () => <CancelOperations cancelType="Goods Received Note" />;
export const CancelGoodsReturn = () => <CancelOperations cancelType="Goods Returned Note" />;
export const CancelIssue = () => <CancelOperations cancelType="Issue" />;

export default CancelOperations;
