import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BedDouble, Printer, FileText, Brain } from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

const ipAdmissions = [
  { ipNo: 14, doa: "17/04/2025", dod: "23/04/2025", casesheet: true, dischargeSummary: true, billClosed: true, print: true, externalForms: true, doctor: "Dr. Vasumathi BAMS", date: "17/04/2025 11:40" },
  { ipNo: 25, doa: "15/05/2023", dod: "", casesheet: true, dischargeSummary: true, billClosed: true, print: false, externalForms: true, doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", date: "15/05/2023 16:14" },
];

const PatientIPSummary = () => {
  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">IP/Emergency Summary</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          <span className="text-sm text-violet-700">
            Total IP Admissions: {ipAdmissions.length} | All bills closed | Last admission: {ipAdmissions[0].doa}
          </span>
        </CardContent>
      </Card>

      {/* IP Records */}
      <div className="space-y-4">
        {ipAdmissions.map((ip) => (
          <Card key={ip.ipNo}>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <BedDouble className="h-4 w-4" /> IP No: {ip.ipNo} <Printer className="h-3 w-3 text-muted-foreground cursor-pointer" />
                  </p>
                </div>
                <div className="text-sm">
                  <strong>DOA:</strong> {ip.doa}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <strong>DOD:</strong> {ip.dod || "—"}
                  {ip.dod && <Printer className="h-3 w-3 text-muted-foreground cursor-pointer" />}
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {ip.casesheet && <Badge className="bg-green-600 text-white cursor-pointer" onClick={() => toast.info("Open Casesheet")}>📋 Casesheet</Badge>}
                {ip.dischargeSummary && <Badge className="bg-orange-500 text-white cursor-pointer" onClick={() => toast.info("Open Discharge Summary")}>🏠 Discharge Summary ▼</Badge>}
                {ip.billClosed && <Badge variant="outline">Bill Closed</Badge>}
                {ip.print && <span className="text-orange-600 text-xs cursor-pointer hover:underline">🖨️ Print</span>}
                {ip.externalForms && <span className="text-orange-600 text-xs cursor-pointer hover:underline">External Forms</span>}
              </div>
              <div className="text-right mt-3 text-sm text-muted-foreground">
                {ip.doctor} ✏️<br />{ip.date} ✏️
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientIPSummary;
