import { useEffect, useState, useCallback } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Address = Tables<"doctor_addresses">;

const empty = {
  full_name: "", address_line1: "", landmark: "", city: "", state: "",
  pincode: "", phone: "", alternate_phone: "", gstin: "", legal_entity_name: "", trade_name: "",
};

const DoctorAddresses = () => {
  const { userId } = useDoctor();
  const [list, setList] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const fetchList = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("doctor_addresses").select("*").eq("doctor_user_id", userId);
    setList(data ?? []);
  }, [userId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const save = async () => {
    if (!userId) return;
    const { error } = await supabase.from("doctor_addresses").insert({
      doctor_user_id: userId,
      is_default_shipping: list.length === 0,
      is_default_billing: list.length === 0,
      ...form,
    });
    if (error) toast.error(error.message);
    else { toast.success("Address added"); setForm(empty); setOpen(false); fetchList(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("doctor_addresses").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); fetchList(); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="p-6">
        <h1 className="mb-4 font-display text-2xl">My Addresses</h1>
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{a.full_name}</p>
                    {a.is_default_shipping && <Badge>Default Shipping</Badge>}
                    {a.is_default_billing && <Badge variant="secondary">Default Billing</Badge>}
                  </div>
                  <p className="mt-1 text-sm">Address: {a.address_line1}{a.landmark ? `, ${a.landmark}` : ""}</p>
                  <p className="text-sm">{a.city}, {a.state} - {a.pincode}</p>
                  <p className="text-sm">Phone: {a.phone}{a.alternate_phone ? ` / Alt: ${a.alternate_phone}` : ""}</p>
                  <p className="text-sm">GSTIN: <span className={a.gstin ? "" : "text-destructive"}>{a.gstin || "Not Added"}</span></p>
                  <p className="text-sm">Legal Entity: <span className={a.legal_entity_name ? "" : "text-destructive"}>{a.legal_entity_name || "Not Added"}</span></p>
                  <p className="text-sm">Trade Name: <span className={a.trade_name ? "" : "text-destructive"}>{a.trade_name || "Not Added"}</span></p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(a.id)}>Remove</Button>
              </div>
            </div>
          ))}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="w-full rounded-lg border-2 border-dashed border-primary/30 p-4 text-primary hover:bg-primary/5">
                <Plus className="mr-2 inline h-4 w-4" /> Add new address
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add address</DialogTitle></DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                {([
                  ["full_name", "Full name"], ["phone", "Phone"], ["alternate_phone", "Alternate phone"],
                  ["address_line1", "Address"], ["landmark", "Landmark"],
                  ["city", "City"], ["state", "State"], ["pincode", "Pincode"],
                  ["gstin", "GSTIN"], ["legal_entity_name", "Legal entity name"], ["trade_name", "Trade name"],
                ] as const).map(([k, l]) => (
                  <div key={k}>
                    <Label className="text-sm">{l}</Label>
                    <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
              <Button onClick={save}>Save address</Button>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};

export default DoctorAddresses;
