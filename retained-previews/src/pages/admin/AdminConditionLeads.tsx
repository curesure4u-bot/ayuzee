import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Mail } from "lucide-react";

interface Lead {
  id: string;
  condition_slug: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  package_label: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const statuses = ["new", "contacted", "converted", "closed"];

const AdminConditionLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("condition_leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("condition_leads").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Condition Leads</h1>
        <p className="text-sm text-muted-foreground">Patient enquiries from Health Condition pages.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-12 text-center text-muted-foreground">No leads yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="p-3">Patient</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Package</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="p-3 font-medium">{l.full_name}</td>
                  <td className="p-3">
                    <a href={`tel:${l.phone}`} className="flex items-center gap-1 text-primary hover:underline"><Phone className="h-3 w-3" /> {l.phone}</a>
                    {l.email && <a href={`mailto:${l.email}`} className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:underline"><Mail className="h-3 w-3" /> {l.email}</a>}
                  </td>
                  <td className="p-3">{l.condition_slug ?? "—"}</td>
                  <td className="p-3">{l.package_label ?? "—"}</td>
                  <td className="p-3 max-w-xs truncate text-muted-foreground" title={l.notes ?? undefined}>{l.notes ?? "—"}</td>
                  <td className="p-3">
                    <Select value={l.status} onValueChange={(v) => setStatus(l.id, v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminConditionLeads;
