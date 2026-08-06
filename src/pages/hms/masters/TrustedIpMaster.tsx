import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Pencil, Shield, Trash2 } from "lucide-react";

type TrustedIp = {
  id: string;
  name: string;
  startIp: string;
  endIp: string;
  status: "active" | "inactive";
  createdBy: string;
};

const mockIps: TrustedIp[] = [
  { id: "1", name: "AIRTEL", startIp: "202.83.58.110", endIp: "202.83.58.110", status: "active", createdBy: "" },
  { id: "2", name: "Hospital LAN", startIp: "192.168.1.1", endIp: "192.168.1.254", status: "active", createdBy: "Admin" },
  { id: "3", name: "Branch - Rajapalayam", startIp: "103.50.162.1", endIp: "103.50.162.50", status: "active", createdBy: "Admin" },
  { id: "4", name: "Branch - Theni", startIp: "49.207.45.100", endIp: "49.207.45.110", status: "active", createdBy: "Admin" },
  { id: "5", name: "Franchise - Kochi", startIp: "117.239.80.1", endIp: "117.239.80.25", status: "active", createdBy: "Admin" },
  { id: "6", name: "VPN - Remote Doctors", startIp: "10.0.0.1", endIp: "10.0.0.100", status: "active", createdBy: "Admin" },
  { id: "7", name: "Old Office (Expired)", startIp: "59.92.100.50", endIp: "59.92.100.55", status: "inactive", createdBy: "Admin" },
];

const TrustedIpMaster = () => {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [startIp, setStartIp] = useState("");
  const [endIp, setEndIp] = useState("");

  const filtered = mockIps.filter(ip =>
    ip.name.toLowerCase().includes(search.toLowerCase()) ||
    ip.startIp.includes(search) || ip.endIp.includes(search)
  );

  const handleAdd = () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!startIp.trim()) return toast.error("Start IP is required");
    if (!endIp.trim()) return toast.error("End IP is required");
    toast.success(`Trusted IP "${name}" added successfully!`);
    setName(""); setStartIp(""); setEndIp("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" /> Trusted IP Master
          </h1>
          <p className="text-sm text-muted-foreground">
            Restrict HMS access to approved IP addresses only. Users outside these ranges will be blocked.
          </p>
        </div>
        <Badge variant="secondary">{mockIps.filter(i => i.status === "active").length} active IP ranges</Badge>
      </div>

      {/* Add Form */}
      <Card>
        <CardHeader className="pb-2 border-b bg-primary/5">
          <CardTitle className="text-base text-center text-primary">Manage Trusted IP</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label className="font-semibold">Name :</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-[180px]" />
            </div>
            <div>
              <Label className="font-semibold">Start Ip :</Label>
              <Input value={startIp} onChange={e => setStartIp(e.target.value)} placeholder="Start Ip" className="w-[180px]" />
            </div>
            <div>
              <Label className="font-semibold">End Ip :</Label>
              <Input value={endIp} onChange={e => setEndIp(e.target.value)} placeholder="End Ip" className="w-[180px]" />
            </div>
            <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="text-sm">Show <select className="border rounded px-2 py-1 text-xs"><option>100</option></select> entries</div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-orange-600">Name</TableHead>
                <TableHead className="text-orange-600">Start Ip</TableHead>
                <TableHead className="text-orange-600">End Ip</TableHead>
                <TableHead className="text-orange-600">Status</TableHead>
                <TableHead className="text-orange-600">Created By</TableHead>
                <TableHead className="text-orange-600"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ip => (
                <TableRow key={ip.id}>
                  <TableCell className="font-medium">{ip.name}</TableCell>
                  <TableCell className="font-mono text-sm">{ip.startIp}</TableCell>
                  <TableCell className="font-mono text-sm">{ip.endIp}</TableCell>
                  <TableCell>
                    <Badge className={ip.status === "active" ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-red-100 text-red-700 text-xs"}>
                      {ip.status} {ip.status === "active" && <Pencil className="h-2.5 w-2.5 inline ml-1" />}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ip.createdBy}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Badge className="bg-emerald-500 text-white text-xs cursor-pointer">✓</Badge>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No data available in table</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-3 text-xs text-muted-foreground border-t flex items-center justify-between">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Previous</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-muted">1</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustedIpMaster;
