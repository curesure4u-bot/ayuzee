import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Globe, RefreshCw, IndianRupee } from "lucide-react";

type Currency = { code: string; name: string; symbol: string; rate: number; enabled: boolean; lastUpdated: string };

const mockCurrencies: Currency[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 1, enabled: true, lastUpdated: "Base currency" },
  { code: "USD", name: "US Dollar", symbol: "$", rate: 83.45, enabled: true, lastUpdated: "2026-07-15 09:00" },
  { code: "EUR", name: "Euro", symbol: "€", rate: 91.20, enabled: true, lastUpdated: "2026-07-15 09:00" },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 106.50, enabled: true, lastUpdated: "2026-07-15 09:00" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", rate: 22.72, enabled: true, lastUpdated: "2026-07-15 09:00" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 62.10, enabled: false, lastUpdated: "2026-07-15 09:00" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 55.30, enabled: false, lastUpdated: "2026-07-15 09:00" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 94.80, enabled: false, lastUpdated: "2026-07-15 09:00" },
];

const HmsMultiCurrency = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const [convertAmount, setConvertAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");

  const toggleCurrency = (code: string) => {
    setCurrencies(currencies.map(c => c.code === code ? { ...c, enabled: !c.enabled } : c));
  };

  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
  const inrAmount = Number(convertAmount) * fromRate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" /> Multi-Currency Management
          </h1>
          <p className="text-sm text-muted-foreground">Wellness tourism billing · Exchange rates · Dual-currency invoicing · International patients</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Exchange rates updated from RBI")}><RefreshCw className="mr-1 h-4 w-4" /> Update Rates</Button>
      </div>

      {/* Quick Converter */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-3">Quick Currency Converter</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div><Label className="text-xs">Amount</Label><Input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} /></div>
            <div><Label className="text-xs">From Currency</Label>
              <select className="w-full h-9 rounded-md border px-3 text-sm" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                {currencies.filter(c => c.enabled).map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
              </select>
            </div>
            <div className="text-center text-lg font-bold">=</div>
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xs text-muted-foreground">INR Equivalent</p>
              <p className="text-2xl font-bold text-green-700">₹{inrAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-muted-foreground">Rate: 1 {fromCurrency} = ₹{fromRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Exchange Rates & Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Currency</th>
                <th className="px-3 py-2 text-left font-medium">Code</th>
                <th className="px-3 py-2 text-left font-medium">Symbol</th>
                <th className="px-3 py-2 text-left font-medium">1 Unit = INR</th>
                <th className="px-3 py-2 text-left font-medium">Last Updated</th>
                <th className="px-3 py-2 text-left font-medium">Enabled</th>
              </tr></thead>
              <tbody>
                {currencies.map((c) => (
                  <tr key={c.code} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2 font-mono">{c.code}</td>
                    <td className="px-3 py-2 text-lg">{c.symbol}</td>
                    <td className="px-3 py-2 font-bold">{c.code === "INR" ? "—" : `₹${c.rate}`}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{c.lastUpdated}</td>
                    <td className="px-3 py-2"><Switch checked={c.enabled} onCheckedChange={() => toggleCurrency(c.code)} disabled={c.code === "INR"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Enabled currencies appear in billing, reservation, and invoice modules. Invoices show both original currency and INR equivalent.</p>
        </CardContent>
      </Card>

      {/* Wellness Tourism Info */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Globe className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">Wellness Tourism Billing</p>
            <p className="text-blue-600 mt-0.5">International patients from UAE, Europe, USA can be billed in their home currency. Invoices display dual amounts (original currency + INR). Exchange rates auto-update daily from RBI. Supports agency-wise rate agreements.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsMultiCurrency;
