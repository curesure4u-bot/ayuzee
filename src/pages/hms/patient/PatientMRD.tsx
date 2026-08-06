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

        <TabsContent value="list" className="mt-4">
          <Card><CardContent className="p-8 text-center text-muted-foreground">No MRD is available.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientMRD;
