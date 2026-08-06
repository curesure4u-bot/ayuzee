import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PurchaseOrderNew = () => {
  const [location, setLocation] = useState("loc1");
  const [supplier, setSupplier] = useState("");
  const [store, setStore] = useState("");

  const handleSave = () => {
    if (!supplier) { toast.error("Supplier is required"); return; }
    if (!store) { toast.error("Store is required"); return; }
    toast.success("Purchase Order created successfully");
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/purchase/po/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage PO</Button>
        </Link>
        <Link to="/hms/stock/purchase/po/find">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Find Product PO</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">PO</h2>
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
                  <SelectItem value="loc4">Kulavanikar Puram Road, Tirunelveli</SelectItem>
                  <SelectItem value="loc5">Keelkattalai, Chennai</SelectItem>
                  <SelectItem value="loc6">Tenkasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Supplier * :</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha;erode;lk;Erode;0</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD 044-26202188</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES 9994143187</SelectItem>
                  <SelectItem value="rich">RICH HERBALS 7538883888</SelectItem>
                  <SelectItem value="siddha">SIDDHASRAMAM SIVANANANDA VIJAYAM OUSHADASHALA</SelectItem>
                  <SelectItem value="arya">THE ARYA VAIDYA PHARMACY 0422-4280171</SelectItem>
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

export default PurchaseOrderNew;
