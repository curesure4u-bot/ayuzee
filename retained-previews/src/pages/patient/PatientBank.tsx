import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Landmark, Smartphone, BadgeCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Bank = Tables<"doctor_bank_details">;

const PatientBank = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [list, setList] = useState<Bank[]>([]);
  const [openBank, setOpenBank] = useState(false);
  const [openUpi, setOpenUpi] = useState(false);
  const [bank, setBank] = useState({ account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "" });
  const [upi, setUpi] = useState({ upi_id: "", upi_name: "" });

  const fetchList = useCallback(async (id: string) => {
    const { data } = await supabase.from("doctor_bank_details").select("*").eq("doctor_user_id", id);
    setList(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user.id ?? null;
      setUid(u);
      if (u) fetchList(u);
    });
  }, [fetchList]);

  const saveBank = async () => {
    if (!uid) return;
    if (!bank.account_number || !bank.ifsc_code) return toast.error("Account number and IFSC required");
    const { error } = await supabase.from("doctor_bank_details").insert({
      doctor_user_id: uid, type: "bank", ...bank, is_default: list.length === 0,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Bank added"); setOpenBank(false);
      setBank({ account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "" });
      fetchList(uid);
    }
  };

  const saveUpi = async () => {
    if (!uid) return;
    if (!upi.upi_id) return toast.error("UPI ID required");
    const { error } = await supabase.from("doctor_bank_details").insert({
      doctor_user_id: uid, type: "upi", ...upi, is_default: list.length === 0,
    });
    if (error) toast.error(error.message);
    else { toast.success("UPI added"); setOpenUpi(false); setUpi({ upi_id: "", upi_name: "" }); fetchList(uid); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("doctor_bank_details").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); if (uid) fetchList(uid); }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 font-display text-xl font-semibold">Bank Details</h1>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm text-muted-foreground">
          We collect your Bank/UPI Details to securely process return refunds.{" "}
          <strong className="text-foreground">Default Account</strong> will be used for all payouts.
        </p>

        {list.length > 0 && (
          <div className="space-y-3">
            {list.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {b.type === "upi" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <span className="font-medium">UPI ID</span>
                          <span>{b.upi_id}</span>
                        </div>
                        {b.upi_name && <div className="mt-1 text-sm text-muted-foreground">Name: {b.upi_name}</div>}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4 text-primary" />
                          <span className="font-medium">{b.bank_name}</span>
                        </div>
                        <div className="mt-1 text-sm">A/C: ••••{(b.account_number ?? "").slice(-4)} • IFSC: {b.ifsc_code}</div>
                        <div className="text-sm text-muted-foreground">Holder: {b.account_holder_name}</div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {b.is_verified && (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                        <BadgeCheck className="mr-1 h-3 w-3" />Verified
                      </Badge>
                    )}
                    {b.is_default && <Badge variant="outline">Default</Badge>}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(b.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <Dialog open={openBank} onOpenChange={setOpenBank}>
            <DialogTrigger asChild>
              <button className="rounded-lg border-2 border-dashed border-border p-5 text-left transition hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10">
                    <Landmark className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <div className="font-medium">Add Bank Account</div>
                    <div className="text-xs text-muted-foreground"><Plus className="inline h-3 w-3" /> for refunds & payouts</div>
                  </div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Account holder name</Label><Input value={bank.account_holder_name} onChange={(e) => setBank({ ...bank, account_holder_name: e.target.value })} /></div>
                <div><Label>Account number</Label><Input value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} /></div>
                <div><Label>IFSC code</Label><Input value={bank.ifsc_code} onChange={(e) => setBank({ ...bank, ifsc_code: e.target.value })} /></div>
                <div><Label>Bank name</Label><Input value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} /></div>
                <Button onClick={saveBank} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openUpi} onOpenChange={setOpenUpi}>
            <DialogTrigger asChild>
              <button className="rounded-lg border-2 border-dashed border-border p-5 text-left transition hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100">
                    <Smartphone className="h-5 w-5 text-amber-700" />
                  </span>
                  <div>
                    <div className="font-medium">Add UPI ID</div>
                    <div className="text-xs text-muted-foreground"><Plus className="inline h-3 w-3" /> instant refunds</div>
                  </div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add UPI ID</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>UPI ID</Label><Input value={upi.upi_id} onChange={(e) => setUpi({ ...upi, upi_id: e.target.value })} placeholder="name@bank" /></div>
                <div><Label>UPI name</Label><Input value={upi.upi_name} onChange={(e) => setUpi({ ...upi, upi_name: e.target.value })} /></div>
                <Button onClick={saveUpi} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

export default PatientBank;
