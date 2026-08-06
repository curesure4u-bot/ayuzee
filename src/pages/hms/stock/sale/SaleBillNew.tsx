import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, ScanLine } from "lucide-react";
import QRBarcodeScanner, { type ScannedProductResult } from "../ai/QRBarcodeScanner";
import PatientMedicineQRLabel from "../ai/PatientMedicineQRLabel";

interface SaleLineItem {
  id: string;
  sNo: number;
  productName: string;
  mfr: string;
  batch: string;
  expiry: string;
  qty: string;
  mrp: string;
  gstPercent: string;
  discPercent: string;
  total: string;
}

const SaleBillNew = () => {
  const [billType, setBillType] = useState("OP");
  const [opNo, setOpNo] = useState("");
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("alshifa");
  const [consultant, setConsultant] = useState("");
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [items, setItems] = useState<SaleLineItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productName: "", mfr: "", batch: "", expiry: "", qty: "", mrp: "", gstPercent: "", discPercent: "0", total: "",
  });
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [additionalCharge, setAdditionalCharge] = useState("0");
  const [cashTendered, setCashTendered] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRLabels, setShowQRLabels] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"Single" | "Multiple">("Single");
  const [paymentType, setPaymentType] = useState("Cash");
  const [additionalNote, setAdditionalNote] = useState("");
  const [reviewDays, setReviewDays] = useState("");
  const [reviewUnit, setReviewUnit] = useState("Days");

  const taxTotal = items.reduce((sum, i) => sum + (parseFloat(i.total || "0") * parseFloat(i.gstPercent || "0") / 100), 0);
  const subTotal = items.reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);
  const disc = parseFloat(discountAmount) || 0;
  const addCharge = parseFloat(additionalCharge) || 0;
  const amountReceivable = subTotal + taxTotal - disc + addCharge;

  const handleQRScanned = (result: ScannedProductResult) => {
    setCurrentItem({
      productName: result.name,
      mfr: result.manufacturer,
      batch: result.batch,
      expiry: result.expiry,
      qty: "1",
      mrp: result.mrp.toString(),
      gstPercent: "12",
      discPercent: "0",
      total: result.mrp.toString(),
    });
    setShowQRScanner(false);
    toast.success(`QR scanned: ${result.name} - adjust qty and add`);
  };

  const handleAddItem = () => {
    if (!currentItem.productName) { toast.error("Enter product name"); return; }
    const newItem: SaleLineItem = {
      ...currentItem,
      id: Date.now().toString(),
      sNo: items.length + 1,
    };
    setItems([...items, newItem]);
    setCurrentItem({ productName: "", mfr: "", batch: "", expiry: "", qty: "", mrp: "", gstPercent: "", discPercent: "0", total: "" });
  };

  const handleSave = () => {
    if (items.length === 0) { toast.error("Add at least one product"); return; }
    toast.success("Sale bill saved successfully");
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/sale/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Sale</Button>
        </Link>
        <Button size="sm" variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100" onClick={() => setShowQRScanner(!showQRScanner)}>
          <ScanLine className="mr-1 h-4 w-4" /> {showQRScanner ? "Hide Scanner" : "QR/Barcode Scan"}
        </Button>
        <Button size="sm" variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100" onClick={() => setShowQRLabels(!showQRLabels)}>
          QR Labels
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Sale Bill</h2>
      </div>

      {/* QR/Barcode Scanner */}
      {showQRScanner && (
        <QRBarcodeScanner onScanned={handleQRScanned} context="sale" />
      )}

      {/* Patient QR Labels (shown after items added) */}
      {showQRLabels && items.length > 0 && (
        <PatientMedicineQRLabel patientName={patientName} consultantName={consultant} />
      )}

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Bill Type & OP Search */}
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
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-red-600">Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loc1">#11, Main Road, Kaday...</SelectItem>
                </SelectContent>
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
              <Label className="text-xs font-semibold">Mobile</Label>
              <Input className="h-8 text-xs" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <Label className="text-xs font-semibold">Age</Label>
                <Input className="h-8 text-xs" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">M</SelectItem>
                    <SelectItem value="Female">F</SelectItem>
                    <SelectItem value="Other">O</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Choose Package */}
          <div>
            <Label className="text-sm font-semibold">Choose Package:</Label>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pkg1">Package 1</SelectItem>
                <SelectItem value="pkg2">Package 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Products</h3>
              <Button size="sm" variant="outline" className="text-xs bg-green-600 text-white hover:bg-green-700">
                Add Unavailable Medicine
              </Button>
            </div>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">S.No</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Product Name</th>
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">MFR</th>
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
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-2 py-1">{item.sNo}</td>
                      <td className="px-2 py-1">{item.productName}</td>
                      <td className="px-2 py-1">{item.mfr}</td>
                      <td className="px-2 py-1">{item.batch}</td>
                      <td className="px-2 py-1">{item.expiry}</td>
                      <td className="px-2 py-1">{item.qty}</td>
                      <td className="px-2 py-1">{item.mrp}</td>
                      <td className="px-2 py-1">{item.gstPercent}</td>
                      <td className="px-2 py-1">{item.discPercent}</td>
                      <td className="px-2 py-1">{item.total}</td>
                      <td className="px-2 py-1"><Button variant="ghost" size="sm" className="h-5 text-red-500 text-xs" onClick={() => setItems(items.filter(i => i.id !== item.id))}>x</Button></td>
                    </tr>
                  ))}
                  {/* Input row */}
                  <tr className="bg-gray-50">
                    <td className="px-1 py-1"></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Product Name" value={currentItem.productName} onChange={(e) => setCurrentItem({...currentItem, productName: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-12" placeholder="M" value={currentItem.mfr} onChange={(e) => setCurrentItem({...currentItem, mfr: e.target.value})} /></td>
                    <td className="px-1 py-1">
                      <Select value={currentItem.batch} onValueChange={(v) => setCurrentItem({...currentItem, batch: v})}>
                        <SelectTrigger className="h-7 text-xs w-16"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="batch1">B1</SelectItem></SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Expiry" value={currentItem.expiry} readOnly /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-10" placeholder="C" value={currentItem.qty} onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-12" placeholder="Pri" value={currentItem.mrp} onChange={(e) => setCurrentItem({...currentItem, mrp: e.target.value})} /></td>
                    <td className="px-1 py-1">
                      <Select value={currentItem.gstPercent} onValueChange={(v) => setCurrentItem({...currentItem, gstPercent: v})}>
                        <SelectTrigger className="h-7 text-xs w-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="18">18</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-10" value={currentItem.discPercent} onChange={(e) => setCurrentItem({...currentItem, discPercent: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-12" placeholder="Tot" value={currentItem.total} readOnly /></td>
                    <td className="px-1 py-1"><Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-xs" onClick={handleAddItem}>Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="space-y-1 text-sm w-[300px]">
              <div className="flex justify-between"><span>Tax</span><span>{taxTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Total</span><span>{subTotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center">
                <span>Discount in %</span>
                <Input className="h-7 w-16 text-right text-sm" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
              </div>
              <div className="flex justify-between items-center">
                <span>Discount Amount</span>
                <Input className="h-7 w-16 text-right text-sm" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
              </div>
              <div className="flex justify-between"><span>Discount</span><span>{disc.toFixed(2)}</span></div>
              <div className="flex justify-between items-center">
                <span>Additional Charge</span>
                <Input className="h-7 w-16 text-right text-sm" value={additionalCharge} onChange={(e) => setAdditionalCharge(e.target.value)} />
              </div>
              <div className="flex justify-between font-semibold"><span>Amount Receivable</span><span>{amountReceivable.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Amount Received</span><span>{amountReceivable.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Due</span><span>0.00</span></div>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Payment Mode :</Label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="payMode" checked={paymentMode === "Single"} onChange={() => setPaymentMode("Single")} /> Single
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="payMode" checked={paymentMode === "Multiple"} onChange={() => setPaymentMode("Multiple")} /> Multiple
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm">Cash Tendered</span>
                <Input className="h-8 w-28" value={cashTendered} onChange={(e) => setCashTendered(e.target.value)} />
              </div>
              <div>
                <span className="text-sm">Balance</span>
                <Input className="h-8 w-28" value="" readOnly />
              </div>
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <Label className="text-sm font-semibold">Payment Type * :</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Note */}
          <div>
            <Label className="text-sm font-semibold">Additional Note:</Label>
            <Textarea value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} rows={2} />
          </div>

          {/* Review */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-semibold">Review</Label>
            <Input className="h-8 w-20" placeholder="Review" value={reviewDays} onChange={(e) => setReviewDays(e.target.value)} />
            <Select value={reviewUnit} onValueChange={setReviewUnit}>
              <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Days">Days</SelectItem>
                <SelectItem value="Weeks">Weeks</SelectItem>
                <SelectItem value="Months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IP Bill Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
            Against IP Bill can be used only for admitted patients
            <button className="ml-2 text-amber-900">&times;</button>
          </div>

          {/* Save */}
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleBillNew;
