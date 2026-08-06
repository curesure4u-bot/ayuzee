import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProductFlowAnalysis = () => {
  const [location, setLocation] = useState("loc1");
  const [month, setMonth] = useState("07/2026");

  const processedMonths = [
    "December 2024", "January 2025", "February 2025", "March 2025",
    "April 2025", "April 2026", "July 2026",
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Generate Product Flow Analysis</h2>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
        <strong>Note:</strong> This feature causes heavy load on server, hence it is allowed to execute only on following times (Noon: 2 PM to 5 PM and Night: 9 PM to 8 AM)
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 max-w-xl">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
                <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
              </SelectContent>
            </Select>
            <Input className="w-[120px]" placeholder="MM/YYYY" value={month} onChange={(e) => setMonth(e.target.value)} />
            <Button className="bg-purple-700 hover:bg-purple-800">Generate</Button>
          </div>
        </CardContent>
      </Card>

      {/* Processed months info */}
      <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
        <strong>Current Stock processed for months:</strong> {processedMonths.join(", ")}
      </div>
    </div>
  );
};

export default ProductFlowAnalysis;
