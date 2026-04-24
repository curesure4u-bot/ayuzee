import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Student = { id: string; user_id: string; full_name: string; phone: string | null; course: string | null; year_of_study: number | null; college_name: string | null; city: string | null; is_verified: boolean | null; rejection_note: string | null; student_id_url: string | null };
const tabs = ["all", "pending", "verified", "rejected"];
const statusOf = (s: Student) => s.is_verified ? "verified" : s.rejection_note ? "rejected" : "pending";

const AdminStudents = () => {
  const [rows, setRows] = useState<Student[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [rejectFor, setRejectFor] = useState<Student | null>(null);
  const [reason, setReason] = useState("");
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [stats, setStats] = useState({ enrolled: 0, certificates: 0 });
  const load = async () => {
    const [students, progress, certs] = await Promise.all([
      (supabase as any).from("student_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("lms_progress").select("id", { count: "exact", head: true }),
      supabase.from("lms_certificates").select("id", { count: "exact", head: true }),
    ]);
    setRows((students.data ?? []) as Student[]);
    setStats({ enrolled: progress.count ?? 0, certificates: certs.count ?? 0 });
  };
  useEffect(() => { document.title = "Admin · Students — Ayuzee"; load(); }, []);
  const filtered = useMemo(() => rows.filter((s) => (tab === "all" || statusOf(s) === tab) && (!query || `${s.full_name} ${s.course ?? ""} ${s.college_name ?? ""}`.toLowerCase().includes(query.toLowerCase()))), [rows, tab, query]);
  const verify = async (s: Student) => { const { error } = await (supabase as any).from("student_profiles").update({ is_verified: true, rejection_note: null }).eq("id", s.id); if (error) return toast.error(error.message); await supabase.from("user_roles").upsert({ user_id: s.user_id, role: "student" as any }, { onConflict: "user_id,role" }); if (s.phone) await supabase.functions.invoke("send-whatsapp", { body: { to: s.phone, message: "Your Ayuzee student account is verified" } }); toast.success("Student verified"); load(); };
  const reject = async () => { if (!rejectFor) return; const { error } = await (supabase as any).from("student_profiles").update({ is_verified: false, rejection_note: reason }).eq("id", rejectFor.id); if (error) return toast.error(error.message); if (rejectFor.phone) await supabase.functions.invoke("send-whatsapp", { body: { to: rejectFor.phone, message: `Your Ayuzee student verification was rejected. Reason: ${reason}` } }); toast.success("Student rejected"); setRejectFor(null); setReason(""); load(); };
  const openId = async (s: Student) => { if (!s.student_id_url) return toast.error("Student ID not uploaded"); const { data } = await supabase.storage.from("student-docs").createSignedUrl(s.student_id_url, 900); if (data?.signedUrl) window.open(data.signedUrl, "_blank"); };
  const sendAnnouncement = async () => { const targets = rows.filter((s) => s.is_verified && s.phone); await Promise.all(targets.map((s) => supabase.functions.invoke("send-whatsapp", { body: { to: s.phone, message: announcement } }))); toast.success(`Announcement sent to ${targets.length} students`); setAnnouncementOpen(false); setAnnouncement(""); };
  const statCards = [["Total", rows.length], ["Verified", rows.filter((s) => s.is_verified).length], ["Courses enrolled", stats.enrolled], ["Certificates issued", stats.certificates]];

  return <div className="space-y-6"><div className="flex items-center justify-between gap-4"><div><h1 className="font-display text-3xl">Students</h1><p className="text-sm text-muted-foreground">Verify student identities and send announcements.</p></div><Button onClick={() => setAnnouncementOpen(true)}>Send Announcement</Button></div><div className="grid gap-3 sm:grid-cols-4">{statCards.map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-2xl">{value}</p></CardContent></Card>)}</div><Card><CardContent className="p-4"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Tabs value={tab} onValueChange={setTab}><TabsList>{tabs.map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t === "pending" ? "Pending Verification" : t}</TabsTrigger>)}</TabsList></Tabs><Input className="lg:w-80" placeholder="Search students" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Year</TableHead><TableHead>College</TableHead><TableHead>City</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map((s) => <TableRow key={s.id}><TableCell className="font-medium">{s.full_name}</TableCell><TableCell><Badge variant="secondary">{s.course || "—"}</Badge></TableCell><TableCell>{s.year_of_study || "—"}</TableCell><TableCell>{s.college_name || "—"}</TableCell><TableCell>{s.city || "—"}</TableCell><TableCell><Badge variant={statusOf(s) === "verified" ? "default" : statusOf(s) === "rejected" ? "destructive" : "secondary"}>{statusOf(s)}</Badge></TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openId(s)}>ID Card</Button>{statusOf(s) === "pending" && <><Button size="sm" onClick={() => verify(s)}>Verify</Button><Button size="sm" variant="destructive" onClick={() => { setRejectFor(s); setReason(""); }}>Reject</Button></>}</div></TableCell></TableRow>)}{filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No students found.</TableCell></TableRow>}</TableBody></Table></CardContent></Card><Dialog open={!!rejectFor} onOpenChange={(open) => !open && setRejectFor(null)}><DialogContent><DialogHeader><DialogTitle>Reject {rejectFor?.full_name}</DialogTitle></DialogHeader><Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" /><DialogFooter><Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button><Button variant="destructive" disabled={!reason.trim()} onClick={reject}>Reject</Button></DialogFooter></DialogContent></Dialog><Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}><DialogContent><DialogHeader><DialogTitle>Send Announcement</DialogTitle></DialogHeader><Textarea rows={5} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Message to verified students" /><DialogFooter><Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button><Button disabled={!announcement.trim()} onClick={sendAnnouncement}>Send Broadcast</Button></DialogFooter></DialogContent></Dialog></div>;
};

export default AdminStudents;
