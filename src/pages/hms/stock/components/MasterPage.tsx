import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MasterItem {
  id: string;
  code: number;
  name: string;
  status: "Active" | "Inactive";
}

interface MasterPageProps {
  title: string;
  entityName: string;
  initialItems?: MasterItem[];
  columns?: { key: string; label: string }[];
  /**
   * Optional: column name in hms_ward_stock_items to fetch distinct values from.
   * e.g., "product_category" for CategoryMaster
   */
  stockItemColumn?: string;
  /** Storage key for localStorage persistence */
  storageKey?: string;
}

const MasterPage = ({ title, entityName, initialItems = [], stockItemColumn, storageKey }: MasterPageProps) => {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const persistKey = storageKey || `hms_master_${entityName.toLowerCase().replace(/\s+/g, "_")}`;

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);

    // Try to load from Supabase distinct values if stockItemColumn is specified
    if (stockItemColumn) {
      try {
        const { data, error } = await (supabase as any)
          .from("hms_ward_stock_items")
          .select(stockItemColumn)
          .not(stockItemColumn, "is", null);

        if (!error && data && data.length > 0) {
          const uniqueValues = [...new Set(data.map((d: any) => d[stockItemColumn]).filter(Boolean))];
          const supabaseItems: MasterItem[] = uniqueValues.map((val: any, idx: number) => ({
            id: `sb-${idx + 1}`,
            code: idx + 1,
            name: String(val).toUpperCase(),
            status: "Active" as const,
          }));

          // Merge with localStorage items (user-added)
          const stored = localStorage.getItem(persistKey);
          const localItems: MasterItem[] = stored ? JSON.parse(stored) : [];
          const merged = [...supabaseItems];
          localItems.forEach(li => {
            if (!merged.find(m => m.name === li.name)) {
              merged.push({ ...li, code: merged.length + 1 });
            }
          });

          setItems(merged.length > 0 ? merged : initialItems);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Supabase master load error:", err);
      }
    }

    // Fallback: load from localStorage or initialItems
    const stored = localStorage.getItem(persistKey);
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(initialItems);
      localStorage.setItem(persistKey, JSON.stringify(initialItems));
    }
    setLoading(false);
  };

  const persistItems = (updatedItems: MasterItem[]) => {
    setItems(updatedItems);
    localStorage.setItem(persistKey, JSON.stringify(updatedItems));
  };

  const activeItems = items.filter((i) => i.status === "Active");
  const inactiveItems = items.filter((i) => i.status === "Inactive");
  const displayItems = activeTab === "active" ? activeItems : inactiveItems;
  const filtered = displayItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newItemName.trim()) {
      toast.error(`Please enter ${entityName} name`);
      return;
    }
    const newItem: MasterItem = {
      id: Date.now().toString(),
      code: items.length + 1,
      name: newItemName.trim().toUpperCase(),
      status: "Active",
    };
    persistItems([...items, newItem]);
    setNewItemName("");
    toast.success(`${entityName} added successfully`);
  };

  const handleToggleStatus = (id: string) => {
    const updated = items.map((item) =>
      item.id === id
        ? { ...item, status: item.status === "Active" ? ("Inactive" as const) : ("Active" as const) }
        : item
    );
    persistItems(updated);
    toast.success("Status updated");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">
          {activeTab === "active" ? `Active ${title}` : `Inactive ${title}`}
        </h2>
      </div>

      {/* Add New (only on Active tab) */}
      {activeTab === "active" && (
        <div className="flex items-center gap-3 max-w-lg">
          <Input
            placeholder={`Add ${entityName}`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700">
            {entityName === "Indication" ? "Go" : "Add"}
          </Button>
        </div>
      )}

      {/* Toggle Active/Inactive */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setActiveTab(activeTab === "active" ? "inactive" : "active")}
          className={activeTab === "active" ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-green-600 text-white hover:bg-green-700"}
        >
          {activeTab === "active" ? "Inactive" : "Active"}
        </Button>
      </div>

      {/* Search + Entries */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select className="border rounded px-2 py-1 text-sm">
            <option>100</option>
            <option>50</option>
            <option>25</option>
          </select>
          <span>entries</span>
        </div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-8 text-sm"
            placeholder="Search:"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-orange-600 w-20">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-orange-600">{entityName}</th>
                  <th className="px-4 py-3 text-center w-16">
                    <input type="checkbox" className="rounded" disabled />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">{item.code}</td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="rounded"
                          onChange={() => handleToggleStatus(item.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterPage;
