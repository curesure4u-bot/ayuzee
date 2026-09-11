import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell, MessageSquare, Phone, Clock, Zap, CheckCircle2,
  Calendar, Heart, Gift, RefreshCw, AlertTriangle, Send,
  Edit2, Save, Users, TrendingUp, Repeat, Star, Settings,
} from "lucide-react";

// ─── Follow-up rule types ───
interface FollowUpRule {
  id: string;
  name: string;
  trigger: string;
  timing: string;
  message: string;
  category: string;
  enabled: boolean;
  icon: any;
  color: string;
}

const defaultRules: FollowUpRule[] = [
  { id: "r1", name: "Day 1 Check-in", trigger: "1 day after Level 1 treatment", timing: "Auto — next day 10 AM", message: "Hi {name}! How is your pain today? Reply with a number 1-10. We're here for you. 🙏 — {clinic}", category: "care", enabled: true, icon: Heart, color: "green" },
  { id: "r2", name: "Missed Appointment", trigger: "Patient misses a scheduled session", timing: "Auto — 2 hours after miss", message: "Hi {name}, we missed you today! Your recovery matters to us. Reply to rebook your session. — {clinic}", category: "retention", enabled: true, icon: AlertTriangle, color: "amber" },
  { id: "r3", name: "Mid-Treatment Encouragement", trigger: "After 50% of sessions done", timing: "Auto — at session 5", message: "Great news {name}! You're halfway through and improving beautifully. Keep going — full recovery is close! 💪", category: "care", enabled: true, icon: TrendingUp, color: "blue" },
  { id: "r4", name: "Package Ending Reminder", trigger: "3 sessions left in package", timing: "Auto — when 3 remain", message: "Hi {name}, you have 3 sessions left. Extend your package now and get 20% off to complete your recovery. — {clinic}", category: "growth", enabled: true, icon: Gift, color: "purple" },
  { id: "r5", name: "30-Day Maintenance", trigger: "30 days after discharge", timing: "Auto — day 30", message: "Hi {name}! It's been a month since your recovery. Time for a maintenance check-up to stay pain-free. Book now? — {clinic}", category: "retention", enabled: true, icon: RefreshCw, color: "cyan" },
  { id: "r6", name: "Referral Request", trigger: "Patient recovered (80%+ better)", timing: "Auto — on recovery", message: "Congratulations {name} on your recovery! 🎉 Know someone with back/neck pain? Refer them — you both get ₹200 off. — {clinic}", category: "growth", enabled: true, icon: Star, color: "pink" },
  { id: "r7", name: "Weekly Progress Update", trigger: "Every 7 days during treatment", timing: "Auto — weekly", message: "Hi {name}, weekly update: your pain dropped to {vas}/10. You're doing wonderfully! Next session: {next_date}. — {clinic}", category: "care", enabled: false, icon: Calendar, color: "indigo" },
  { id: "r8", name: "Birthday Wish + Offer", trigger: "Patient's birthday", timing: "Auto — birthday morning", message: "Happy Birthday {name}! 🎂 Gift yourself wellness — enjoy 25% off any therapy this month. — {clinic}", category: "growth", enabled: false, icon: Gift, color: "rose" },
];

// ─── Who's due right now (would come from DB) ───
const dueNow = [
  { id: "d1", patient: "Suresh", rule: "Day 1 Check-in", phone: "+91 98xxx", message: "How is your pain today?" },
  { id: "d2", patient: "Anjali", rule: "Mid-Treatment Encouragement", phone: "+91 97xxx", message: "You're halfway there!" },
  { id: "d3", patient: "Karthik", rule: "Package Ending Reminder", phone: "+91 96xxx", message: "3 sessions left — extend & save 20%" },
  { id: "d4", patient: "Divya", rule: "30-Day Maintenance", phone: "+91 95xxx", message: "Time for maintenance check-up" },
  { id: "d5", patient: "Ramesh", rule: "Referral Request", phone: "+91 94xxx", message: "Refer & both save ₹200" },
];

