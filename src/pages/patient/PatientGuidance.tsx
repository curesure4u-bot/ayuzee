import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Apple, Activity, Pill, Video, FileText, Sparkles, Loader2, Bell, Sun, Moon, Coffee, Clock, Download, ExternalLink, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  diet: { label: "Diet", icon: Apple, color: "bg-rose-100 text-rose-700 border-rose-200" },
  yoga: { label: "Yoga", icon: Activity, color: "bg-amber-100 text-amber-700 border-amber-200" },
  medicine_schedule: { label: "Medicine", icon: Pill, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  lifestyle: { label: "Lifestyle", icon: Sparkles, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  other: { label: "Resources", icon: FileText, color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const TIME_BADGE: Record<string, { label: string; icon: any; color: string }> = {
  morning: { label: "Morning", icon: Sun, color: "bg-amber-100 text-amber-800 border-amber-200" },
  afternoon: { label: "Afternoon", icon: Coffee, color: "bg-orange-100 text-orange-800 border-orange-200" },
  evening: { label: "Evening", icon: Sun, color: "bg-rose-100 text-rose-800 border-rose-200" },
  night: { label: "Night", icon: Moon, color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  before_food: { label: "Before food", icon: Clock, color: "bg-slate-100 text-slate-700 border-slate-200" },
  after_food: { label: "After food", icon: Clock, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// localStorage keys for daily yoga checklist
const todayKey = (id: string) => `ayuzee_yoga_${id}_${new Date().toISOString().slice(0, 10)}`;

const PatientGuidance = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");
  const [yogaCheck, setYogaCheck] = useState<Record<string, Record<string, boolean>>>({});
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      const { data } = await (supabase as any).from("consultation_guidance")
        .select("*").eq("patient_user_id", auth.user.id)
        .order("created_at", { ascending: false }).limit(100);
      setItems(data || []);
      // hydrate daily yoga checklist from localStorage
      const map: Record<string, Record<string, boolean>> = {};
      (data || []).filter((d: any) => d.guidance_type === "yoga").forEach((d: any) => {
        try { map[d.id] = JSON.parse(localStorage.getItem(todayKey(d.id)) || "{}"); } catch {}
      });
      setYogaCheck(map);
      setLoading(false);
    };
    init();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((i) => i.guidance_type === tab);
  }, [items, tab]);

  const setReminder = async (item: any) => {
    if (!("Notification" in window)) { toast.error("Notifications not supported"); return; }
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm !== "granted") { toast.error("Permission denied"); return; }
    new Notification("⏰ Reminder set", { body: `We'll remind you for: ${item.title}` });
    // In-page reminder (1 minute demo) — production would use scheduled push or SW
    const times = item.schedule?.items?.flatMap((i: any) => i.times || []) || [];
    setTimeout(() => {
      try {
        new Notification("💊 Time for your medicine", { body: item.title + (times.length ? ` · ${times[0]}` : "") });
      } catch {}
    }, 60_000);
    toast.success("Reminder enabled — you'll get a browser notification");
  };

  const toggleAsana = (itemId: string, asana: string) => {
    setYogaCheck((prev) => {
      const cur = { ...(prev[itemId] || {}) };
      cur[asana] = !cur[asana];
      const next = { ...prev, [itemId]: cur };
      try { localStorage.setItem(todayKey(itemId), JSON.stringify(cur)); } catch {}
      return next;
    });
  };

  const markAcknowledged = async (item: any) => {
    const { error } = await (supabase as any).from("consultation_guidance")
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, acknowledged: true } : i));
    toast.success("Marked as acknowledged");
  };

  const savePdf = (item: any) => {
    // Use browser print → save as PDF (simple, no extra deps)
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) { toast.error("Pop-up blocked"); return; }
    const c = item.content || {};
    const meals = Array.isArray(c.meal_plan) ? c.meal_plan.map((m: any) =>
      `<li><strong style="text-transform:capitalize">${m.meal}:</strong> ${(m.suggestions || []).join(", ")}</li>`
    ).join("") : "";
    w.document.write(`<!doctype html><html><head><title>${item.title}</title>
      <style>body{font-family:system-ui;padding:32px;color:#0f172a;max-width:720px;margin:auto}
      h1{color:#047857}h2{color:#334155;margin-top:20px}ul{padding-left:20px}
      .tag{display:inline-block;background:#ecfdf5;color:#047857;padding:2px 8px;border-radius:12px;margin-right:6px;font-size:12px}
      .footer{margin-top:32px;text-align:center;color:#94a3b8;font-size:12px}</style></head><body>
      <h1>${item.title}</h1>
      ${c.do_eat?.length ? `<h2>✅ Eat</h2><p>${c.do_eat.map((x: string) => `<span class="tag">${x}</span>`).join("")}</p>` : ""}
      ${c.avoid?.length ? `<h2>🚫 Avoid</h2><p>${c.avoid.map((x: string) => `<span class="tag" style="background:#fee2e2;color:#b91c1c">${x}</span>`).join("")}</p>` : ""}
      ${meals ? `<h2>🍽 Meal plan</h2><ul>${meals}</ul>` : ""}
      ${c.notes ? `<h2>📝 Notes</h2><p>${c.notes}</p>` : ""}
      <div class="footer">Powered by Ayuzee · ${new Date().toLocaleDateString()}</div>
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const renderCard = (item: any) => {
    const meta = TYPE_META[item.guidance_type] || TYPE_META.other;
    const Icon = meta.icon;
    const c = item.content || {};

    return (
      <Card key={item.id} className="overflow-hidden p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`grid h-10 w-10 place-items-center rounded-md border ${meta.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{meta.label} · {new Date(item.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          {item.acknowledged && <Badge variant="outline" className="border-emerald-300 text-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" /> Acknowledged</Badge>}
        </div>

        {/* DIET */}
        {item.guidance_type === "diet" && (
          <div className="space-y-2 text-sm">
            {c.do_eat?.length ? (
              <p><span className="font-semibold text-emerald-700">Eat: </span>{c.do_eat.join(", ")}</p>
            ) : null}
            {c.avoid?.length ? (
              <p><span className="font-semibold text-rose-700">Avoid: </span>{c.avoid.join(", ")}</p>
            ) : null}
            {Array.isArray(c.meal_plan) && c.meal_plan.length > 0 && (
              <div className="rounded-md bg-slate-50 p-2 text-xs">
                {c.meal_plan.map((m: any, i: number) => (
                  <div key={i}><span className="font-medium capitalize">{m.meal}:</span> {(m.suggestions || []).join(", ")}</div>
                ))}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={() => savePdf(item)}>
              <Download className="mr-1 h-3.5 w-3.5" /> Save as PDF
            </Button>
          </div>
        )}

        {/* YOGA — checklist */}
        {item.guidance_type === "yoga" && (
          <div className="space-y-2 text-sm">
            {c.duration_minutes && <p className="text-xs text-slate-600">⏱ Duration: {c.duration_minutes}{c.best_time ? ` · 🕰 ${c.best_time}` : ""}</p>}
            <div className="space-y-1">
              {(c.asanas || []).map((a: string, i: number) => {
                const checked = !!yogaCheck[item.id]?.[a];
                return (
                  <label key={i} className={`flex items-center gap-2 rounded-md border px-3 py-2 ${checked ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}>
                    <Checkbox checked={checked} onCheckedChange={() => toggleAsana(item.id, a)} />
                    <span className={`text-sm ${checked ? "line-through text-slate-500" : "text-slate-800"}`}>{a}</span>
                  </label>
                );
              })}
            </div>
            {c.pranayama?.length ? <p className="text-xs"><span className="font-semibold">Pranayama:</span> {c.pranayama.join(", ")}</p> : null}
            <p className="text-xs text-emerald-700">
              ✅ Practiced {Object.values(yogaCheck[item.id] || {}).filter(Boolean).length}/{(c.asanas || []).length} today
            </p>
          </div>
        )}

        {/* MEDICINE SCHEDULE */}
        {item.guidance_type === "medicine_schedule" && (
          <div className="space-y-2 text-sm">
            {Array.isArray(item.schedule?.items) && item.schedule.items.map((it: any, i: number) => (
              <div key={i} className="rounded-md border border-slate-200 p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{it.name}</span>
                  {it.dose && <span className="text-xs text-slate-600">{it.dose}</span>}
                  {(it.times || []).map((t: string, j: number) => {
                    const tb = TIME_BADGE[t] || { label: t, icon: Clock, color: "bg-slate-100 text-slate-700 border-slate-200" };
                    const TI = tb.icon;
                    return <Badge key={j} variant="outline" className={`${tb.color} gap-1`}><TI className="h-3 w-3" />{tb.label}</Badge>;
                  })}
                </div>
                {it.notes && <p className="mt-1 text-xs text-slate-500">{it.notes}</p>}
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setReminder(item)}>
              <Bell className="mr-1 h-3.5 w-3.5" /> Set Reminder
            </Button>
          </div>
        )}

        {/* OTHER (video/pdf/lifestyle) */}
        {item.guidance_type === "other" && c.url && (
          <a href={c.url} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open resource
            </Button>
          </a>
        )}
        {item.guidance_type === "lifestyle" && (
          <div className="space-y-1 text-sm">
            {c.morning_routine?.length ? <p><Sun className="inline h-3 w-3" /> <span className="font-semibold">Morning:</span> {c.morning_routine.join(", ")}</p> : null}
            {c.evening_routine?.length ? <p><Moon className="inline h-3 w-3" /> <span className="font-semibold">Evening:</span> {c.evening_routine.join(", ")}</p> : null}
            {c.sleep && <p className="text-xs">🛌 {c.sleep}</p>}
            {c.exercise && <p className="text-xs">🏃 {c.exercise}</p>}
          </div>
        )}

        {c.notes && <p className="mt-2 text-xs text-slate-600">{c.notes}</p>}

        {!item.acknowledged && (
          <Button size="sm" variant="ghost" className="mt-2 text-emerald-700" onClick={() => markAcknowledged(item)}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark as read
          </Button>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Guidance</h1>
        <p className="text-sm text-slate-600">Diet plans, yoga protocols, medicine schedules and resources from your doctor.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="diet"><Apple className="mr-1 h-3.5 w-3.5" /> Diet</TabsTrigger>
          <TabsTrigger value="yoga"><Activity className="mr-1 h-3.5 w-3.5" /> Yoga</TabsTrigger>
          <TabsTrigger value="medicine_schedule"><Pill className="mr-1 h-3.5 w-3.5" /> Medicine</TabsTrigger>
          <TabsTrigger value="lifestyle"><Sparkles className="mr-1 h-3.5 w-3.5" /> Lifestyle</TabsTrigger>
          <TabsTrigger value="other"><FileText className="mr-1 h-3.5 w-3.5" /> Resources</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No guidance in this category yet. Your doctor will share plans here after consultations.
        </Card>
      ) : (
        <div ref={printRef} className="grid gap-3 md:grid-cols-2">
          {filtered.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default PatientGuidance;
