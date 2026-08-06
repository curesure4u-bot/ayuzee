import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PurchaseOrderFind = () => {
  const [productName, setProductName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/purchase/po/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button>
        </Link>
        <Link to="/hms/stock/purchase/po/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage PO</Button>
        </Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Find Product PO</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Find Product PO</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <Input placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} className="flex-1" />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" className="w-[150px]" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" className="w-[150px]" />
            <Button className="bg-purple-700 hover:bg-purple-800">Go</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderFind;
