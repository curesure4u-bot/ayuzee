import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Eye, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";

type Role = "patient" | "student";
type ProfileRow = { id: string; user_id: string; full_name: string | null; email: string | null; phone: string | null; city: string | null; state: string | null; created_at: string; updated_at: string; is_active?: boolean; role: Role };

const PAGE_SIZE = 20;

const AdminUsers = () => {
  usePageSEO({ title: "Admin · Users — Ayuzee", noIndex: true });
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [messageFor, setMessageFor] = useState<ProfileRow | null>(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [profiles, roles] = await Promise.all([
      (supabase as any).from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").in("role", ["student", "patient"]),
    ]);
    const roleMap = new Map<string, Role>();
    (roles.data ?? []).forEach((row: { user_id: string; role: Role }) => roleMap.set(row.user_id, row.role));
    setRows(((profiles.data ?? []) as ProfileRow[]).map((row) => ({ ...row, is_active: row.is_active ?? true, role: roleMap.get(row.user_id) ?? "patient" })));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !term || (row.full_name ?? "").toLowerCase().includes(term) || (row.email ?? "").toLowerCase().includes(term);
      const matchesTab = tab === "all" || (tab === "inactive" ? row.is_active === false : row.role === tab);
      return matchesSearch && matchesTab;
    });
  }, [rows, query, tab]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const deactivate = async (row: ProfileRow) => {
    const { error } = await (supabase as any).from("profiles").update({ is_active: false }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("User deactivated");
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, is_active: false } : item));
  };

  const sendWhatsApp = async () => {
    if (!messageFor?.phone || !message.trim()) return toast.error("Phone and message are required");
    const { error } = await supabase.functions.invoke("send-whatsapp", { body: { to: messageFor.phone, message } });
    if (error) return toast.error(error.message);
    toast.success("WhatsApp sent");
    setMessageFor(null); setMessage("");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-3xl">All Users (Patients & Students)</h1><p className="text-sm text-muted-foreground">Search, inspect, and contact user profiles.</p></div>
      <Card><CardHeader><CardTitle className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><Tabs value={tab} onValueChange={(value) => { setTab(value); setPage(1); }}><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="patient">Patients</TabsTrigger><TabsTrigger value="student">Students</TabsTrigger><TabsTrigger value="inactive">Inactive</TabsTrigger></TabsList></Tabs><div className="relative w-full lg:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or email" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></div></CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Last active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{pageRows.map((row) => <TableRow key={row.id}><TableCell className="font-medium">{row.full_name || "—"}</TableCell><TableCell>{row.email || "—"}</TableCell><TableCell>{row.phone || "—"}</TableCell><TableCell><Badge variant={row.role === "student" ? "default" : "secondary"}>{row.role}</Badge></TableCell><TableCell>{new Date(row.created_at).toLocaleDateString("en-IN")}</TableCell><TableCell>{new Date(row.updated_at || row.created_at).toLocaleDateString("en-IN")}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button><Button size="sm" variant="outline" onClick={() => { setMessageFor(row); setMessage(""); }}><MessageCircle className="h-4 w-4" /></Button><Button size="sm" variant="destructive" disabled={row.is_active === false} onClick={() => deactivate(row)}>Deactivate</Button></div></TableCell></TableRow>)}{pageRows.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No users found.</TableCell></TableRow>}</TableBody></Table><div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button><Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button></div></div></CardContent></Card>
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><SheetContent className="overflow-y-auto sm:max-w-lg"><SheetHeader><SheetTitle>Profile details</SheetTitle></SheetHeader>{selected && <div className="mt-6 grid gap-3 text-sm">{Object.entries(selected).map(([key, value]) => <div key={key} className="rounded-md border border-border p-3"><p className="text-xs uppercase text-muted-foreground">{key.replace(/_/g, " ")}</p><p className="mt-1 break-words font-medium">{Array.isArray(value) ? value.join(", ") : String(value ?? "—")}</p></div>)}</div>}</SheetContent></Sheet>
      <Dialog open={!!messageFor} onOpenChange={(open) => !open && setMessageFor(null)}><DialogContent><DialogHeader><DialogTitle>Send WhatsApp to {messageFor?.full_name || "user"}</DialogTitle></DialogHeader><Textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your message" /><DialogFooter><Button variant="outline" onClick={() => setMessageFor(null)}>Cancel</Button><Button onClick={sendWhatsApp}>Send</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
};

export default AdminUsers;
