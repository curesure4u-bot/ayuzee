import { useEffect, useState, useCallback } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Landmark, Smartphone, Plus, BadgeCheck } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Bank = Tables<"doctor_bank_details">;

const DoctorBank = () => {
  const { userId } = useDoctor();
  const [list, setList] = useState<Bank[]>([]);
  const [openBank, setOpenBank] = useState(false);
  const [openUpi, setOpenUpi] = useState(false);
  const [bank, setBank] = useState({ account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "" });
  const [upi, setUpi] = useState({ upi_id: "", upi_name: "" });

  const fetchList = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("doctor_bank_details").select("*").eq("doctor_user_id", userId);
    setList(data ?? []);
  }, [userId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const saveBank = async () => {
    if (!userId) return;
    const { error } = await supabase.from("doctor_bank_details").insert({
      doctor_user_id: userId, type: "bank", ...bank, is_default: list.length === 0,
    });
    if (error) toast.error(error.message);
    else { toast.success("Bank added"); setOpenBank(false); setBank({ account_holder_name: "", account_number: "", ifsc_code: "", bank_name: "" }); fetchList(); }
  };

  const saveUpi = async () => {
    if (!userId) return;
    const { error } = await supabase.from("doctor_bank_details").insert({
      doctor_user_id: userId, type: "upi", ...upi, is_default: list.length === 0,
    });
    if (error) toast.error(error.message);
    else { toast.success("UPI added"); setOpenUpi(false); setUpi({ upi_id: "", upi_name: "" }); fetchList(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("doctor_bank_details").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); fetchList(); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="p-6">
        <h1 className="font-display text-2xl">Bank Details</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We collect your Bank/UPI details to securely process refunds, transfer consultation fees and Ayuzee Partner order margins. <strong>Default Account</strong> will be used for all payouts.
        </p>

        <div className="mt-5 space-y-3">
          {list.map((b) => (
            <div key={b.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  {b.type === "upi" ? (
                    <>
                      <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /><span className="font-medium">UPI ID</span><span>{b.upi_id}</span></div>
                      <div className="mt-1 text-sm">UPI Name: {b.upi_name}</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /><span className="font-medium">{b.bank_name}</span></div>
                      <div className="mt-1 text-sm">A/C: ••••{(b.account_number ?? "").slice(-4)} • IFSC: {b.ifsc_code}</div>
                      <div className="text-sm">Holder: {b.account_holder_name}</div>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {b.is_verified && <Badge className="bg-primary/15 text-primary"><BadgeCheck className="mr-1 h-3 w-3" />Verified</Badge>}
                  {b.is_default && <Badge variant="outline">Default</Badge>}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(b.id)}>Remove</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Dialog open={openBank} onOpenChange={setOpenBank}>
            <DialogTrigger asChild>
              <button className="rounded-lg border-2 border-dashed p-4 text-left hover:bg-muted/50">
                <Landmark className="mb-2 h-5 w-5 text-primary" />
                <div className="font-medium">Add Bank Account</div>
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
              <button className="rounded-lg border-2 border-dashed p-4 text-left hover:bg-muted/50">
                <Smartphone className="mb-2 h-5 w-5 text-primary" />
                <div className="font-medium">Add UPI ID</div>
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
      </Card>
    </div>
  );
};

export default DoctorBank;
