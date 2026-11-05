import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, FileText, Camera, CheckCircle, Pen, Download, Users, Plus } from "lucide-react";

type ConsentForm = {
  id: string; patient: string; procedure: string; doctor: string;
  date: string; status: "signed" | "pending" | "expired";
  hasPhotoBefore: boolean; hasPhotoAfter: boolean; digitalSignature: boolean;
};

const mockConsents: ConsentForm[] = [
  { id: "1", patient: "Ramesh Kumar", procedure: "14-Day Full Panchakarma (Vamana + Virechana + Vasti)", doctor: "Dr. Meena Patel", date: "2026-07-01", status: "signed", hasPhotoBefore: true, hasPhotoAfter: true, digitalSignature: true },
  { id: "2", patient: "Sunil Menon", procedure: "Ksharasutra Application (Fistula)", doctor: "Dr. Nair", date: "2026-07-10", status: "signed", hasPhotoBefore: true, hasPhotoAfter: false, digitalSignature: true },
  { id: "3", patient: "Meera Nair", procedure: "Virechana (Therapeutic Purgation)", doctor: "Dr. Meena Patel", date: "2026-07-14", status: "signed", hasPhotoBefore: true, hasPhotoAfter: false, digitalSignature: true },
  { id: "4", patient: "Anand Sharma", procedure: "Raktamokshana (Bloodletting)", doctor: "Dr. Nair", date: "2026-07-16", status: "pending", hasPhotoBefore: false, hasPhotoAfter: false, digitalSignature: false },
  { id: "5", patient: "Lakshmi Devi", procedure: "Nasya Karma (7 days)", doctor: "Dr. Arun Sharma", date: "2026-06-20", status: "expired", hasPhotoBefore: true, hasPhotoAfter: true, digitalSignature: true },
];

