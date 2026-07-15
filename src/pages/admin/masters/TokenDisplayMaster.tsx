import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Monitor, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Branch = { id: string; branch_name: string };
type Cfg = {
  id?: string;
  branch_id: string;
  clinic_name_display: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  show_waiting_count: boolean;
  show_doctor_name: boolean;
  announcement_text: string;
  font_size_token: string;
  is_active: boolean;
};

const empty = (bid: string): Cfg => ({
  branch_id: bid, clinic_name_display: "Ayuzee Clinic",
  background_color: "#065f46", text_color: "#ffffff", accent_color: "#34d399",
  show_waiting_count: true, show_doctor_name: true,
  announcement_text: "Welcome to HMS Tools Ultra | Powered by Ayuzee",
  font_size_token: "xxlarge", is_active: true,
});

const SIZE_MAP: Record<string, string> = { large: "8vw", xlarge: "14vw", xxlarge: "20vw" };

export default function TokenDisplayMaster() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [cfg, setCfg] = useState<Cfg | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("hms_branches").select("id,branch_name").order("branch_name");
      const list = (data as any) ?? [];
      setBranches(list);
      if (list.length) setBranchId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!branchId) return;
    (async () => {
      const { data } = await supabase.from("hms_token_display_config").select("*").eq("branch_id", branchId).maybeSingle();
      setCfg((data as any) ?? empty(branchId));
    })();
  }, [branchId]);

  const save = async () => {
    if (!cfg) return;
    const payload: any = { ...cfg };
    delete payload.id;
    const q = cfg.id
      ? supabase.from("hms_token_display_config").update(payload).eq("id", cfg.id)
      : supabase.from("hms_token_display_config").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  if (!cfg) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <HmsMasterHeader title="🖥️ Token Display Config" description="Configure the waiting-room TV display screen per branch." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 space-y-3">
          <div>
            <Label>Branch</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.branch_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Clinic Name Display</Label><Input value={cfg.clinic_name_display} onChange={(e) => setCfg({ ...cfg, clinic_name_display: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>BG</Label><Input type="color" value={cfg.background_color} onChange={(e) => setCfg({ ...cfg, background_color: e.target.value })} /></div>
            <div><Label>Text</Label><Input type="color" value={cfg.text_color} onChange={(e) => setCfg({ ...cfg, text_color: e.target.value })} /></div>
            <div><Label>Accent</Label><Input type="color" value={cfg.accent_color} onChange={(e) => setCfg({ ...cfg, accent_color: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2"><Switch checked={cfg.show_waiting_count} onCheckedChange={(c) => setCfg({ ...cfg, show_waiting_count: c })} /><Label>Show Waiting Count</Label></div>
          <div className="flex items-center gap-2"><Switch checked={cfg.show_doctor_name} onCheckedChange={(c) => setCfg({ ...cfg, show_doctor_name: c })} /><Label>Show Doctor Name</Label></div>
          <div><Label>Announcement Ticker</Label><Textarea rows={2} value={cfg.announcement_text} onChange={(e) => setCfg({ ...cfg, announcement_text: e.target.value })} /></div>
          <div>
            <Label>Font Size</Label>
            <RadioGroup value={cfg.font_size_token} onValueChange={(v) => setCfg({ ...cfg, font_size_token: v })} className="flex gap-4 mt-1">
              <label className="flex items-center gap-1"><RadioGroupItem value="large" />Large</label>
              <label className="flex items-center gap-1"><RadioGroupItem value="xlarge" />X-Large</label>
              <label className="flex items-center gap-1"><RadioGroupItem value="xxlarge" />XX-Large</label>
            </RadioGroup>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>Save Config</Button>
            <Button variant="outline" asChild>
              <a href={`/queue-display/${branchId}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />Open Full Screen
              </a>
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Monitor className="h-4 w-4" />Live Preview</div>
          <div className="aspect-video w-full overflow-hidden rounded-lg" style={{ background: cfg.background_color, color: cfg.text_color }}>
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-2 text-sm" style={{ background: "rgba(0,0,0,0.2)" }}>
                <span>⚡ HMS Tools Ultra</span>
                <span>{cfg.clinic_name_display}</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="text-xs uppercase tracking-widest" style={{ color: cfg.accent_color }}>NOW SERVING</div>
                <div className="font-bold leading-none" style={{ fontSize: SIZE_MAP[cfg.font_size_token] }}>07</div>
                {cfg.show_doctor_name && <div className="mt-2 text-sm opacity-80">Dr. Saleem — OPD</div>}
              </div>
              <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ background: "rgba(0,0,0,0.2)" }}>
                {cfg.show_waiting_count && <span>Waiting: 12 patients</span>}
                <span className="truncate">{cfg.announcement_text}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
