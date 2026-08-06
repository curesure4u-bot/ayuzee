import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Pencil, Globe, IndianRupee, Trash2 } from "lucide-react";

type Currency = {
  id: string; code: string; name: string; symbol: string;
  exchangeRate: number; decimalPlaces: number; isDefault: boolean;
  status: "active" | "inactive"; country: string; lastUpdated: string;
};

const currencies: Currency[] = [
  { id: "1", code: "INR", name: "Indian Rupee", symbol: "₹", exchangeRate: 1.00, decimalPlaces: 2, isDefault: true, status: "active", country: "India", lastUpdated: "2026-07-15" },
  { id: "2", code: "USD", name: "US Dollar", symbol: "$", exchangeRate: 83.50, decimalPlaces: 2, isDefault: false, status: "active", country: "United States", lastUpdated: "2026-07-15" },
  { id: "3", code: "AED", name: "UAE Dirham", symbol: "د.إ", exchangeRate: 22.73, decimalPlaces: 2, isDefault: false, status: "active", country: "UAE", lastUpdated: "2026-07-15" },
  { id: "4", code: "SAR", name: "Saudi Riyal", symbol: "﷼", exchangeRate: 22.27, decimalPlaces: 2, isDefault: false, status: "active", country: "Saudi Arabia", lastUpdated: "2026-07-15" },
  { id: "5", code: "GBP", name: "British Pound", symbol: "£", exchangeRate: 105.80, decimalPlaces: 2, isDefault: false, status: "active", country: "United Kingdom", lastUpdated: "2026-07-15" },
  { id: "6", code: "EUR", name: "Euro", symbol: "€", exchangeRate: 91.20, decimalPlaces: 2, isDefault: false, status: "active", country: "European Union", lastUpdated: "2026-07-15" },
  { id: "7", code: "SGD", name: "Singapore Dollar", symbol: "S$", exchangeRate: 62.10, decimalPlaces: 2, isDefault: false, status: "active", country: "Singapore", lastUpdated: "2026-07-15" },
  { id: "8", code: "MYR", name: "Malaysian Ringgit", symbol: "RM", exchangeRate: 17.85, decimalPlaces: 2, isDefault: false, status: "active", country: "Malaysia", lastUpdated: "2026-07-15" },
  { id: "9", code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", exchangeRate: 0.27, decimalPlaces: 2, isDefault: false, status: "inactive", country: "Sri Lanka", lastUpdated: "2026-07-15" },
  { id: "10", code: "OMR", name: "Omani Rial", symbol: "ر.ع.", exchangeRate: 216.88, decimalPlaces: 3, isDefault: false, status: "active", country: "Oman", lastUpdated: "2026-07-15" },
];

type Denomination = { id: string; value: number; label: string; type: "note" | "coin"; status: "active" | "inactive" };

const denominations: Denomination[] = [
  { id: "1", value: 2000, label: "₹2000 Note", type: "note", status: "inactive" },
  { id: "2", value: 500, label: "₹500 Note", type: "note", status: "active" },
  { id: "3", value: 200, label: "₹200 Note", type: "note", status: "active" },
  { id: "4", value: 100, label: "₹100 Note", type: "note", status: "active" },
  { id: "5", value: 50, label: "₹50 Note", type: "note", status: "active" },
  { id: "6", value: 20, label: "₹20 Note", type: "note", status: "active" },
  { id: "7", value: 10, label: "₹10 Note/Coin", type: "coin", status: "active" },
  { id: "8", value: 5, label: "₹5 Coin", type: "coin", status: "active" },
  { id: "9", value: 2, label: "₹2 Coin", type: "coin", status: "active" },
  { id: "10", value: 1, label: "₹1 Coin", type: "coin", status: "active" },
];

const CurrencyMaster = () => {
  const [tab, setTab] = useState("manage");
  const [search, setSearch] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const filtered = currencies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newCode.trim() || !newName.trim()) return toast.error("Code and Name required");
    toast.success(`Currency "${newCode}" added!`);
    setNewCode(""); setNewName(""); setNewSymbol(""); setNewRate(""); setNewCountry("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-teal-600" /> Currency Master</h1>
          <p className="text-sm text-muted-foreground">Manage supported currencies, exchange rates, denominations & default settings</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{currencies.filter(c => c.status === "active").length} active currencies</Badge>
          <Badge className="bg-emerald-100 text-emerald-700">Default: INR (₹)</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="manage">💱 Manage Currencies</TabsTrigger>
          <TabsTrigger value="add">➕ Add Currency</TabsTrigger>
          <TabsTrigger value="denomination">💵 Denomination</TabsTrigger>
          <TabsTrigger value="config">⚙️ Settings</TabsTrigger>
        </TabsList>

        {/* MANAGE CURRENCIES */}
        <TabsContent value="manage" className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search currency..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
          <Card><CardContent className="p-0">
            <Table><TableHeader><TableRow>
              <TableHead className="text-orange-600">Code</TableHead>
              <TableHead className="text-orange-600">Currency Name</TableHead>
              <TableHead className="text-orange-600">Symbol</TableHead>
              <TableHead className="text-orange-600">Country</TableHead>
              <TableHead className="text-orange-600">Exchange Rate (1 unit = ₹)</TableHead>
              <TableHead className="text-orange-600">Decimals</TableHead>
              <TableHead className="text-orange-600">Default</TableHead>
              <TableHead className="text-orange-600">Status</TableHead>
              <TableHead className="text-orange-600">Last Updated</TableHead>
              <TableHead className="text-orange-600">Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-bold">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-lg">{c.symbol}</TableCell>
                  <TableCell className="text-xs">{c.country}</TableCell>
                  <TableCell className="font-semibold">{c.isDefault ? "Base (1.00)" : `₹${c.exchangeRate.toFixed(2)}`}</TableCell>
                  <TableCell>{c.decimalPlaces}</TableCell>
                  <TableCell>{c.isDefault ? <Badge className="bg-emerald-100 text-emerald-700 text-xs">✓ Default</Badge> : "—"}</TableCell>
                  <TableCell><Badge className={c.status === "active" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>{c.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.lastUpdated}</TableCell>
                  <TableCell><div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
            <div className="p-3 text-xs text-muted-foreground border-t">Showing {filtered.length} of {currencies.length} currencies</div>
          </CardContent></Card>
        </TabsContent>

        {/* ADD CURRENCY */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Add New Currency</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label>Currency Code * (ISO 4217)</Label><Input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="e.g., USD, AED, SAR" maxLength={3} /></div>
                <div><Label>Currency Name *</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., US Dollar" /></div>
                <div><Label>Symbol *</Label><Input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="e.g., $, €, £" /></div>
                <div><Label>Exchange Rate (1 unit = ₹) *</Label><Input value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="e.g., 83.50" type="number" step="0.01" /></div>
                <div><Label>Country</Label><Input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="e.g., United States" /></div>
                <div><Label>Decimal Places</Label><Select defaultValue="2"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent></Select></div>
              </div>
              <div className="flex justify-center pt-2"><Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 px-8">Add Currency</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DENOMINATION */}
        <TabsContent value="denomination" className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b"><CardTitle className="text-base">💵 INR Denomination Master (for cash counter)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table><TableHeader><TableRow>
                <TableHead>Value</TableHead><TableHead>Label</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader><TableBody>
                {denominations.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-bold text-lg">₹{d.value}</TableCell>
                    <TableCell>{d.label}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.type}</Badge></TableCell>
                    <TableCell><Badge className={d.status === "active" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{d.status}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFIG */}
        <TabsContent value="config" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">⚙️ Currency Configuration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Default Currency</Label><Select defaultValue="INR"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{currencies.filter(c => c.status === "active").map(c => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Exchange Rate Update Frequency</Label><Select defaultValue="daily"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="realtime">Real-time</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="manual">Manual Only</SelectItem></SelectContent></Select></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Show currency symbol on bills</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Allow multi-currency billing</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Auto-convert to INR for accounting</Label></div>
              <div className="flex items-center gap-3"><Switch /><Label>Show exchange rate on patient receipt</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Enable denomination counter at cash close</Label></div>
              <div className="flex items-center gap-3"><Switch /><Label>Allow foreign currency cash payment</Label></div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success("Currency settings saved!")}>💾 Save Settings</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurrencyMaster;
