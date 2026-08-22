import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Calendar, Plus, Loader2, AlertTriangle, Trash2, PartyPopper,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: "public" | "restricted" | "optional" | "company";
  description: string | null;
  isPaid: boolean;
  branchId: string | null;
}

// ─── Mock ────────────────────────────────────────────────────────────────────

const MOCK_HOLIDAYS: Holiday[] = [
  { id: "h1", name: "Republic Day", date: "2026-01-26", type: "public", description: "National Holiday", isPaid: true, branchId: null },
  { id: "h2", name: "Pongal", date: "2026-01-14", type: "public", description: "Harvest Festival", isPaid: true, branchId: null },
  { id: "h3", name: "Tamil New Year", date: "2026-04-14", type: "public", description: "Tamil Nadu New Year", isPaid: true, branchId: null },
  { id: "h4", name: "May Day", date: "2026-05-01", type: "public", description: "Labour Day", isPaid: true, branchId: null },
  { id: "h5", name: "Independence Day", date: "2026-08-15", type: "public", description: "National Holiday", isPaid: true, branchId: null },
  { id: "h6", name: "Vinayagar Chaturthi", date: "2026-09-07", type: "public", description: "Ganesh Chaturthi", isPaid: true, branchId: null },
  { id: "h7", name: "Gandhi Jayanti", date: "2026-10-02", type: "public", description: "National Holiday", isPaid: true, branchId: null },
  { id: "h8", name: "Deepavali", date: "2026-11-01", type: "public", description: "Festival of Lights", isPaid: true, branchId: null },
  { id: "h9", name: "Christmas", date: "2026-12-25", type: "public", description: "Christian Holiday", isPaid: true, branchId: null },
  { id: "h10", name: "Holi", date: "2026-03-17", type: "optional", description: "Festival of Colors", isPaid: true, branchId: null },
  { id: "h11", name: "Janmashtami", date: "2026-08-25", type: "optional", description: "Hindu Festival", isPaid: true, branchId: null },
  { id: "h12", name: "Good Friday", date: "2026-04-03", type: "public", description: "Christian Holiday", isPaid: true, branchId: null },
];

const typeColors: Record<string, string> = {
  public: "bg-green-100 text-green-700",
  restricted: "bg-amber-100 text-amber-700",
  optional: "bg-blue-100 text-blue-700",
  company: "bg-purple-100 text-purple-700",
};

// ─── Component ───────────────────────────────────────────────────────────────

const HrmsHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>(MOCK_HOLIDAYS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [typeFilter, setTypeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  // Form
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<string>("public");
  const [formDesc, setFormDesc] = useState("");

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await (supabase as any)
        .from("hrms_holidays")
        .select("*")
        .eq("is_active", true)
        .eq("year", Number(selectedYear))
        .order("date");

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setHolidays(data.map((h: any) => ({
          id: h.id,
          name: h.name,
          date: h.date,
          type: h.type,
          description: h.description,
          isPaid: h.is_paid,
          branchId: h.branch_id,
        })));
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Filter
  const filtered = holidays
    .filter((h) => typeFilter === "all" || h.type === typeFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Add holiday
  const handleAdd = async () => {
    if (!formName || !formDate) {
      toast.error("Name and date are required");
      return;
    }

    const { error } = await (supabase as any)
      .from("hrms_holidays")
      .insert({
        name: formName,
        date: formDate,
        type: formType,
        description: formDesc || null,
        is_paid: true,
        is_active: true,
      });

    if (error) {
      toast.error("Failed to add holiday");
    } else {
      toast.success("Holiday added");
      setAddOpen(false);
      setFormName(""); setFormDate(""); setFormType("public"); setFormDesc("");
      fetchHolidays();
    }
  };

  // Delete holiday
  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any)
      .from("hrms_holidays")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove holiday");
    } else {
      toast.success("Holiday removed");
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    }
  };

  // Upcoming holidays
  const today = new Date().toISOString().split("T")[0];
  const upcoming = filtered.filter((h) => h.date >= today).slice(0, 5);
  const past = filtered.filter((h) => h.date < today);

  // Stats
  const publicCount = holidays.filter((h) => h.type === "public").length;
  const optionalCount = holidays.filter((h) => h.type === "optional").length;
  const totalCount = holidays.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PartyPopper className="h-6 w-6 text-amber-600" /> Holiday Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Manage public, restricted & optional holidays</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Holiday
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-700">{totalCount}</p><p className="text-[10px] text-muted-foreground">Total Holidays</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-700">{publicCount}</p><p className="text-[10px] text-muted-foreground">Public / Gazetted</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{optionalCount}</p><p className="text-[10px] text-muted-foreground">Optional</p></CardContent></Card>
        <Card className="hidden sm:block"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-700">{upcoming.length}</p><p className="text-[10px] text-muted-foreground">Upcoming</p></CardContent></Card>
      </div>

      {/* Error */}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Showing demo data. {error}
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="public">Public / Gazetted</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
            <SelectItem value="optional">Optional</SelectItem>
            <SelectItem value="company">Company Holiday</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} holidays shown</span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      )}

      {/* Upcoming Highlights */}
      {!loading && upcoming.length > 0 && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" /> Next Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {upcoming.map((h) => {
                const daysUntil = Math.ceil((new Date(h.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={h.id} className="flex items-center gap-2 p-2 rounded-lg border bg-white">
                    <div className="text-center min-w-[40px]">
                      <p className="text-lg font-bold text-green-700">{new Date(h.date).getDate()}</p>
                      <p className="text-[9px] text-muted-foreground">{new Date(h.date).toLocaleDateString("en-IN", { month: "short" })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{h.name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days away`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday List */}
      {!loading && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Day</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Holiday</th>
                    <th className="px-3 py-2 text-center text-xs font-medium">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium">Description</th>
                    <th className="px-3 py-2 text-center text-xs font-medium w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h) => {
                    const d = new Date(h.date);
                    const isPast = h.date < today;
                    return (
                      <tr key={h.id} className={`border-b hover:bg-muted/20 ${isPast ? "opacity-60" : ""}`}>
                        <td className="px-3 py-2 text-xs font-medium">
                          {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </td>
                        <td className="px-3 py-2 font-medium text-sm">{h.name}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge className={`text-[9px] border-0 capitalize ${typeColors[h.type] || "bg-gray-100 text-gray-700"}`}>
                            {h.type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{h.description || "—"}</td>
                        <td className="px-3 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                            onClick={() => handleDelete(h.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">No holidays found for this year</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Add Holiday Dialog ───────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Holiday</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Holiday Name *</Label>
              <Input className="h-9" placeholder="e.g. Pongal" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date *</Label>
              <Input type="date" className="h-9" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public / Gazetted</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="company">Company Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input className="h-9" placeholder="Brief description..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HrmsHolidays;
