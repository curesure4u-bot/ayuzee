import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Building2, Bell, Printer, Globe } from "lucide-react";

const HmsSettings = () => {
  const [tab, setTab] = useState("hospital");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [autoPrint, setAutoPrint] = useState(false);

  const save = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your HMS portal preferences</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="hospital">Hospital Info</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="printing">Printing</TabsTrigger>
        </TabsList>

        <TabsContent value="hospital" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" /> Hospital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Hospital Name</Label><Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="Your Hospital Name" /></div>
                <div><Label>Phone</Label><Input value={hospitalPhone} onChange={(e) => setHospitalPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
                <div><Label>Email</Label><Input value={hospitalEmail} onChange={(e) => setHospitalEmail(e.target.value)} placeholder="info@hospital.com" /></div>
                <div><Label>GST Number</Label><Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
              </div>
              <div><Label>Address</Label><Textarea value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} placeholder="Full hospital address" /></div>
              <Button onClick={save}>Save Hospital Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium text-sm">SMS Notifications</p><p className="text-xs text-muted-foreground">Send appointment reminders via SMS</p></div>
                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium text-sm">WhatsApp Notifications</p><p className="text-xs text-muted-foreground">Send updates and reminders via WhatsApp</p></div>
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium text-sm">Email Notifications</p><p className="text-xs text-muted-foreground">Send reports and invoices via email</p></div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
              <Button onClick={save}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" /> Billing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="font-medium">Billing settings</p>
              <p className="text-sm">Configure invoice templates, tax rates, payment modes, and auto-numbering here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Printer className="h-4 w-4" /> Print Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium text-sm">Auto-print Bills</p><p className="text-xs text-muted-foreground">Automatically print bill after generation</p></div>
                <Switch checked={autoPrint} onCheckedChange={setAutoPrint} />
              </div>
              <Button onClick={save}>Save Print Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsSettings;
