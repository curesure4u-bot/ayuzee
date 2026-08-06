import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Search, Download, User, Calendar } from "lucide-react";

type LogEntry = {
  id: string; date: string; time: string; user: string; ip: string;
  action: string; message: string; parameters: string; module: string;
};

const mockLogs: LogEntry[] = [
  { id: "1", date: "2026-07-22", time: "09:30:15", user: "Mr. syed meeran", ip: "192.168.1.45", action: "LOGIN", message: "User logged in successfully", parameters: "Browser: Chrome 126, OS: Windows", module: "Auth" },
  { id: "2", date: "2026-07-22", time: "09:32:10", user: "Mr. syed meeran", ip: "192.168.1.45", action: "VIEW", message: "Viewed patient record", parameters: "PatientID: PH-001, Name: Ramesh Kumar", module: "Patient" },
  { id: "3", date: "2026-07-22", time: "09:45:22", user: "Mrs. Esakki", ip: "192.168.1.50", action: "CREATE", message: "New appointment created", parameters: "Patient: Priya Menon, Doctor: Dr. Arun, Date: 2026-07-23", module: "Appointment" },
  { id: "4", date: "2026-07-22", time: "10:00:05", user: "Mr. Jhon", ip: "192.168.1.48", action: "UPDATE", message: "Bill amount modified", parameters: "BillNo: OP-2026-1530, Old: ₹1500, New: ₹1800", module: "Billing" },
  { id: "5", date: "2026-07-22", time: "10:15:30", user: "Mrs. Mani", ip: "192.168.1.52", action: "PRINT", message: "Prescription printed", parameters: "Patient: Mohammed F., Rx: Rasnasaptakam", module: "Prescription" },
  { id: "6", date: "2026-07-22", time: "10:30:00", user: "Mr. Vignesh", ip: "192.168.1.55", action: "DELETE", message: "Cancelled appointment", parameters: "Apt ID: APT-2026-0892, Reason: Patient request", module: "Appointment" },
  { id: "7", date: "2026-07-22", time: "11:00:12", user: "Mrs. Lekha", ip: "192.168.1.60", action: "CREATE", message: "Lab order created", parameters: "Patient: Sunil Menon, Tests: CBC, LFT, RFT", module: "Lab" },
  { id: "8", date: "2026-07-22", time: "11:20:45", user: "Mr. syed meeran", ip: "192.168.1.45", action: "UPDATE", message: "Stock adjustment done", parameters: "Item: Rasnasaptakam 450ml, Qty: -5, Reason: Damage", module: "Stock" },
];

const users = ["Mr. syed meeran", "Mrs. Esakki", "Mr. Jhon", "Mrs. Mani", "Mr. Vignesh", "Mrs. Lekha"];

const HmsEntityLog = () => {
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [selectedUser, setSelectedUser] = useState("Mr. syed meeran");
  const [startDate, setStartDate] = useState("2026-07-22");
  const [endDate, setEndDate] = useState("2026-07-22");
  const [selectedLocation, setSelectedLocation] = useState("loc1");
  const [searchText, setSearchText] = useState("");

  const filtered = logs.filter(l => {
    if (selectedUser !== "all" && l.user !== selectedUser) return false;
    if (searchText && !l.message.toLowerCase().includes(searchText.toLowerCase()) && !l.action.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-orange-600 text-center">Entity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters - matching MocDoc layout */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end mb-4">
            <div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">location1 - #11, Main Ro...</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <div className="p-1"><Input placeholder="Search user..." className="h-7 text-xs" /></div>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(u => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs whitespace-nowrap">Start</span>
              <Input type="date" className="h-8 text-xs" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs whitespace-nowrap">End</span>
              <Input type="date" className="h-8 text-xs" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button className="h-8 bg-red-600 hover:bg-red-700 text-xs">Go</Button>
          </div>

          {/* Entity Log Info heading */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-orange-600">Entity Log Info</h3>
            <Button size="sm" variant="outline" className="h-7 text-xs bg-green-600 text-white hover:bg-green-700" onClick={() => toast.success("Exported as CSV")}>
              <Download className="mr-1 h-3 w-3" /> Export As CSV
            </Button>
          </div>

          {/* Table controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs">Show</span>
              <Select defaultValue="100"><SelectTrigger className="w-[70px] h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select>
              <span className="text-xs">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Search:</span>
              <Input className="w-[200px] h-7 text-xs" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
          </div>

          {/* Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b"><tr>
                <th className="px-3 py-2 text-left font-medium text-orange-700">S.No</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Date</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">IP</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Action</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Message</th>
                <th className="px-3 py-2 text-left font-medium text-orange-700">Parameters</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No data available in table</td></tr>
                ) : filtered.map((l, idx) => (
                  <tr key={l.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2 text-xs">{l.date} {l.time}</td>
                    <td className="px-3 py-2 text-xs font-mono">{l.ip}</td>
                    <td className="px-3 py-2"><Badge variant={l.action === "DELETE" ? "destructive" : l.action === "CREATE" ? "outline" : l.action === "UPDATE" ? "default" : "secondary"} className={`text-[10px] ${l.action === "CREATE" ? "text-green-600" : ""}`}>{l.action}</Badge></td>
                    <td className="px-3 py-2 text-xs">{l.message}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground max-w-[250px] truncate">{l.parameters}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Showing 0 to 0 of 0 entries</p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Previous</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsEntityLog;
