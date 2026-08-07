import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Plus, Brain, Sparkles } from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

const PatientMRD = () => {
  const [tab, setTab] = useState("new");
  const [location, setLocation] = useState("#11, Main Road, Kadayanallur, .");
  const [mrdDate, setMrdDate] = useState(new Date().toISOString().slice(0, 10));
  const [mrdTag, setMrdTag] = useState("");
  const [fileLocation, setFileLocation] = useState("");
  const [fileNo, setFileNo] = useState("");
  const [patientType, setPatientType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [icd10, setIcd10] = useState("");
  const [additionalFindings, setAdditionalFindings] = useState("");
  const [diagnoses, setDiagnoses] = useState<{sNo:number;code:string;chapter:string;sectionRef:string;section:string;subSection:string;findings:string}[]>([]);

  const handleAddDiagnosis = () => {
    if (!icd10) return toast.error("Select an ICD10 code");
    setDiagnoses([...diagnoses, { sNo: diagnoses.length + 1, code: icd10, chapter: "XIV", sectionRef: "N40-N51", section: "Diseases of male genital organs", subSection: "N41", findings: additionalFindings }]);
    setIcd10(""); setAdditionalFindings("");
    toast.success("Diagnosis added");
  };

  const handleSubmit = () => toast.success("MRD record saved successfully");

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">MRD</div>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {patientHeader.name}</p>
            <p><strong>ID:</strong> {patientHeader.id}</p>
            <p><strong>Age:</strong> {patientHeader.age}</p>
            <p><strong>Gender:</strong> {patientHeader.gender}</p>
            <p><strong>Mobile:</strong> {patientHeader.mobile}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="new">New</TabsTrigger><TabsTrigger value="list">List</TabsTrigger></TabsList>

        <TabsContent value="new" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Additional Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="font-semibold">Location <span className="text-red-500">*</span></Label><Select value={location} onValueChange={setLocation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="#11, Main Road, Kadayanallur, .">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select></div>
                <div><Label className="font-semibold">MRD Date <span className="text-red-500">*</span></Label><Input type="date" value={mrdDate} onChange={(e) => setMrdDate(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Tag</Label><Input value={mrdTag} onChange={(e) => setMrdTag(e.target.value)} placeholder="Tag" /><p className="text-xs text-muted-foreground">Categorize by Grouping Or Tagging</p></div>
                <div><Label>File Location <span className="text-red-500">*</span></Label><Input value={fileLocation} onChange={(e) => setFileLocation(e.target.value)} /></div>
                <div><Label>File No <span className="text-red-500">*</span></Label><Input value={fileNo} onChange={(e) => setFileNo(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Patient Type</Label><Select value={patientType} onValueChange={setPatientType}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="op">OP</SelectItem><SelectItem value="ip">IP</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent></Select></div>
                <div><Label>Remarks</Label><Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks" /></div>
              </div>
              <Separator />
              <h3 className="font-semibold">Diagnosis</h3>
              <div className="flex gap-3 items-end">
                <div><Label className="font-semibold">ICD10</Label><Input value={icd10} onChange={(e) => setIcd10(e.target.value)} placeholder="Select ICD10" /></div>
                <div><Label className="font-semibold">Additional Findings</Label><Input value={additionalFindings} onChange={(e) => setAdditionalFindings(e.target.value)} /></div>
                <Button onClick={handleAddDiagnosis} className="bg-green-600 hover:bg-green-700"><Plus className="h-3 w-3 mr-1" /> Add</Button>
              </div>
              {diagnoses.length > 0 && (
                <div className="overflow-x-auto"><table className="w-full text-xs border"><thead className="bg-muted/50"><tr><th className="px-2 py-2 text-left text-orange-600">S.No</th><th className="px-2 py-2 text-left text-orange-600">Chapter</th><th className="px-2 py-2 text-left text-orange-600">Section Ref</th><th className="px-2 py-2 text-left text-orange-600">Section</th><th className="px-2 py-2 text-left text-orange-600">Sub Section</th><th className="px-2 py-2 text-left text-orange-600">Additional Findings</th></tr></thead><tbody>{diagnoses.map((d)=>(<tr key={d.sNo} className="border-t"><td className="px-2 py-2">{d.sNo}</td><td className="px-2 py-2">{d.chapter}</td><td className="px-2 py-2">{d.sectionRef}</td><td className="px-2 py-2">{d.section}</td><td className="px-2 py-2">{d.subSection}</td><td className="px-2 py-2">{d.findings}</td></tr>))}</tbody></table></div>
              )}
              <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">Submit</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">File No</th>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-left font-medium">Diagnosis (ICD-10)</th>
                    <th className="px-3 py-2 text-left font-medium">Location</th>
                    <th className="px-3 py-2 text-left font-medium">Tag</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { fileNo: "MRD-2026-001", date: "2026-07-10", type: "IP", diagnosis: "M54.5 - Low Back Pain", location: "Rack A-3", tag: "Spine", status: "Filed" },
                    { fileNo: "MRD-2026-002", date: "2026-06-15", type: "OP", diagnosis: "M06.9 - Rheumatoid Arthritis", location: "Rack B-1", tag: "Amavata", status: "Filed" },
                    { fileNo: "MRD-2025-045", date: "2025-12-20", type: "IP", diagnosis: "K29.7 - Gastritis", location: "Rack C-2", tag: "GI", status: "Archived" },
                    { fileNo: "MRD-2025-032", date: "2025-09-05", type: "OP", diagnosis: "G43.9 - Migraine", location: "Rack A-1", tag: "Neuro", status: "Filed" },
                  ].map((r) => (
                    <tr key={r.fileNo} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs font-bold">{r.fileNo}</td>
                      <td className="px-3 py-2 text-xs">{r.date}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{r.type}</Badge></td>
                      <td className="px-3 py-2 text-xs">{r.diagnosis}</td>
                      <td className="px-3 py-2 text-xs">{r.location}</td>
                      <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px]">{r.tag}</Badge></td>
                      <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] text-green-600">{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Document Archive */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Uploaded Documents</h3>
              <div className="space-y-2">
                {[
                  { name: "Lab Report - CBC + ESR (Jul 2026)", type: "Lab", date: "2026-07-12", size: "245 KB" },
                  { name: "X-Ray Lumbar Spine AP/Lat", type: "Radiology", date: "2026-07-10", size: "1.2 MB" },
                  { name: "Discharge Summary - PK Stay", type: "Clinical", date: "2026-07-17", size: "180 KB" },
                  { name: "Consent Form - Virechana", type: "Consent", date: "2026-07-13", size: "95 KB" },
                  { name: "Previous Treatment Records (External)", type: "External", date: "2026-06-01", size: "3.4 MB" },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-2 rounded border hover:bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-medium">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.type} · {doc.date} · {doc.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs h-6">View</Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-3"><Plus className="h-3 w-3 mr-1" /> Upload Document</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientMRD;
