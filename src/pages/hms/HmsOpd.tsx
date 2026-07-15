import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Activity, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

type Token = {
  id: string;
  token_number: number;
  patient_name: string | null;
  patient_phone: string | null;
  status: string;
  department: string | null;
  token_date: string;
  created_at: string;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const HmsOpd = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTokens = async () => {
    const today = todayStr();
    const { data } = await (supabase as any)
      .from("vaidya_queue_tokens")
      .select("*")
      .eq("token_date", today)
      .order("token_number");
    setTokens(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadTokens();
    const channel = supabase
      .channel("hms-opd-tokens")
      .on("postgres_changes", { event: "*", schema: "public", table: "vaidya_queue_tokens" }, () => {
        loadTokens();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addToken = async () => {
    if (!name.trim()) return toast.error("Patient name is required");
    setSaving(true);
    const today = todayStr();
    const nextNum = tokens.length > 0 ? Math.max(...tokens.map((t) => t.token_number)) + 1 : 1;

    const { error } = await (supabase as any).from("vaidya_queue_tokens").insert({
      token_number: nextNum,
      patient_name: name.trim(),
      patient_phone: phone || null,
      department: dept || null,
      status: "waiting",
      token_date: today,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Token #${nextNum} issued for ${name}`);
    setName("");
    setPhone("");
    setDept("");
    setAddOpen(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any)
      .from("vaidya_queue_tokens")
      .update({ status })
      .eq("id", id);
    if (error) toast.error(error.message);
  };

  const waiting = tokens.filter((t) => t.status === "waiting");
  const inProgress = tokens.filter((t) => t.status === "in_progress");
  const completed = tokens.filter((t) => t.status === "completed");
  const cancelled = tokens.filter((t) => t.status === "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">OPD Queue & Tokens</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {tokens.length} tokens issued
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={loadTokens}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Token
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{waiting.length}</p><p className="text-xs text-muted-foreground">Waiting</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-blue-600">{inProgress.length}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{cancelled.length}</p><p className="text-xs text-muted-foreground">Cancelled</p></CardContent></Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Live Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading queue...</p>
          ) : tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No tokens issued today. Click "New Token" to start.</p>
          ) : (
            <div className="space-y-2">
              {tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {token.token_number}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{token.patient_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {token.department ?? "General"} {token.patient_phone ? `· ${token.patient_phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      token.status === "waiting" ? "secondary" :
                      token.status === "in_progress" ? "default" :
                      token.status === "completed" ? "outline" : "destructive"
                    }>
                      {token.status}
                    </Badge>
                    {token.status === "waiting" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(token.id, "in_progress")}>
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                    {token.status === "in_progress" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(token.id, "completed")}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {(token.status === "waiting" || token.status === "in_progress") && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(token.id, "cancelled")}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Token Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue New OPD Token</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Patient Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter patient name" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number" />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Ayurveda">Ayurveda</SelectItem>
                  <SelectItem value="Panchakarma">Panchakarma</SelectItem>
                  <SelectItem value="Yoga">Yoga Therapy</SelectItem>
                  <SelectItem value="Homeopathy">Homeopathy</SelectItem>
                  <SelectItem value="Siddha">Siddha</SelectItem>
                  <SelectItem value="Unani">Unani</SelectItem>
                  <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addToken} disabled={saving}>{saving ? "Issuing..." : "Issue Token"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HmsOpd;
