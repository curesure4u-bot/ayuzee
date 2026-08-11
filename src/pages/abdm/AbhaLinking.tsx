import { useState } from "react";
import { Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const linkedProfile = {
  abhaNumber: "91-1234-5678-9012",
  name: "Rahul Sharma",
  gender: "Male",
  dob: "1990-05-15",
  phrAddress: "patient@abdm",
};

const benefits = [
  "One Nation One Health ID",
  "Access records anywhere",
  "Share with any doctor",
  "Government scheme eligibility",
];

export default function AbhaLinking() {
  const [linked, setLinked] = useState(true);
  const [phone, setPhone] = useState("");
  const [abhaInput, setAbhaInput] = useState("");

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold">ABHA Health ID</h1>
          <p className="text-muted-foreground">Link your Ayushman Bharat Health Account for unified health records</p>
        </div>
      </div>

      {linked && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" />Linked ABHA Profile</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">ABHA Number:</span> {linkedProfile.abhaNumber}</div>
            <div><span className="font-medium">Name:</span> {linkedProfile.name}</div>
            <div><span className="font-medium">Gender:</span> {linkedProfile.gender}</div>
            <div><span className="font-medium">DOB:</span> {linkedProfile.dob}</div>
            <div><span className="font-medium">PHR Address:</span> {linkedProfile.phrAddress}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Create ABHA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="aadhaar">
            <TabsList><TabsTrigger value="aadhaar">Aadhaar-based</TabsTrigger><TabsTrigger value="mobile">Mobile-based</TabsTrigger></TabsList>
            <TabsContent value="aadhaar" className="space-y-3 pt-3">
              <Input placeholder="Enter Aadhaar-linked mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Button onClick={() => toast.success("OTP sent to mobile number")}>Generate OTP</Button>
            </TabsContent>
            <TabsContent value="mobile" className="space-y-3 pt-3">
              <Input placeholder="Enter mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Button onClick={() => toast.success("OTP sent to mobile number")}>Generate OTP</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Link Existing ABHA</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Enter 14-digit ABHA Number" value={abhaInput} onChange={(e) => setAbhaInput(e.target.value)} />
          <Button onClick={() => { setLinked(true); toast.success("ABHA linked successfully"); }}>Verify & Link</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {benefits.map((b) => (
          <Card key={b} className="text-center p-4">
            <Badge variant="secondary" className="text-xs">{b}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