const HmsPkConsent = () => {
  const [consents] = useState<ConsentForm[]>(mockConsents);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-600" /> Panchakarma Consent & Documentation
          </h1>
          <p className="text-sm text-muted-foreground">Digital informed consent, before/after photos, patient agreements & legal compliance</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" /> New Consent</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{consents.length}</p><p className="text-xs text-muted-foreground">Total Consents</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{consents.filter(c => c.status === "signed").length}</p><p className="text-xs text-muted-foreground">Signed</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{consents.filter(c => c.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{consents.filter(c => c.hasPhotoBefore).length}</p><p className="text-xs text-muted-foreground">With Photos</p></CardContent></Card>
      </div>

      <Tabs defaultValue="consents">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="consents">Consent Forms</TabsTrigger>
          <TabsTrigger value="template">Consent Template</TabsTrigger>
          <TabsTrigger value="photos">Photo Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="consents" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Procedure</th>
                <th className="px-3 py-2 text-left font-medium">Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Photos</th>
                <th className="px-3 py-2 text-left font-medium">Signed</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {consents.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium">{c.patient}</td>
                    <td className="px-3 py-2 text-xs">{c.procedure}</td>
                    <td className="px-3 py-2 text-xs">{c.doctor}</td>
                    <td className="px-3 py-2 text-xs">{c.date}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {c.hasPhotoBefore && <Badge variant="outline" className="text-[9px]">Before</Badge>}
                        {c.hasPhotoAfter && <Badge variant="outline" className="text-[9px] text-green-600">After</Badge>}
                        {!c.hasPhotoBefore && !c.hasPhotoAfter && <span className="text-[10px] text-muted-foreground">None</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2">{c.digitalSignature ? <CheckCircle className="h-4 w-4 text-green-500" /> : <span className="text-[10px] text-muted-foreground">Pending</span>}</td>
                    <td className="px-3 py-2"><Badge variant={c.status === "signed" ? "outline" : c.status === "pending" ? "secondary" : "destructive"} className={`text-[10px] capitalize ${c.status === "signed" ? "text-green-600" : ""}`}>{c.status}</Badge></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]"><Download className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]"><Camera className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Panchakarma Informed Consent Template</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-center mb-4">
                  <h3 className="font-display font-bold text-lg">INFORMED CONSENT FOR PANCHAKARMA TREATMENT</h3>
                  <p className="text-xs text-muted-foreground">Ayuzee AYUSH Hospital, Trivandrum</p>
                </div>
                <div className="space-y-3 text-xs">
                  <p><strong>I, _____________</strong> (Patient Name), UHID: __________, hereby give my informed consent for the following Panchakarma procedure(s):</p>
                  <div className="p-2 bg-muted/50 rounded"><p className="font-medium">Procedure(s): ___________________________________</p></div>
                  <p className="font-medium mt-3">I understand and acknowledge that:</p>
                  <div className="space-y-1 pl-4">
                    {[
                      "The nature, purpose, and expected benefits of the procedure have been explained to me.",
                      "Possible risks include but are not limited to: nausea, vomiting, loose stools, fatigue, skin irritation, allergic reactions.",
                      "Specific risks for Vamana: forceful vomiting, dehydration. For Virechana: electrolyte imbalance. For Vasti: abdominal discomfort.",
                      "I have disclosed my complete medical history including allergies, current medications, and pre-existing conditions.",
                      "I understand the dietary restrictions (Samsarjana Krama) before and after the procedure.",
                      "I consent to clinical photography for documentation purposes (before/during/after).",
                      "I can withdraw consent at any time before the procedure begins.",
                      "Alternative treatment options have been explained to me.",
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-2">
                        <Checkbox className="mt-0.5" defaultChecked />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div><p className="text-muted-foreground mb-8">Patient Signature:</p><div className="border-b border-dashed" /></div>
                    <div><p className="text-muted-foreground mb-8">Doctor Signature:</p><div className="border-b border-dashed" /></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3"><Badge variant="outline" className="text-[9px]"><Pen className="h-2 w-2 mr-0.5" /> Digital Signature Supported</Badge></div>
                </div>
              </div>
              <Button onClick={() => toast.success("Consent template sent to patient for digital signature")}>
                <Send className="mr-1 h-4 w-4" /> Send for Digital Signature
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4" /> Before / After Photo Documentation</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consents.filter(c => c.hasPhotoBefore).map(c => (
                  <div key={c.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div><p className="font-medium text-sm">{c.patient}</p><p className="text-xs text-muted-foreground">{c.procedure} · {c.date}</p></div>
                      <Button size="sm" variant="outline" className="text-xs"><Camera className="mr-1 h-3 w-3" /> Add Photo</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center bg-amber-50/30">
                        <Camera className="h-8 w-8 mx-auto text-amber-400" />
                        <p className="text-xs font-medium mt-2 text-amber-700">Before Treatment</p>
                        <p className="text-[10px] text-muted-foreground">{c.date}</p>
                      </div>
                      <div className={`border-2 border-dashed rounded-lg p-8 text-center ${c.hasPhotoAfter ? "bg-green-50/30" : "bg-muted/30"}`}>
                        <Camera className={`h-8 w-8 mx-auto ${c.hasPhotoAfter ? "text-green-400" : "text-muted-foreground/30"}`} />
                        <p className={`text-xs font-medium mt-2 ${c.hasPhotoAfter ? "text-green-700" : "text-muted-foreground"}`}>After Treatment</p>
                        <p className="text-[10px] text-muted-foreground">{c.hasPhotoAfter ? "Uploaded" : "Pending"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Consent Form</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Patient *</Label><Input placeholder="Search patient" /></div>
            <div><Label>Procedure *</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="pk_full">Full Panchakarma (14/21 day)</SelectItem><SelectItem value="vamana">Vamana</SelectItem><SelectItem value="virechana">Virechana</SelectItem><SelectItem value="vasti">Vasti (Kashaya/Sneha)</SelectItem><SelectItem value="nasya">Nasya</SelectItem><SelectItem value="raktamokshana">Raktamokshana</SelectItem><SelectItem value="ksharasutra">Ksharasutra</SelectItem><SelectItem value="agnikarma">Agnikarma</SelectItem></SelectContent></Select></div>
            <div><Label>Doctor</Label><Input placeholder="Treating doctor" /></div>
            <div className="flex gap-4"><div className="flex items-center gap-2"><Checkbox defaultChecked /><Label className="text-xs">Take Before Photo</Label></div><div className="flex items-center gap-2"><Checkbox defaultChecked /><Label className="text-xs">Digital Signature</Label></div></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Consent form created & sent for signature"); setCreateOpen(false); }}>Create & Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Send = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;

export default HmsPkConsent;
