import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CreditSupplier = () => {
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("all");
  const [supplier, setSupplier] = useState("");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Credit Supplier</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <Label className="text-xs font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Store</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Show All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show All</SelectItem>
                  <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Supplier</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="w-[300px]"><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha, erode, lk, Erode, 0</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="self-end">
              <Button className="bg-orange-600 hover:bg-orange-700">Go</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditSupplier;
