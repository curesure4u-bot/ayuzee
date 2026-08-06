import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FlaskConical, Plus, Search, Download, Pencil } from "lucide-react";
import {
  ANTIBIOTIC_GROUPS, LAB_DEPARTMENTS, SAMPLES, ORGANISMS,
  SMEARS, MEDICINES_LAB, TEST_PROFILES, INVESTIGATIONS
} from "@/data/investigationMasterData";

const MODULES = [
  { id: "test", label: "🧪 Test" },
  { id: "group", label: "🟧 Group" },
  { id: "department", label: "📋 Department" },
  { id: "accession", label: "📄 Accession" },
  { id: "profile", label: "👥 Profile" },
  { id: "medicine", label: "💊 Medicine" },
  { id: "organism", label: "🦠 Organism" },
  { id: "smear", label: "🔬 Smear" },
  { id: "location", label: "📍 Location" },
  { id: "sample", label: "🧫 Sample" },
];

const InvestigationMaster = () => {
  const [sub, setSub] = useState("test");
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState("");

  const addItem = (type: string) => {
    if (!newItem.trim()) return toast.error(`Enter ${type} name`);
    toast.success(`${type} "${newItem}" added!`);
    setNewItem("");
  };

  // Simple list renderer
  const renderList = (title: string, data: string[], groupLabel?: string) => (
    <Card>
      <CardHeader className="pb-2 border-b bg-primary/5">
        <CardTitle className="text-base text-center text-primary">Manage {title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3">
          {groupLabel && <Select defaultValue={groupLabel}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={groupLabel}>{groupLabel}</SelectItem></SelectContent></Select>}
          <Input placeholder={`Add ${title}`} className="max-w-md" value={newItem} onChange={e => setNewItem(e.target.value)} />
          <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => addItem(title)}>Add</Button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Show 100 entries</span>
          <div className="relative w-48"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <Table><TableHeader><TableRow>
          {groupLabel && <TableHead className="text-orange-600">Group</TableHead>}
          <TableHead className="text-orange-600">{title}</TableHead>
          <TableHead className="text-orange-600 text-right">Remove</TableHead>
        </TableRow></TableHeader><TableBody>
          {data.filter(d => d.toLowerCase().includes(search.toLowerCase())).map((item, i) => (
            <TableRow key={i}>
              {groupLabel && <TableCell>{groupLabel}</TableCell>}
              <TableCell className="font-medium">{item}</TableCell>
              <TableCell className="text-right"><span className="text-red-500 cursor-pointer font-bold">✕</span></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
        <p className="text-xs text-muted-foreground">Showing 1 to {data.filter(d => d.toLowerCase().includes(search.toLowerCase())).length} of {data.length} entries</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-purple-600" /> Investigation Master</h1>
          <p className="text-sm text-muted-foreground">Configure diagnostic tests, parameters, lab departments, samples & profiles</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export</Button><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Test</Button></div>
      </div>

      {/* Sub-module nav */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          {MODULES.map(m => (
            <Button key={m.id} size="sm" variant={sub === m.id ? "default" : "outline"}
              className={sub === m.id ? "" : "border-orange-200 text-orange-700 hover:bg-orange-50"}
              onClick={() => { setSub(m.id); setSearch(""); }}>{m.label}</Button>
          ))}
        </div>
      </Card>

      {/* Content */}
      {sub === "group" && renderList("Group", ANTIBIOTIC_GROUPS)}
      {sub === "department" && renderList("Lab Department", LAB_DEPARTMENTS, "Laboratory")}
      {sub === "sample" && renderList("Sample", SAMPLES, "Sample")}
      {sub === "organism" && renderList("Organism", ORGANISMS)}
      {sub === "smear" && renderList("Smear", SMEARS)}
      {sub === "medicine" && renderList("Medicine", MEDICINES_LAB)}

      {sub === "accession" && (
        <Card>
          <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Accession Configuration</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /> Enable Location Based ID (digits: <Select defaultValue="3"><SelectTrigger className="w-14 h-7 inline-flex"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent></Select>)</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /> Enable Container ID</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /> Add Current Year</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Add Department</label>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => toast.success("Accession updated!")}>Update</Button>
              </div>
              <div className="space-y-3">
                <Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Location ID</TableHead><TableHead>Container ID</TableHead><TableHead>Dept</TableHead><TableHead>Sample ID</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-bold text-center">26</TableCell><TableCell className="font-bold text-center">001</TableCell><TableCell className="font-bold text-center">02</TableCell><TableCell></TableCell><TableCell className="font-bold text-center text-lg">00000024</TableCell></TableRow></TableBody></Table>
                <div className="border p-4 text-center rounded"><p className="font-mono text-sm">Patient Name (HMI-123)</p><div className="bg-black h-10 w-48 mx-auto mt-2 rounded"></div><p className="font-mono text-xs mt-1">2602001000000024</p><p className="font-mono font-bold">CBC</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sub === "profile" && (
        <Card>
          <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Test Profiles</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-3"><Input placeholder="Profile Name" className="max-w-md" value={newItem} onChange={e => setNewItem(e.target.value)} /><Button className="bg-orange-500 hover:bg-orange-600" onClick={() => addItem("Profile")}>Create Profile</Button></div>
            <Table><TableHeader><TableRow><TableHead className="text-orange-600">Profile Name</TableHead><TableHead className="text-orange-600">Tests Included</TableHead><TableHead className="text-orange-600">Price</TableHead><TableHead className="text-orange-600">Status</TableHead></TableRow></TableHeader><TableBody>
              {TEST_PROFILES.map((p, i) => (<TableRow key={i}><TableCell className="font-medium">{p.name}</TableCell><TableCell className="text-xs max-w-[300px]">{p.tests}</TableCell><TableCell className="font-semibold">₹{p.price}</TableCell><TableCell><Badge className="bg-emerald-100 text-emerald-700 text-xs">active</Badge></TableCell></TableRow>))}
            </TableBody></Table>
          </CardContent>
        </Card>
      )}

      {sub === "location" && (
        <Card>
          <CardHeader className="pb-2 border-b bg-primary/5"><CardTitle className="text-base text-center text-primary">Location Mapping</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Map investigations to branch locations. Tests only appear for mapped branches.</p>
            <div className="flex gap-3">
              <Select><SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Branch" /></SelectTrigger><SelectContent><SelectItem value="all">All Branches</SelectItem><SelectItem value="kadayanallur">Kadayanallur</SelectItem><SelectItem value="rajapalayam">Rajapalayam</SelectItem><SelectItem value="theni">Theni</SelectItem><SelectItem value="tirunelveli">Tirunelveli</SelectItem><SelectItem value="chennai">Chennai</SelectItem><SelectItem value="kochi">Kochi (Franchise)</SelectItem></SelectContent></Select>
              <Button className="bg-orange-500 hover:bg-orange-600">Load</Button>
            </div>
            <p className="text-center py-8 text-muted-foreground">Select a branch and click "Load" to view/edit test mappings.</p>
          </CardContent>
        </Card>
      )}

      {sub === "test" && (
        <Card>
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base text-primary">All Investigations ({INVESTIGATIONS.length})</CardTitle>
              <div className="flex gap-2"><Button size="sm" variant="outline" className="text-emerald-600">Active</Button><Button size="sm" variant="outline" className="text-red-600">Inactive</Button></div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="flex justify-between items-center p-3 border-b">
              <span className="text-sm">Show 100 entries</span>
              <div className="relative w-56"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-8" placeholder="Search test..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            </div>
            <Table><TableHeader><TableRow>
              <TableHead className="text-orange-600">Code</TableHead><TableHead className="text-orange-600">Test Name</TableHead><TableHead className="text-orange-600">Department</TableHead><TableHead className="text-orange-600">Category</TableHead><TableHead className="text-orange-600">Sample</TableHead><TableHead className="text-orange-600">TAT</TableHead><TableHead className="text-orange-600">Price</TableHead><TableHead className="text-orange-600">Params</TableHead><TableHead className="text-orange-600">Actions</TableHead>
            </TableRow></TableHeader><TableBody>
              {INVESTIGATIONS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase())).map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono font-bold text-xs">{t.code}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-xs">{t.dept}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{t.category}</Badge></TableCell>
                  <TableCell className="text-xs">{t.sample}</TableCell>
                  <TableCell className="text-xs">{t.tat}</TableCell>
                  <TableCell className="font-semibold">₹{t.price}</TableCell>
                  <TableCell>{t.params || "—"}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Pencil className="h-3 w-3" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
            <p className="p-3 text-xs text-muted-foreground border-t">Showing {INVESTIGATIONS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase())).length} of {INVESTIGATIONS.length} entries</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestigationMaster;
