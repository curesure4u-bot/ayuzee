import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const IssueNew = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [stockItems, setStockItems] = useState<{ id: string; product_name: string; ward_store_id: string }[]>([]);
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("");
  const [issueTo, setIssueTo] = useState("Patient");
  const [recipientName, setRecipientName] = useState("");
  const [service, setService] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState({
    productName: "", mfr: "", batch: "", expiry: "", qty: "", mrp: "", gstPercent: "", total: "",
  });
  const [issueNotes, setIssueNotes] = useState("");

  const grandTotal = items.reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

  useEffect(() => {
    loadWardStores();
    loadStockItems();
  }, []);

  const loadWardStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
    if (data && data.length > 0) setStore(data[0].id);
  };

  const loadStockItems = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stock_items")
      .select("id, product_name, ward_store_id")
      .gt("quantity_available", 0)
      .order("product_name", { ascending: true });
    setStockItems(data || []);
  };

  const handleAddItem = () => {
    if (!currentItem.productName) { toast.error("Enter product name"); return; }
    setItems([...items, { ...currentItem, id: Date.now().toString(), sNo: items.length + 1 }]);
    setCurrentItem({ productName: "", mfr: "", batch: "", expiry: "", qty: "", mrp: "", gstPercent: "", total: "" });
  };

  const handleSave = async () => {
    if (!recipientName && issueTo === "Patient") { toast.error("Enter patient name"); return; }
    if (items.length === 0) { toast.error("Add at least one product"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const insertRows = items.map((item: any) => {
        const matchedStock = stockItems.find(s =>
          s.product_name.toLowerCase() === item.productName.toLowerCase()
        );
        return {
          ward_store_id: matchedStock?.ward_store_id || store,
          ward_stock_item_id: matchedStock?.id || stockItems[0]?.id,
          quantity_consumed: parseFloat(item.qty) || 1,
          consumption_type: issueTo === "Patient" ? "patient_use" : "therapy_use",
          billed_to_patient: issueTo === "Patient",
          bill_amount: parseFloat(item.total) || parseFloat(item.mrp) || 0,
          consumed_by: user.id,
          notes: `Issue to ${issueTo}: ${recipientName || "N/A"}. Product: ${item.productName}. ${issueNotes}`,
        };
      });

      const { error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .insert(insertRows);

      if (error) throw error;
      toast.success("Issue saved to Supabase");
      navigate("/hms/stock/issue/manage");
    } catch (err: any) {
      toast.error("Failed to save issue: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/issue/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Issue</Button>
        </Link>
        <Link to="/hms/stock/issue/ward-request">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Ward Request</Button>
        </Link>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Issue</h2></div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Location, Store, Issue To, Name, Service */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <Label className="text-xs font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Store</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {wardStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Issue To</Label>
              <div className="flex flex-col gap-1 mt-1">
                <label className="flex items-center gap-1 text-xs"><input type="radio" name="issueTo" value="Patient" checked={issueTo === "Patient"} onChange={(e) => setIssueTo(e.target.value)} /> Patient</label>
                <label className="flex items-center gap-1 text-xs"><input type="radio" name="issueTo" value="Consultant" checked={issueTo === "Consultant"} onChange={(e) => setIssueTo(e.target.value)} /> Consultant</label>
                <label className="flex items-center gap-1 text-xs"><input type="radio" name="issueTo" value="Users" checked={issueTo === "Users"} onChange={(e) => setIssueTo(e.target.value)} /> Users</label>
                <label className="flex items-center gap-1 text-xs"><input type="radio" name="issueTo" value="Others" checked={issueTo === "Others"} onChange={(e) => setIssueTo(e.target.value)} /> Others</label>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Name</Label>
              <Input className="h-8 text-xs" placeholder="Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Service</Label>
              <Input className="h-8 text-xs" value={service} onChange={(e) => setService(e.target.value)} />
            </div>
          </div>

          {/* Choose Package */}
          <div>
            <Label className="text-sm font-semibold">Choose Package:</Label>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger className="max-w-[300px]"><SelectValue placeholder="" /></SelectTrigger>
              <SelectContent><SelectItem value="pkg1">Package 1</SelectItem></SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Products</h3>
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
                    <th className="px-2 py-2 text-left font-semibold text-orange-600">Total</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-2 py-1">{item.sNo}</td>
                      <td className="px-2 py-1">{item.productName}</td>
                      <td className="px-2 py-1">{item.mfr}</td>
                      <td className="px-2 py-1">{item.batch}</td>
                      <td className="px-2 py-1">{item.expiry}</td>
                      <td className="px-2 py-1">{item.qty}</td>
                      <td className="px-2 py-1">{item.mrp}</td>
                      <td className="px-2 py-1">{item.gstPercent}</td>
                      <td className="px-2 py-1">{item.total}</td>
                      <td className="px-2 py-1"><Button variant="ghost" size="sm" className="h-5 text-red-500 text-xs" onClick={() => setItems(items.filter(i => i.id !== item.id))}>x</Button></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-1 py-1"></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs" placeholder="Product Name" value={currentItem.productName} onChange={(e) => setCurrentItem({...currentItem, productName: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Manufact" value={currentItem.mfr} onChange={(e) => setCurrentItem({...currentItem, mfr: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-16" placeholder="Batch" value={currentItem.batch} onChange={(e) => setCurrentItem({...currentItem, batch: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-20" placeholder="Expiry" value={currentItem.expiry} onChange={(e) => setCurrentItem({...currentItem, expiry: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-12" placeholder="Qty" value={currentItem.qty} onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})} /></td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="MRP" value={currentItem.mrp} onChange={(e) => setCurrentItem({...currentItem, mrp: e.target.value})} /></td>
                    <td className="px-1 py-1">
                      <Select value={currentItem.gstPercent} onValueChange={(v) => setCurrentItem({...currentItem, gstPercent: v})}>
                        <SelectTrigger className="h-7 text-xs w-12"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="12">12</SelectItem><SelectItem value="18">18</SelectItem></SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1"><Input className="h-7 text-xs w-14" placeholder="Total" value={currentItem.total} onChange={(e) => setCurrentItem({...currentItem, total: e.target.value})} /></td>
                    <td className="px-1 py-1"><Button size="sm" className="h-7 bg-blue-600 text-xs" onClick={handleAddItem}>Add</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-end text-sm font-semibold">
            <span>Grand Total</span>
            <span className="ml-4">{grandTotal.toFixed(2)}</span>
          </div>

          {/* Issue Notes */}
          <div>
            <Label className="text-sm font-semibold">Issue Notes:</Label>
            <Input value={issueNotes} onChange={(e) => setIssueNotes(e.target.value)} />
          </div>

          <div className="text-center">
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 px-8">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueNew;
