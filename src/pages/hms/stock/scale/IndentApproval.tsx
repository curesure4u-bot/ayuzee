import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type IndentRecord = {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  transfer_reason: string | null;
  created_at: string;
  to_store_name?: string;
  from_store_name?: string;
};

const statusColors: Record<string, string> = { pending: "bg-amber-100 text-amber-700", approved: "bg-blue-100 text-blue-700", in_transit: "bg-purple-100 text-purple-700", received: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

export default function IndentApproval() {
  const [indents, setIndents] = useState<IndentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadIndents(); }, []);

  const loadIndents = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setIndents((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
        from_store_name: row.from_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load indents");
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await (supabase as any).from("hms_ward_stock_transfers").update({ status: "approved", approved_by: user?.id, approved_at: new Date().toISOString() }).eq("id", id);
      toast.success("Indent approved");
      loadIndents();
    } catch { toast.error("Failed"); }
  };

  const handleReject = async (id: string) => {
    try {
      await (supabase as any).from("hms_ward_stock_transfers").update({ status: "rejected" }).eq("id", id);
      toast.success("Indent rejected");
      loadIndents();
    } catch { toast.error("Failed"); }
  };

  const pending = indents.filter(i => i.status === "pending").length;
  const approved = indents.filter(i => i.status === "approved" || i.status === "in_transit").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><CheckCircle className="h-6 w-6 text-green-600" /> Indent Approval Workflow</h1>
        <p className="text-muted-foreground mt-1">Approve or reject pending transfer requests. Live from Supabase.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{indents.filter(i => i.status === "received").length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{indents.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Indent Queue</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">From → To</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {indents.map(ind => (
                  <tr key={ind.id} className={`border-b ${ind.status === "pending" ? "bg-amber-50/30" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{ind.product_name}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{ind.quantity}</td>
                    <td className="px-3 py-2 text-[10px]">{ind.from_store_name} → {ind.to_store_name}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[120px] truncate">{ind.transfer_reason || "—"}</td>
                    <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${statusColors[ind.status] || ""}`}>{ind.status}</Badge></td>
                    <td className="px-3 py-2 text-center">
                      {ind.status === "pending" && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" className="h-6 text-[10px] bg-green-600" onClick={() => handleApprove(ind.id)}>✓</Button>
                          <Button size="sm" variant="destructive" className="h-6 text-[10px]" onClick={() => handleReject(ind.id)}>✗</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">Approval Workflow</p>
            <p className="text-[10px] text-purple-700">All hms_ward_stock_transfers shown. Approve updates status + sets approved_by. Reject marks as 'rejected'. Pending items highlighted.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
