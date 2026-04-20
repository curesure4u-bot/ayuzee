import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Building2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Doc { id: string; slug: string; title: string; body: string }
interface Info {
  id: string; legal_name: string; brand_name: string; email: string; support_email: string;
  grievance_email: string; phone: string; address: string; hours: string; website: string;
}

const ORDER = ["about", "terms", "privacy", "cancellation", "refunds", "contact"];

const DoctorCompany = () => {
  const navigate = useNavigate();
  const { userId } = useDoctor();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [info, setInfo] = useState<Info | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoDraft, setInfoDraft] = useState<Info | null>(null);

  const load = async () => {
    const sb = supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => Promise<{ data: unknown }> & {
          maybeSingle?: () => Promise<{ data: unknown }>;
        };
      };
    };
    const [d, i] = await Promise.all([
      (supabase as any).from("company_content").select("*"),
      (supabase as any).from("company_info").select("*").maybeSingle(),
    ]);
    void sb;
    const sorted = (((d.data ?? []) as Doc[])).sort(
      (a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug),
    );
    setDocs(sorted);
    setInfo((i.data ?? null) as Info | null);
  };

  useEffect(() => {
    load();
    if (!userId) return;
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data }) => {
      setIsAdmin(Boolean(data));
    });
  }, [userId]);

  const startEdit = (doc: Doc) => { setEditing(doc.slug); setDraft(doc.body); };
  const cancelEdit = () => { setEditing(null); setDraft(""); };
  const saveEdit = async (doc: Doc) => {
    const { error } = await (supabase as any).from("company_content").update({ body: draft }).eq("id", doc.id);
    if (error) return toast.error(error.message);
    toast.success(`${doc.title} updated`);
    setEditing(null);
    load();
  };

  const startInfoEdit = () => { if (info) { setInfoDraft({ ...info }); setEditingInfo(true); } };
  const saveInfo = async () => {
    if (!infoDraft) return;
    const { id, ...patch } = infoDraft;
    const { error } = await (supabase as any).from("company_info").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Company details updated");
    setEditingInfo(false);
    load();
  };

  const contactDoc = useMemo(() => docs.find((d) => d.slug === "contact"), [docs]);
  const policyDocs = useMemo(() => docs.filter((d) => d.slug !== "contact"), [docs]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="font-display text-2xl">Company</h1>
        </div>

        {/* Quick contact strip */}
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{info?.email ?? "info@ayuzee.com"}</p>
              <p className="text-muted-foreground">Customer support</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{info?.phone ?? "+91 931-9361-976"}</p>
              <p className="text-muted-foreground">{info?.hours ?? "Mon - Fri, 10am - 7pm"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Editable accordion list */}
      <Card className="divide-y">
        <Accordion type="single" collapsible className="w-full">
          {policyDocs.map((doc) => (
            <AccordionItem key={doc.id} value={doc.slug} className="border-0 px-2">
              <AccordionTrigger className="px-4 py-4 text-left font-semibold">
                {doc.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {editing === doc.slug ? (
                  <div className="space-y-3">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={18}
                      className="font-mono text-xs leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(doc)}><Save className="mr-1 h-4 w-4" /> Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}><X className="mr-1 h-4 w-4" /> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {doc.body}
                    </div>
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => startEdit(doc)}>
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </Button>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Get in touch + company info */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">Get in touch with us</h2>
          {isAdmin && !editingInfo && (
            <Button size="sm" variant="outline" onClick={startInfoEdit}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          )}
        </div>

        {editingInfo && infoDraft ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Brand name</Label><Input value={infoDraft.brand_name} onChange={(e) => setInfoDraft({ ...infoDraft, brand_name: e.target.value })} /></div>
            <div><Label>Legal name</Label><Input value={infoDraft.legal_name} onChange={(e) => setInfoDraft({ ...infoDraft, legal_name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={infoDraft.email} onChange={(e) => setInfoDraft({ ...infoDraft, email: e.target.value })} /></div>
            <div><Label>Support email</Label><Input value={infoDraft.support_email} onChange={(e) => setInfoDraft({ ...infoDraft, support_email: e.target.value })} /></div>
            <div><Label>Grievance email</Label><Input value={infoDraft.grievance_email} onChange={(e) => setInfoDraft({ ...infoDraft, grievance_email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={infoDraft.phone} onChange={(e) => setInfoDraft({ ...infoDraft, phone: e.target.value })} /></div>
            <div><Label>Hours</Label><Input value={infoDraft.hours} onChange={(e) => setInfoDraft({ ...infoDraft, hours: e.target.value })} /></div>
            <div><Label>Website</Label><Input value={infoDraft.website} onChange={(e) => setInfoDraft({ ...infoDraft, website: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Address</Label><Textarea rows={3} value={infoDraft.address} onChange={(e) => setInfoDraft({ ...infoDraft, address: e.target.value })} /></div>
            <div className="flex gap-2 sm:col-span-2">
              <Button onClick={saveInfo}><Save className="mr-1 h-4 w-4" /> Save</Button>
              <Button variant="outline" onClick={() => setEditingInfo(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{info?.brand_name}</p>
                <p className="text-muted-foreground">{info?.legal_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-primary" /><div><p>{info?.email}</p><p className="text-xs text-muted-foreground">Support: {info?.support_email} • Grievance: {info?.grievance_email}</p></div></div>
            <div className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 text-primary" /><p>{info?.phone}</p></div>
            <div className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 text-primary" /><p>{info?.hours}</p></div>
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 text-primary" /><p className="leading-relaxed">{info?.address}</p></div>
          </div>
        )}

        {contactDoc && isAdmin && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Contact page content</p>
            {editing === contactDoc.slug ? (
              <div className="space-y-2">
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={10} className="font-mono text-xs" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(contactDoc)}><Save className="mr-1 h-4 w-4" /> Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => startEdit(contactDoc)}>
                <Pencil className="mr-1 h-4 w-4" /> Edit contact details
              </Button>
            )}
          </div>
        )}

        {!isAdmin && (
          <p className="mt-4 text-xs text-muted-foreground">
            Need changes to company details? Contact your Ayuzee account manager.
          </p>
        )}
      </Card>
    </div>
  );
};

export default DoctorCompany;
