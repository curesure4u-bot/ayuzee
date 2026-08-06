import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, Search, Brain, Printer } from "lucide-react";

const items = [
  { item: "Rasnasaptakam Kashayam 450ml", rack: "A", shelf: 2, bin: 1, qty: 75, restock: false },
  { item: "Simhanada Guggulu 60t", rack: "A", shelf: 3, bin: 2, qty: 120, restock: false },
  { item: "Ashwagandha Churna 100g", rack: "B", shelf: 1, bin: 3, qty: 45, restock: true },
  { item: "Kottamchukkadi Taila 200ml", rack: "C", shelf: 1, bin: 1, qty: 30, restock: true },
  { item: "Triphala Churna 100g", rack: "B", shelf: 2, bin: 1, qty: 200, restock: false },
  { item: "Dashamoolarishtam 450ml", rack: "A", shelf: 4, bin: 1, qty: 55, restock: false },
  { item: "Chyawanprash 500g", rack: "D", shelf: 1, bin: 1, qty: 30, restock: false },
  { item: "Mahanarayan Taila 200ml", rack: "C", shelf: 2, bin: 2, qty: 22, restock: true },
  { item: "Chandraprabha Vati 60t", rack: "A", shelf: 3, bin: 3, qty: 90, restock: false },
  { item: "Yogaraja Guggulu 60t", rack: "A", shelf: 3, bin: 4, qty: 65, restock: false },
];

const RackLocation = () => {
  const [search, setSearch] = useState("");
  const filtered = items.filter(i => !search || i.item.toLowerCase().includes(search.toLowerCase()));
  const highlighted = search ? items.find(i => i.item.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-green-600" /> Rack / Bin / Location Management</h1><p className="text-muted-foreground mt-1">Find any medicine's physical location instantly — AI suggests optimal placement</p></div>
        <Button variant="outline" onClick={() => toast.success("Location labels printed")}><Printer className="h-4 w-4 mr-1" /> Print Labels</Button>
      </div>

      <div className="flex gap-2 max-w-md"><Search className="h-4 w-4 mt-2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine to find location..." /><Button size="sm">Find</Button></div>

      {highlighted && (
        <Card className="border-green-400 bg-green-50">
          <CardContent className="p-4 text-center"><p className="text-lg font-bold text-green-700">📍 {highlighted.item}</p><p className="text-2xl font-bold mt-1">Rack {highlighted.rack} → Shelf {highlighted.shelf} → Bin {highlighted.bin}</p><p className="text-sm text-muted-foreground mt-1">Stock: {highlighted.qty} units</p></CardContent>
        </Card>
      )}

      {/* Visual Rack Grid */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Pharmacy Layout (Visual Grid)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["A", "B", "C", "D"].map(rack => (
              <div key={rack} className="border rounded-lg p-2">
                <p className="text-xs font-bold text-center mb-2 bg-muted rounded py-1">Rack {rack}</p>
                <div className="space-y-1">
                  {[1,2,3,4,5].map(shelf => {
                    const shelfItems = items.filter(i => i.rack === rack && i.shelf === shelf);
                    return (
                      <div key={shelf} className={`p-1.5 rounded border text-[9px] min-h-[24px] ${shelfItems.length > 0 ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}>
                        {shelfItems.length > 0 ? shelfItems.map((si, idx) => (
                          <span key={idx} className={`block truncate ${highlighted && si.item === highlighted.item ? "font-bold text-green-700" : ""}`}>{si.item.split(' ').slice(0,2).join(' ')} ({si.qty})</span>
                        )) : <span className="text-muted-foreground">Empty</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Item Location Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Items — Location Mapping</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Rack</th><th className="px-3 py-2 text-center">Shelf</th><th className="px-3 py-2 text-center">Bin</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-center">Restock Alert</th></tr></thead><tbody>
          {filtered.map((i, idx) => (<tr key={idx} className={`border-b ${i.restock ? "bg-amber-50" : ""} ${highlighted && i.item === highlighted.item ? "bg-green-100" : ""}`}><td className="px-3 py-2 font-medium text-xs">{i.item}</td><td className="px-3 py-2 text-center font-bold">{i.rack}</td><td className="px-3 py-2 text-center">{i.shelf}</td><td className="px-3 py-2 text-center">{i.bin}</td><td className="px-3 py-2 text-center">{i.qty}</td><td className="px-3 py-2 text-center">{i.restock ? <Badge variant="destructive" className="text-[10px]">Restock</Badge> : <Badge variant="outline" className="text-green-600 text-[10px]">OK</Badge>}</td></tr>))}
        </tbody></table></div></CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Placement Optimization</p><p className="text-sm text-purple-700">Fast-moving items (Rasnasaptakam, Simhanada) placed in Rack A near dispensing counter. Slow-movers in Rack D (back). New GRN received? AI suggests: "Place in Rack B, Shelf 1, Bin 3 (closest empty slot near similar category)."</p></div></CardContent>
      </Card>
    </div>
  );
};

export default RackLocation;
