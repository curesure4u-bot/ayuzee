import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

interface LabMasterItem {
  id: string;
  group?: string;
  name: string;
  extra?: string; // For medicine disc content, etc.
}

interface LabMasterPageProps {
  title: string;
  entityName: string;
  columns: { key: string; label: string; color?: string }[];
  initialItems?: LabMasterItem[];
  groupOptions?: { value: string; label: string }[];
  hasGroupFilter?: boolean;
  extraFieldLabel?: string;
  extraFieldPlaceholder?: string;
}

const LabMasterPage = ({
  title,
  entityName,
  columns,
  initialItems = [],
  groupOptions,
  hasGroupFilter = false,
  extraFieldLabel,
  extraFieldPlaceholder,
}: LabMasterPageProps) => {
  const [items, setItems] = useState<LabMasterItem[]>(initialItems);
  const [newName, setNewName] = useState("");
  const [newExtra, setNewExtra] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(groupOptions?.[0]?.value || "");
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.group ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newName.trim()) { toast.error(`Please enter ${entityName}`); return; }
    const newItem: LabMasterItem = {
      id: Date.now().toString(),
      group: selectedGroup || groupOptions?.[0]?.label,
      name: newName.trim(),
      extra: newExtra.trim() || undefined,
    };
    setItems([...items, newItem]);
    setNewName("");
    setNewExtra("");
    toast.success(`${entityName} added successfully`);
  };

  const handleRemove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success(`${entityName} removed`);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage {title}</h2>
      </div>

      {/* Add Form */}
      <div className="flex items-end gap-3 flex-wrap">
        {hasGroupFilter && groupOptions && (
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {groupOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input
          placeholder={`Add ${entityName}`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-[300px]"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        {extraFieldLabel && (
          <Input
            placeholder={extraFieldPlaceholder || extraFieldLabel}
            value={newExtra}
            onChange={(e) => setNewExtra(e.target.value)}
            className="max-w-[200px]"
          />
        )}
        <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700">Add</Button>
      </div>

      {/* Entries + Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select className="border rounded px-2 py-1 text-sm"><option>100</option></select>
          <span>entries</span>
        </div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className={`px-4 py-3 text-left font-semibold ${col.color || "text-orange-600"}`}>
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-orange-600">Remove</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          {col.key === "group" ? item.group : col.key === "name" ? item.name : col.key === "extra" ? item.extra || "" : ""}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white h-7 w-7 p-0">1</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabMasterPage;
