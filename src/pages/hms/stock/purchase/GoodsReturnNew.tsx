import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const GoodsReturnNew = () => {
  const [location, setLocation] = useState("loc1");
  const [supplier, setSupplier] = useState("");
  const [store, setStore] = useState("");

  const handleSave = () => {
    if (!supplier) { toast.error("Supplier is required"); return; }
    if (!store) { toast.error("Store is required"); return; }
    toast.success("Goods Return Note created");
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/purchase/goods-return/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GReturn</Button>
        </Link>
        <Link to="/hms/stock/purchase/goods-return/drafts">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GReturn Draft</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">GReturn</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="max-w-lg mx-auto space-y-4">
            <div>
              <Label className="text-sm font-semibold">Location * :</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
                  <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
                  <SelectItem value="loc3">Old GH Road, Theni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Supplier * :</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha;erode;lk;Erode</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Store * :</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
                  <SelectItem value="ip">IP Pharmacy Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-center pt-4">
              <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 px-8">Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoodsReturnNew;
