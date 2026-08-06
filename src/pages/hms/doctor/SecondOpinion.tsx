import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Send, MessageSquare, Clock, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const availableDoctors = [
  { id: 1, name: "Dr. Priya Sharma", specialty: "Neurology", hospital: "AIIMS Delhi" },
  { id: 2, name: "Dr. Venkat Raman", specialty: "Orthopedics", hospital: "Apollo, Chennai" },
  { id: 3, name: "Dr. Sujata Iyer", specialty: "Kayachikitsa (Ayurveda)", hospital: "AVS, Coimbatore" },
  { id: 4, name: "Dr. Anand Kulkarni", specialty: "Shalya Tantra", hospital: "SDM, Udupi" },
  { id: 5, name: "Dr. Rashid Khan", specialty: "Neurosurgery", hospital: "NIMHANS, Bangalore" },
];

const pendingOpinions = [
  {
    id: 1, patient: "Rajesh Kumar", condition: "L4-L5 Disc Herniation with Gridhrasi", sentTo: "Dr. Rashid Khan (Neurosurgery)", sentDate: "2024-01-13", status: "received",
    opinion: "Based on MRI findings showing 6mm disc protrusion at L4-L5 with left foraminal stenosis, I recommend conservative management for 6 more weeks. Surgery (microdiscectomy) only if no improvement. Ayurvedic Kati Basti + Basti protocol is appropriate first-line. Red flags to watch: progressive weakness, bladder involvement.",
  },
  {
    id: 2, patient: "Lakshmi Devi", condition: "Uncontrolled Prameha (HbA1c 9.2%)", sentTo: "Dr. Sujata Iyer (Kayachikitsa)", sentDate: "2024-01-14", status: "pending",
    opinion: null,
  },
  {
    id: 3, patient: "Suresh Pillai", condition: "Chronic Amavata (RA Factor +ve, DMARD needed?)", sentTo: "Dr. Venkat Raman (Orthopedics)", sentDate: "2024-01-10", status: "received",
    opinion: "RF 128 IU/ml with active synovitis in MCPs. Anti-CCP pending. Recommend starting Methotrexate 7.5mg/week alongside Ayurvedic protocol. Simhanada Guggulu is compatible. Monitor LFT monthly. Review in 6 weeks.",
  },
];

export default function SecondOpinion() {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [caseSummary, setCaseSummary] = useState("45/M, Rajesh Kumar. C/O: Low back pain radiating to left lower limb x 3 months. MRI: L4-L5 disc herniation with left foraminal stenosis. Currently on Kati Basti (session 5/7) + Yogaraja Guggulu. Improvement: 60%. Query: Should we continue conservative or refer for surgical opinion?");

  const handleSend = () => {
    if (!selectedDoctor) { toast.error("Please select a doctor."); return; }
    toast.success("Second opinion request sent successfully.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Second Opinion / Peer Consult</h1>
        <p className="text-muted-foreground">Request expert opinions from specialists for complex cases</p>
      </div>

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request">New Request</TabsTrigger>
          <TabsTrigger value="pending">Pending & Received ({pendingOpinions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="request">
          <Card>
            <CardHeader><CardTitle>Request Second Opinion</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Specialist</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a doctor..." /></SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>{d.name} — {d.specialty} ({d.hospital})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Case Summary</label>
                <Textarea value={caseSummary} onChange={(e) => setCaseSummary(e.target.value)} rows={6} className="mt-1" placeholder="Provide clinical summary, investigation findings, current treatment, and specific query..." />
              </div>
              <div>
                <label className="text-sm font-medium">Attach Reports</label>
                <div className="border-2 border-dashed rounded-lg p-4 mt-1 text-center">
                  <p className="text-sm text-muted-foreground">Drag MRI/Lab reports here or click to browse</p>
                  <Button variant="outline" size="sm" className="mt-2">Attach Files</Button>
                </div>
              </div>
              <Button onClick={handleSend} className="gap-2"><Send className="h-4 w-4" />Send Request</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingOpinions.map((op) => (
            <Card key={op.id} className={op.status === "received" ? "border-green-200" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{op.patient} — {op.condition}</CardTitle>
                  <Badge className={op.status === "received" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                    {op.status === "received" ? <><CheckCircle className="h-3 w-3 mr-1" />Received</> : <><Clock className="h-3 w-3 mr-1" />Pending</>}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Sent to: {op.sentTo} • {op.sentDate}</p>
              </CardHeader>
              {op.opinion && (
                <CardContent className="border-t pt-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-green-600" />
                    <div>
                      <span className="text-xs font-medium text-green-700">Expert Opinion:</span>
                      <p className="text-sm mt-1">{op.opinion}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="gap-1"><FileText className="h-3 w-3" />Add to Case Sheet</Button>
                    <Button size="sm" variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" />Reply</Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
