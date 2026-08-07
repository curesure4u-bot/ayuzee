import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, ArrowRight, CheckCircle, Clock, Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TransferRequest = {
  id: string;
  product_name: string;
  quantity: number;
  batch_number: string | null;
  transfer_reason: string | null;
  status: string;
  created_at: string;
  from_store_name?: string;
  to_store_name?: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  received: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function BranchTransferRequest() {
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      setRequests((data || []).map((row: any) => ({
        ...row,
        from_store_name: row.from_store?.ward_name || "—",
        to_store_name: row.to_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load transfers");
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .update({ status: "approved", approved_by: user?.id, approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Transfer approved");
      loadTransfers();
    } catch (err: any) {
      toast.error("Failed to approve");
    }
  };

  const handleDispatch = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .update({ status: "in_transit" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Transfer dispatched");
      loadTransfers();
    } catch (err: any) {
      toast.error("Failed to dispatch");
    }
  };

  const handleReceive = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .update({ status: "received", received_by: user?.id, received_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Transfer received");
      loadTransfers();
    } catch (err: any) {
      toast.error("Failed to receive");
    }
  };

  const pending = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const inTransit = requests.filter(r => r.status === "in_transit").length;
  const received = requests.filter(r => r.status === "received").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-blue-600" /> Branch-to-Branch Transfer</h1>
          <p className="text-muted-foreground mt-1">Manage transfer requests — approve, dispatch, receive. Live from Supabase.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold text-amber-600">{pending}</p><p className="text-[10px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600">{approved}</p><p className="text-[10px] text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ArrowRight className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold text-purple-600">{inTransit}</p><p className="text-[10px] text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600">{received}</p><p className="text-[10px] text-muted-foreground">Received</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Transfer Requests</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">From → To</th>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No transfer requests found</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-[10px]">{r.from_store_name}<br/><ArrowRight className="h-2.5 w-2.5 inline" /> {r.to_store_name}</td>
                      <td className="px-3 py-2 text-xs font-medium">{r.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{r.quantity}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px] truncate">{r.transfer_reason || "—"}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={`text-[10px] ${statusColors[r.status] || ""}`}>{r.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {r.status === "pending" && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleApprove(r.id)}>Approve</Button>}
                        {r.status === "approved" && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleDispatch(r.id)}>Dispatch</Button>}
                        {r.status === "in_transit" && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleReceive(r.id)}>Receive</Button>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI Transfer Intelligence</p>
            <p className="text-[10px] text-purple-700">
              {pending > 0 ? `${pending} transfers pending approval. ` : ""}
              {inTransit > 0 ? `${inTransit} currently in transit. ` : ""}
              Transfer flow is managed end-to-end: pending → approved → in_transit → received.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
