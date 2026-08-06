import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search } from "lucide-react";

const SaleReturnNew = () => {
  const [billType, setBillType] = useState("OP");
  const [opNo, setOpNo] = useState("");
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("alshifa");
  const [consultant, setConsultant] = useState("");
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productName: "", mfr: "", batch: "", expiry: "", qty: "", mrp: "", gstPercent: "", discPercent: "0", total: "",
  });
  const [previousBalance, setPreviousBalance] = useState("0");
  const [paymentType, setPaymentType] = useState("Cash");
  const [additionalNote, setAdditionalNote] = useState("");

  const subTotal = items.reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);
  const taxTotal = items.reduce((sum, i) => sum + (parseFloat(i.total || "0") * parseFloat(i.gstPercent || "0") / 100), 0);

  const handleAddItem = () => {
    if (!currentItem.productName) { toast.error("Enter product name"); return; }
    setItems([...items, { ...currentItem, id: Date.now().toString() }]);
    setCurrentItem({ productName: "", mfr: "", batch: "", expiry: "", qty: "", mrp: "", gstPercent: "", discPercent: "0", total: "" });
  };

  const handleSave = () => {
    if (items.length === 0) { toast.error("Add at least one product to return"); return; }
    toast.success("Sale return processed successfully");
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/sale/return/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage SaleReturn</Button>
        </Link>
        <Link to="/hms/stock/sale/return/counter">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">Manage SaveForCounter SaleReturn</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Sale Return</h2>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Bill Type & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={billType} onValueChange={setBillType}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OP">OP</SelectItem>
                <SelectItem value="IP">IP</SelectItem>
                <SelectItem value="Counter">Counter</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search OP #" value={opNo} onChange={(e) => setOpNo(e.target.value)} />
            </div>
            <Button variant="outline" size="sm"><Search className="h-4 w-4" /></Button>
          </div>

          {/* Location, Store, Consultant, Patient Info */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-red-600">Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-red-600">Store *</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
                  <SelectItem value="ip">IP Pharmacy Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-red-600">Consultant *</Label>
              <Input className="h-8 text-xs" placeholder="Consultant Name" value={consultant} onChange={(e) => setConsultant(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-red-600">Name *</Label>
              <Input className="h-8 text-xs" placeholder="Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Mobile</Label>
              <Input className="h-8 text-xs" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Age</Label>
              <Input className="h-8 text-xs" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Products</h3>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Product Name</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Mfr</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Batch</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Expiry</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Qty</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">MRP</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">GST(%)</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Dis(%)</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Total</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-2 py-1">{item.productName}</td>
                      <td className="px-2 py-1">{item.mfr}</td>
                      <td className="px-2 py-1">{item.batch}</td>
                      <td className="px-2 py-1">{item.expiry}</td>
                      <td className="px-2 py-1">{item.qty}</td>
                      <td className="px-2 py-1">{item.mrp}</td>
                      <td className="px-2 py-1">{item.gstPercent}</td>
                      <td className="px-2 py-1">{item.discPercent}</td>
                      <td className="px-2 py-1">{item.total}</td>
                      <td className="px-2 py-1"><Button variant="ghost" size="sm" className="h-5 text-red-500 text-xs" onClick={() => setItems(items.filter((_, i) => i !== idx))}>x</Button></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Product Name" value={currentItem.productName} onChange={(e) => setCurrentItem({...currentItem, productName: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Manufacturer" value={currentItem.mfr} onChange={(e) => setCurrentItem({...currentItem, mfr: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Batch" value={currentItem.batch} onChange={(e) => setCurrentItem({...currentItem, batch: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Expiry" value={currentItem.expiry} readOnly /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="Quantity" value={currentItem.qty} onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="MRP" value={currentItem.mrp} onChange={(e) => setCurrentItem({...currentItem, mrp: e.target.value})} /></td>
                    <td className="px-1 py-1">
                      <Select value={currentItem.gstPercent} onValueChange={(v) => setCurrentItem({...currentItem, gstPercent: v})}>
                        <SelectTrigger className="h-7 text-xs w-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="12">12</SelectItem><SelectItem value="18">18</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-10" value={currentItem.discPercent} onChange={(e) => setCurrentItem({...currentItem, discPercent: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="Total" value={currentItem.total} readOnly /></td>
                    <td className="px-1 py-1"><Button size="sm" className="h-7 bg-blue-600 text-xs" onClick={handleAddItem}>Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="space-y-1 text-sm w-[280px]">
              <div className="flex justify-between"><span>Tax</span><span>{taxTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Total</span><span>{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount in %</span><Input className="h-7 w-16 text-right text-sm" defaultValue="0" /></div>
              <div className="flex justify-between"><span>Discount Amount</span><span>0.00</span></div>
              <div className="flex justify-between"><span>Discount</span><span>0.00</span></div>
              <div className="flex justify-between items-center text-orange-600 font-semibold">
                <span>Previous Balance</span>
                <Input className="h-7 w-16 text-right text-sm" value={previousBalance} onChange={(e) => setPreviousBalance(e.target.value)} />
              </div>
              <div className="flex justify-between"><span>Amount Returnable</span><span>0.00</span></div>
              <div className="flex justify-between"><span>Amount Returned</span><span>0.00</span></div>
            </div>
          </div>

          {/* Payment & Note */}
          <div>
            <Label className="text-sm font-semibold">Payment Type * :</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold">Additional Note :</Label>
            <Input value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} />
          </div>

          {/* IP Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
            Against IP Bill can be used only for admitted patients
            <button className="ml-2 text-amber-900">&times;</button>
          </div>

          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleReturnNew;
