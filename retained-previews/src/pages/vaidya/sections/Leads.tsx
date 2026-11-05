import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, PhoneCall } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["new", "contacted", "converted", "dropped"];

const Leads = () => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", call_type: "call", notes: "" });

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase.from("vaidya_leads").select("*").eq("doctor_user_id", userId).order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const submit = async () => {
    if (!userId) return;
    if (form.name.trim().length < 2) return toast.error("Name required");
    const { error } = await supabase.from("vaidya_leads").insert({
      doctor_user_id: userId,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      call_type: form.call_type,
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Lead added");
    setOpen(false);
    setForm({ name: "", phone: "", call_type: "call", notes: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("vaidya_leads").update({ lead_status: status }).eq("id", id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl">Ayuzee Leads</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="#">View Saved Orders</a></Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Add Lead</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New lead</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div>
                    <Label>Call type</Label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.call_type} onChange={(e) => setForm({ ...form, call_type: e.target.value })}>
                      <option value="call">Call</option>
                      <option value="chat">Chat</option>
                      <option value="online">Online consultation</option>
                    </select>
                  </div>
                  <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <PhoneCall className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No leads yet.</p>
        </Card>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-2">#</th>
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Phone</th>
                <th className="py-2 pr-2">Call type</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l, i) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="py-3 pr-2">{i + 1}</td>
                  <td className="py-3 pr-2 font-medium">{l.name}</td>
                  <td className="py-3 pr-2">{l.phone || "—"}</td>
                  <td className="py-3 pr-2 capitalize">{l.call_type}</td>
                  <td className="py-3 pr-2">
                    <select value={l.lead_status} onChange={(e) => updateStatus(l.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-2 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Leads;
