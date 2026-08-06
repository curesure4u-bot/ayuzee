import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Pencil } from "lucide-react";

const mockDepartments = [
  { id: "1", group: "Laboratory", name: "HAEMATOLOGY", status: "Active" },
  { id: "2", group: "Laboratory", name: "BIOCHEMISTRY", status: "Active" },
  { id: "3", group: "Laboratory", name: "ENDOCRINOLOGY", status: "Active" },
  { id: "4", group: "Laboratory", name: "HORMONES", status: "Active" },
  { id: "5", group: "Laboratory", name: "IMMUNOLOGY", status: "Active" },
  { id: "6", group: "Laboratory", name: "SEROLOGY", status: "Active" },
  { id: "7", group: "Laboratory", name: "FLUIDS", status: "Active" },
  { id: "8", group: "Laboratory", name: "MICROBIOLOGY", status: "Active" },
  { id: "9", group: "Laboratory", name: "CLINICAL PATHOLOGY", status: "Active" },
  { id: "10", group: "Laboratory", name: "AYUSH", status: "Active" },
];

const DepartmentMaster = () => {
  const [departments, setDepartments] = useState(mockDepartments);
  const [groupType, setGroupType] = useState("Laboratory");
  const [newDept, setNewDept] = useState("");
  const [search, setSearch] = useState("");

  const filtered = departments.filter((d) =>
    d.group === groupType && d.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newDept.trim()) { toast.error("Enter department name"); return; }
    setDepartments([...departments, { id: Date.now().toString(), group: groupType, name: newDept.trim().toUpperCase(), status: "Active" }]);
    setNewDept("");
    toast.success("Department added");
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage Department</Button>
        <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Store</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Lab Department</h2>
      </div>

      {/* Add Form */}
      <div className="flex items-end gap-3">
        <Select value={groupType} onValueChange={setGroupType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Laboratory">Laboratory</SelectItem>
            <SelectItem value="Radiology">Radiology</SelectItem>
            <SelectItem value="AYUSH">AYUSH</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Add Lab Department" value={newDept} onChange={(e) => setNewDept(e.target.value)} className="max-w-[300px]" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700">Add</Button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm"><span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span></div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Group</th>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Lab Department</th>
                <th className="px-4 py-3 text-left font-semibold text-orange-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((dept) => (
                <tr key={dept.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">{dept.group}</td>
                  <td className="px-4 py-3 font-medium">{dept.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-green-600 text-xs">active</span>
                    <button className="ml-2 text-blue-500"><Pencil className="h-3 w-3 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t text-sm text-muted-foreground">
            Showing 1 to {filtered.length} of {filtered.length} entries
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentMaster;
