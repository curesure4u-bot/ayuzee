import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Stethoscope } from "lucide-react";

const V2Examination = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Stethoscope className="h-6 w-6 text-blue-600" /> 7-System Examination V2</h1>
          <p className="text-muted-foreground mt-1">Enhanced Ayurvedic examination with detailed scoring</p>
        </div>
        <Badge className="bg-blue-600">Examination</Badge>
      </div>

      {/* Ayurvedic Examination */}
      <Card>
        <CardHeader><CardTitle>🍃 Ayurvedic Spine Examination</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Vikruti (Dosha Imbalance)</label>
            <Select defaultValue="vata-kapha">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vata">Vata ↑↑</SelectItem>
                <SelectItem value="pitta">Pitta ↑↑</SelectItem>
                <SelectItem value="kapha">Kapha ↑↑</SelectItem>
                <SelectItem value="vata-pitta">Vata-Pitta ↑</SelectItem>
                <SelectItem value="vata-kapha">Vata-Kapha ↑</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Pain Type (Vedana)</label>
            <Select defaultValue="toda">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="toda">Toda (Pricking-Vata)</SelectItem>
                <SelectItem value="daha">Daha (Burning-Pitta)</SelectItem>
                <SelectItem value="gaurava">Gaurava (Heavy-Kapha)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Agni (Digestive Fire)</label>
            <Select defaultValue="manda">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sama">Sama (Normal)</SelectItem>
                <SelectItem value="vishama">Vishama (Irregular)</SelectItem>
                <SelectItem value="tikshna">Tikshna (Sharp)</SelectItem>
                <SelectItem value="manda">Manda (Weak)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Ama (Toxins)</label>
            <Select defaultValue="moderate">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Modern Examination */}
      <Card>
        <CardHeader><CardTitle>🔬 Modern Orthopedic Tests</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "SLR Test", side: "left" },
            { name: "SLR Test", side: "right" },
            { name: "Faber Test", side: "left" },
            { name: "Faber Test", side: "right" },
          ].map((test, i) => (
            <div key={i} className="p-3 border rounded text-center">
              <p className="text-sm font-medium">{test.name} ({test.side})</p>
              <Select defaultValue="positive">
                <SelectTrigger className="mt-2 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default V2Examination;