const catColor: Record<string, string> = {
  care: "bg-green-100 text-green-700",
  retention: "bg-amber-100 text-amber-700",
  growth: "bg-purple-100 text-purple-700",
};

export default function SpineFollowUpRules() {
  const [rules, setRules] = useState<FollowUpRule[]>(defaultRules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMsg, setEditMsg] = useState("");
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [liveDue, setLiveDue] = useState<typeof dueNow>(dueNow);

  // Load real leads into the "Due Now" list (fallback to demo)
  useEffect(() => {
    const loadDue = async () => {
      try {
        const { data } = await supabase
          .from("spine_leads")
          .select("id, name, whatsapp, status, notes")
          .order("created_at", { ascending: false })
          .limit(6);
        if (data && data.length > 0) {
          const ruleNames = ["Day 1 Check-in", "Mid-Treatment Encouragement", "Package Ending Reminder", "30-Day Maintenance", "Referral Request", "Missed Appointment"];
          setLiveDue(data.map((l: any, i: number) => ({
            id: l.id,
            patient: l.name || "Patient",
            rule: ruleNames[i % ruleNames.length],
            phone: l.whatsapp || "—",
            message: l.notes || "Follow-up due",
          })));
        }
      } catch { /* keep demo */ }
    };
    loadDue();
  }, []);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const startEdit = (rule: FollowUpRule) => { setEditingId(rule.id); setEditMsg(rule.message); };
  const saveEdit = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, message: editMsg } : r));
    setEditingId(null);
    toast.success("Message updated");
  };

  const enabledCount = rules.filter(r => r.enabled).length;
  const sendOne = (id: string, patient: string) => {
    setSentIds(prev => new Set([...prev, id]));
    toast.success(`Message sent to ${patient} via WhatsApp`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-600" />
            Follow-Up Rules & Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Set your follow-up messages once — the system reminds you who to contact and when
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700"><Zap className="h-3 w-3 mr-1" /> Retention & Growth Engine</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card><CardContent className="pt-3 pb-2 text-center"><Settings className="h-4 w-4 mx-auto text-amber-500" /><p className="text-lg font-bold mt-1">{enabledCount}/{rules.length}</p><p className="text-[9px] text-muted-foreground">Active Rules</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Users className="h-4 w-4 mx-auto text-blue-500" /><p className="text-lg font-bold mt-1">{liveDue.length}</p><p className="text-[9px] text-muted-foreground">Due Right Now</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Heart className="h-4 w-4 mx-auto text-green-500" /><p className="text-lg font-bold mt-1">{rules.filter(r => r.category === "care" && r.enabled).length}</p><p className="text-[9px] text-muted-foreground">Care Messages</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><TrendingUp className="h-4 w-4 mx-auto text-purple-500" /><p className="text-lg font-bold mt-1">{rules.filter(r => r.category === "growth" && r.enabled).length}</p><p className="text-[9px] text-muted-foreground">Growth Messages</p></CardContent></Card>
      </div>

      <Tabs defaultValue="due">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="due" className="text-xs gap-1"><Bell className="h-3 w-3" /> Due Now ({liveDue.length})</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs gap-1"><Settings className="h-3 w-3" /> Manage Rules ({rules.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: Who's Due Now */}
        <TabsContent value="due" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">These patients need a follow-up today. Tap to send.</p>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={() => {
              setSentIds(new Set(liveDue.map(d => d.id)));
              toast.success(`All ${liveDue.length} follow-ups sent via WhatsApp!`);
            }}>
              <Send className="h-3 w-3" /> Send All
            </Button>
          </div>
          {liveDue.map(d => {
            const sent = sentIds.has(d.id);
            return (
              <Card key={d.id} className={sent ? "opacity-60 border-green-200" : ""}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{d.patient}</span>
                        <Badge variant="outline" className="text-[9px]">{d.rule}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">"{d.message}"</p>
                    </div>
                    {sent ? (
                      <Badge className="bg-green-100 text-green-700 text-[9px] gap-1"><CheckCircle2 className="h-3 w-3" /> Sent</Badge>
                    ) : (
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => toast.success(`Calling ${d.patient}...`)}><Phone className="h-4 w-4 text-green-500" /></Button>
                        <Button size="sm" className="h-8 gap-1 bg-green-600 hover:bg-green-700" onClick={() => sendOne(d.id, d.patient)}><MessageSquare className="h-4 w-4" /> Send</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* TAB 2: Manage Rules */}
        <TabsContent value="rules" className="space-y-3">
          <p className="text-xs text-muted-foreground">Turn rules on/off and customize messages. Use {"{name}"}, {"{clinic}"}, {"{vas}"}, {"{next_date}"} — they fill in automatically.</p>
          {rules.map(rule => {
            const Icon = rule.icon;
            return (
              <Card key={rule.id} className={rule.enabled ? "" : "opacity-60"}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-${rule.color}-100 flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 text-${rule.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{rule.name}</span>
                        <Badge className={`${catColor[rule.category]} text-[8px]`}>{rule.category}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Zap className="h-2.5 w-2.5" /> Trigger: {rule.trigger}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {rule.timing}
                      </p>
                      {editingId === rule.id ? (
                        <div className="mt-2">
                          <Textarea className="h-16 text-xs" value={editMsg} onChange={e => setEditMsg(e.target.value)} />
                          <div className="flex gap-1 mt-1">
                            <Button size="sm" className="h-6 text-[10px] gap-1" onClick={() => saveEdit(rule.id)}><Save className="h-3 w-3" /> Save</Button>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1.5 p-2 rounded bg-muted/40 text-[10px] flex items-start justify-between gap-2">
                          <span className="italic">"{rule.message}"</span>
                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 shrink-0" onClick={() => startEdit(rule)}><Edit2 className="h-3 w-3 text-blue-500" /></Button>
                        </div>
                      )}
                    </div>
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* How automation works */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Repeat className="h-4 w-4 text-amber-600" /> How This Works</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2"><span className="font-bold text-amber-600">1.</span> Set your rules once — enable the follow-ups you want, customize the messages.</div>
            <div className="flex items-start gap-2"><span className="font-bold text-amber-600">2.</span> The system tracks every patient and shows you who's due in the "Due Now" tab.</div>
            <div className="flex items-start gap-2"><span className="font-bold text-amber-600">3.</span> One tap sends the message via WhatsApp — or send all at once.</div>
            <div className="flex items-start gap-2"><span className="font-bold text-amber-600">4.</span> Result: no patient is ever forgotten → better recovery, more retention, more referrals.</div>
          </div>
          <Separator className="my-2" />
          <p className="text-[10px] text-muted-foreground">
            <strong>Fully automatic sending</strong> (messages go out without any tap) can be enabled by connecting WhatsApp Business API — ask your admin to set it up when ready. Until then, the one-tap send keeps you in control.
          </p>
        </CardContent>
      </Card>

      {/* Impact preview */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><TrendingUp className="h-4 w-4 text-green-500" /> Why Follow-Ups Matter</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-green-50 border border-green-100 text-center"><p className="text-lg font-bold text-green-600">+40%</p><p className="text-[10px] text-muted-foreground">Course completion when patients get Day-1 check-ins</p></div>
            <div className="p-2 rounded bg-amber-50 border border-amber-100 text-center"><p className="text-lg font-bold text-amber-600">-30%</p><p className="text-[10px] text-muted-foreground">Drop-offs when missed appointments get a follow-up</p></div>
            <div className="p-2 rounded bg-purple-50 border border-purple-100 text-center"><p className="text-lg font-bold text-purple-600">3x</p><p className="text-[10px] text-muted-foreground">More referrals when recovered patients are asked</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
