import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Address = Tables<"doctor_addresses">;

const empty = {
  full_name: "", address_line1: "", landmark: "", city: "", state: "",
  pincode: "", phone: "", alternate_phone: "",
};

const PatientAddresses = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [list, setList] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const fetchList = useCallback(async (id: string) => {
    const { data } = await supabase.from("doctor_addresses").select("*").eq("doctor_user_id", id);
    setList(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user.id ?? null;
      setUid(u);
      if (u) fetchList(u);
    });
  }, [fetchList]);

  const save = async () => {
    if (!uid) return;
    if (!form.full_name || !form.phone || !form.address_line1 || !form.pincode) {
      toast.error("Please fill name, phone, address and pincode");
      return;
    }
    const { error } = await supabase.from("doctor_addresses").insert({
      doctor_user_id: uid,
      is_default_shipping: list.length === 0,
      is_default_billing: list.length === 0,
      ...form,
    });
    if (error) toast.error(error.message);
    else { toast.success("Address added"); setForm(empty); setOpen(false); fetchList(uid); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("doctor_addresses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); if (uid) fetchList(uid); }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 font-display text-xl font-semibold">My Addresses</h1>
      </div>

      <div className="space-y-3 p-5">
        {list.map((a) => (
          <div key={a.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{a.full_name}</p>
                  {a.is_default_shipping && <Badge>Default Shipping</Badge>}
                  {a.is_default_billing && <Badge variant="secondary">Default Billing</Badge>}
                </div>
                <p className="mt-1 text-sm">{a.address_line1}{a.landmark ? `, ${a.landmark}` : ""}</p>
                <p className="text-sm">{a.city}, {a.state} - {a.pincode}</p>
                <p className="text-sm text-muted-foreground">
                  Phone: {a.phone}{a.alternate_phone ? ` / Alt: ${a.alternate_phone}` : ""}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(a.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 p-5 text-primary hover:bg-primary/5">
              <Plus className="h-5 w-5" /> <span className="font-medium">Add new address</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Add new address
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              {([
                ["full_name", "Full name *"], ["phone", "Phone *"], ["alternate_phone", "Alternate phone"],
                ["address_line1", "Address *"], ["landmark", "Landmark"],
                ["city", "City *"], ["state", "State *"], ["pincode", "Pincode *"],
              ] as const).map(([k, l]) => (
                <div key={k} className={k === "address_line1" ? "md:col-span-2" : ""}>
                  <Label className="text-sm">{l}</Label>
                  <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                </div>
              ))}
            </div>
            <Button onClick={save} className="w-full">Save address</Button>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default PatientAddresses;
