import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2, MapPin, Camera, MessageSquare, Settings, Truck, Upload, Users,
  Pencil, Trash2, Plus, Globe, Receipt, Store, Phone, Mail, Clock, Star,
  FileText, ImagePlus, CheckCircle2, ExternalLink, Loader2
} from "lucide-react";

// Types
type BranchLocation = {
  id: string;
  name: string;
  city: string;
  tz: string;
  dtFormat: string;
  currency: string;
  allowedCurrency: string;
  idPrefix: string;
  ipNoPrefix: string;
  opPrefix: string;
  refundPrefix: string;
  ipPrefix: string;
  sbPrefix: string;
  invoicePrefix: string;
  franchiseEnabled: boolean;
  franchisePlan: string;
  franchisePaymentType: string;
};

const sampleLocations: BranchLocation[] = [
  { id: "1", name: "Tenkasi", city: "Tenkasi", tz: "IST", dtFormat: "DD/MM/YYYY", currency: "INR", allowedCurrency: "INR", idPrefix: "ALTEN-", ipNoPrefix: "", opPrefix: "", refundPrefix: "", ipPrefix: "IP-", sbPrefix: "", invoicePrefix: "", franchiseEnabled: false, franchisePlan: "", franchisePaymentType: "" },
  { id: "2", name: "Kadayanallur", city: "Kadayanallur", tz: "IST", dtFormat: "DD/MM/YYYY", currency: "INR", allowedCurrency: "INR", idPrefix: "AL-", ipNoPrefix: "", opPrefix: "", refundPrefix: "", ipPrefix: "IP-", sbPrefix: "", invoicePrefix: "", franchiseEnabled: false, franchisePlan: "", franchisePaymentType: "" },
  { id: "3", name: "Rajapalayam", city: "Rajapalayam", tz: "IST", dtFormat: "DD/MM/YYYY", currency: "INR", allowedCurrency: "INR", idPrefix: "ALRP-", ipNoPrefix: "", opPrefix: "", refundPrefix: "", ipPrefix: "IP-", sbPrefix: "", invoicePrefix: "", franchiseEnabled: true, franchisePlan: "Gold", franchisePaymentType: "Revenue Share" },
  { id: "4", name: "Chennai - Keelkattalai", city: "Chennai", tz: "IST", dtFormat: "DD/MM/YYYY", currency: "INR", allowedCurrency: "INR", idPrefix: "ALCH-", ipNoPrefix: "", opPrefix: "", refundPrefix: "", ipPrefix: "IP-", sbPrefix: "", invoicePrefix: "", franchiseEnabled: true, franchisePlan: "Platinum", franchisePaymentType: "Fixed Fee" },
  { id: "5", name: "Tirunelveli", city: "Tirunelveli", tz: "IST", dtFormat: "DD/MM/YYYY", currency: "INR", allowedCurrency: "INR", idPrefix: "ALTNV-", ipNoPrefix: "", opPrefix: "", refundPrefix: "", ipPrefix: "IP-", sbPrefix: "", invoicePrefix: "", franchiseEnabled: false, franchisePlan: "", franchisePaymentType: "" },
  { id: "6", name: "Theni", city: "Theni", tz: "IST", dtFormat: "DD/MM/YYYY", currency: "INR", allowedCurrency: "INR", idPrefix: "ALTH-", ipNoPrefix: "", opPrefix: "", refundPrefix: "", ipPrefix: "IP-", sbPrefix: "", invoicePrefix: "", franchiseEnabled: true, franchisePlan: "Silver", franchisePaymentType: "Monthly" },
];

const HmsBranchManagement = () => {
  const [tab, setTab] = useState("edit-hospital");
  const [postOpen, setPostOpen] = useState(false);
  const [postMsg, setPostMsg] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    branch_name: "", branch_code: "", branch_type: "branch",
    city: "", state: "Tamil Nadu", address: "", pincode: "",
    phone: "", email: "", manager_name: "", bed_count: "0",
    gstin: "", ayush_license_no: "", opening_hours: "9:00 AM - 6:00 PM",
    specialties: [] as string[], op_prefix: "", google_maps_url: "", whatsapp_no: "",
    // Franchise
    franchise_plan: "", franchise_payment_type: "", franchise_revenue_share_pct: "",
    franchise_agreement_start: "", franchise_agreement_end: "",
    franchise_owner_name: "", franchise_owner_phone: "", franchise_owner_email: "",
    // Operations
    daily_op_capacity: "50", panchakarma_rooms: "0",
    has_pharmacy: false, has_lab: false, has_ipd: false,
  });
  const [savingBranch, setSavingBranch] = useState(false);

  // Load real branches
  const loadBranches = async () => {
    setBranchLoading(true);
    const { data } = await (supabase as any).from("hms_branches").select("*").order("created_at", { ascending: true });
    setBranches(data || []);
    setBranchLoading(false);
  };
  useEffect(() => { loadBranches(); }, []);

  // Add new branch
  const handleAddBranch = async () => {
    if (!newBranch.branch_name.trim()) return toast.error("Branch name is required");
    if (!newBranch.branch_code.trim()) return toast.error("Branch code is required");
    setSavingBranch(true);
    const { error } = await (supabase as any).from("hms_branches").insert({
      branch_name: newBranch.branch_name.trim(),
      branch_code: newBranch.branch_code.trim().toUpperCase(),
      branch_type: newBranch.branch_type,
      city: newBranch.city || null,
      state: newBranch.state || null,
      address: newBranch.address || null,
      pincode: newBranch.pincode || null,
      phone: newBranch.phone || null,
      email: newBranch.email || null,
      manager_name: newBranch.manager_name || null,
      bed_count: parseInt(newBranch.bed_count) || 0,
      gstin: newBranch.gstin || null,
      ayush_license_no: newBranch.ayush_license_no || null,
      opening_hours: newBranch.opening_hours || null,
      specialties: newBranch.specialties.length > 0 ? newBranch.specialties : null,
      op_prefix: newBranch.op_prefix || null,
      google_maps_url: newBranch.google_maps_url || null,
      whatsapp_no: newBranch.whatsapp_no || null,
      // Franchise
      franchise_plan: newBranch.franchise_plan || null,
      franchise_payment_type: newBranch.franchise_payment_type || null,
      franchise_revenue_share_pct: newBranch.franchise_revenue_share_pct ? parseFloat(newBranch.franchise_revenue_share_pct) : null,
      franchise_agreement_start: newBranch.franchise_agreement_start || null,
      franchise_agreement_end: newBranch.franchise_agreement_end || null,
      franchise_owner_name: newBranch.franchise_owner_name || null,
      franchise_owner_phone: newBranch.franchise_owner_phone || null,
      franchise_owner_email: newBranch.franchise_owner_email || null,
      // Operations
      daily_op_capacity: parseInt(newBranch.daily_op_capacity) || 50,
      panchakarma_rooms: parseInt(newBranch.panchakarma_rooms) || 0,
      has_pharmacy: newBranch.has_pharmacy,
      has_lab: newBranch.has_lab,
      has_ipd: newBranch.has_ipd,
      is_active: true,
    });
    setSavingBranch(false);
    if (error) return toast.error(error.message.includes("duplicate") ? "Branch code already exists" : error.message);
    toast.success(`Branch "${newBranch.branch_name}" registered successfully!`);
    setAddBranchOpen(false);
    setNewBranch({ branch_name: "", branch_code: "", branch_type: "branch", city: "", state: "Tamil Nadu", address: "", pincode: "", phone: "", email: "", manager_name: "", bed_count: "0", gstin: "", ayush_license_no: "", opening_hours: "9:00 AM - 6:00 PM", specialties: [], op_prefix: "", google_maps_url: "", whatsapp_no: "", franchise_plan: "", franchise_payment_type: "", franchise_revenue_share_pct: "", franchise_agreement_start: "", franchise_agreement_end: "", franchise_owner_name: "", franchise_owner_phone: "", franchise_owner_email: "", daily_op_capacity: "50", panchakarma_rooms: "0", has_pharmacy: false, has_lab: false, has_ipd: false });
    loadBranches();
  };

  // Toggle branch active/inactive
  const toggleBranch = async (id: string, isActive: boolean) => {
    await (supabase as any).from("hms_branches").update({ is_active: !isActive }).eq("id", id);
    toast.success(isActive ? "Branch deactivated" : "Branch activated");
    loadBranches();
  };

  // Hospital edit form state
  const [hospital, setHospital] = useState({
    name: "ALSHIFA AYUSH HOSPITAL",
    establishedYear: "2000",
    registrationNo: "TN/AYUSH/2000/1234",
    gstin: "33AXXXX1234A1ZH",
    gstinState: "Tamil Nadu",
    gstinRegName: "ALSHIFA AYUSH HOSPITAL",
    tin: "",
    drugLicenseNo: "TN/AY/DL/2020/5678",
    panCardNo: "AXXXX1234A",
    hospitalType: "Multi-Specialty Ayurveda",
    aboutUs: "ALSHIFA AYUSH HOSPITAL is a premier AYUSH healthcare facility providing authentic Ayurveda, Siddha, Unani, and Naturopathy treatments. Established in 2000, we serve patients with traditional medicine backed by modern diagnostics.",
    servicesOffered: "Ayurveda Consultation, Panchakarma, Siddha Medicine, Unani Medicine, Yoga Therapy, Naturopathy, General Medicine, Diagnostic Services, Pharmacy, Inpatient Care, Emergency Services, Maternity Care",
    specialities: "Panchakarma, Ksharasutra, Agnikarma, Marma Therapy, Varmam, Siddha Varma, Yoga, Naturopathy, Physiotherapy",
    foundation: "2000",
    website: "https://ayuzee.com",
    email: "info@alshifa-ayush.com",
    phone: "+91 9876543210",
    whatsapp: "+91 9876543210",
  });

  // Config state
  const [config, setConfig] = useState({
    doctorLabel: "Vaidya",
    patientLabel: "Rogi",
    patientType: "Both",
    whyPriceIncrease: "CESS/TAX",
    defaultTemplate: "AYURVEDA",
    smsDnd: "OFF",
    tokenPriority: "First Come",
    attendanceLevel: "Advanced",
    onlineGadgetAttendance: true,
    doctorOnlineReview: true,
    checkinEnabled: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🏥 Manage Hospital / Branch</h1>
          <p className="text-sm text-muted-foreground">Edit hospital details, manage branches, locations, photos & settings</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Building2 className="h-3.5 w-3.5 mr-1" /> {hospital.name}
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="edit-hospital">🏥 Edit Hospital</TabsTrigger>
          <TabsTrigger value="edit-location">📍 Edit Location</TabsTrigger>
          <TabsTrigger value="manage-photo">📷 Manage Photos</TabsTrigger>
          <TabsTrigger value="post-message">💬 Post Message</TabsTrigger>
          <TabsTrigger value="master-settings">⚙️ Master Settings</TabsTrigger>
          <TabsTrigger value="service-provider">🚚 Service Provider</TabsTrigger>
          <TabsTrigger value="branch-locations">🌐 Branch Locations</TabsTrigger>
          <TabsTrigger value="print-config">🖨️ Print Config</TabsTrigger>
          <TabsTrigger value="widget">🔌 Widget</TabsTrigger>
          <TabsTrigger value="import-patient">📥 Import Patient</TabsTrigger>
        </TabsList>

        {/* TAB: Edit Hospital */}
        <TabsContent value="edit-hospital" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">🏥 Hospital Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Hospital Name *</Label><Input value={hospital.name} onChange={e => setHospital({...hospital, name: e.target.value})} /></div>
              <div><Label>Established Year *</Label><Input value={hospital.establishedYear} onChange={e => setHospital({...hospital, establishedYear: e.target.value})} /></div>
              <div><Label>Registration No</Label><Input value={hospital.registrationNo} onChange={e => setHospital({...hospital, registrationNo: e.target.value})} /></div>
              <div><Label>Hospital Type</Label>
                <Select value={hospital.hospitalType} onValueChange={v => setHospital({...hospital, hospitalType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multi-Specialty Ayurveda">Multi-Specialty Ayurveda</SelectItem>
                    <SelectItem value="Single Specialty">Single Specialty</SelectItem>
                    <SelectItem value="Panchakarma Center">Panchakarma Center</SelectItem>
                    <SelectItem value="Siddha Hospital">Siddha Hospital</SelectItem>
                    <SelectItem value="Unani Hospital">Unani Hospital</SelectItem>
                    <SelectItem value="Homeopathy Center">Homeopathy Center</SelectItem>
                    <SelectItem value="Yoga & Naturopathy">Yoga & Naturopathy</SelectItem>
                    <SelectItem value="Integrative Medicine">Integrative Medicine</SelectItem>
                    <SelectItem value="Wellness Resort">Wellness Resort</SelectItem>
                    <SelectItem value="Teaching Hospital">Teaching Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>GSTIN</Label><Input value={hospital.gstin} onChange={e => setHospital({...hospital, gstin: e.target.value})} /></div>
              <div><Label>GSTIN State</Label><Input value={hospital.gstinState} onChange={e => setHospital({...hospital, gstinState: e.target.value})} /></div>
              <div><Label>GSTIN Reg Name</Label><Input value={hospital.gstinRegName} onChange={e => setHospital({...hospital, gstinRegName: e.target.value})} /></div>
              <div><Label>TIN No</Label><Input value={hospital.tin} onChange={e => setHospital({...hospital, tin: e.target.value})} /></div>
              <div><Label>Drug License No</Label><Input value={hospital.drugLicenseNo} onChange={e => setHospital({...hospital, drugLicenseNo: e.target.value})} /></div>
              <div><Label>PAN Card No</Label><Input value={hospital.panCardNo} onChange={e => setHospital({...hospital, panCardNo: e.target.value})} /></div>
              <div><Label>Website</Label><Input value={hospital.website} onChange={e => setHospital({...hospital, website: e.target.value})} /></div>
              <div><Label>Email</Label><Input value={hospital.email} onChange={e => setHospital({...hospital, email: e.target.value})} /></div>
              <div><Label>Phone</Label><Input value={hospital.phone} onChange={e => setHospital({...hospital, phone: e.target.value})} /></div>
              <div><Label>WhatsApp</Label><Input value={hospital.whatsapp} onChange={e => setHospital({...hospital, whatsapp: e.target.value})} /></div>
              <div className="col-span-2"><Label>About Us</Label><Textarea rows={4} value={hospital.aboutUs} onChange={e => setHospital({...hospital, aboutUs: e.target.value})} /></div>
              <div className="col-span-2"><Label>Services Offered</Label><Textarea rows={3} value={hospital.servicesOffered} onChange={e => setHospital({...hospital, servicesOffered: e.target.value})} /></div>
              <div className="col-span-2"><Label>Specialities (AYUSH specific)</Label><Textarea rows={2} value={hospital.specialities} onChange={e => setHospital({...hospital, specialities: e.target.value})} /></div>
            </CardContent>
          </Card>
          <Button className="w-full md:w-auto" onClick={() => toast.success("Hospital details saved!")}>💾 Save Hospital Details</Button>
        </TabsContent>

        {/* TAB: Edit Location */}
        <TabsContent value="edit-location" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">📍 Hospital Location & Address</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Address Line 1 *</Label><Input placeholder="Street address" defaultValue="#11, Main Road" /></div>
              <div><Label>Address Line 2</Label><Input placeholder="Landmark" defaultValue="Near Bus Stand" /></div>
              <div><Label>City *</Label><Input defaultValue="Kadayanallur" /></div>
              <div><Label>District</Label><Input defaultValue="Tenkasi" /></div>
              <div><Label>State *</Label><Input defaultValue="Tamil Nadu" /></div>
              <div><Label>Country</Label><Input defaultValue="India" /></div>
              <div><Label>Pincode *</Label><Input defaultValue="627751" /></div>
              <div><Label>Phone (Landline)</Label><Input defaultValue="04636-123456" /></div>
              <div><Label>Latitude</Label><Input placeholder="9.1765" /></div>
              <div><Label>Longitude</Label><Input placeholder="77.5820" /></div>
              <div className="col-span-2 bg-muted/50 rounded-lg h-48 flex items-center justify-center border-2 border-dashed">
                <div className="text-center text-muted-foreground"><MapPin className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">Google Map will appear here based on lat/long</p><p className="text-xs">Click to set location on map</p></div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success("Location updated!")}>💾 Save Location</Button>
        </TabsContent>

        {/* TAB: Manage Photos */}
        <TabsContent value="manage-photo" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">📷 Upload Hospital Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800">Upload Images for {hospital.name}</p>
                <ul className="text-xs text-amber-700 mt-1 list-disc pl-4">
                  <li>Images should be under 2MB. Supported: JPG, PNG, WebP</li>
                  <li>Upload Logo, Cover Photo, and Profile Photo</li>
                </ul>
              </div>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2"><input type="radio" name="photoType" defaultChecked /> Logo</label>
                <label className="flex items-center gap-2"><input type="radio" name="photoType" /> Cover Photo</label>
                <label className="flex items-center gap-2"><input type="radio" name="photoType" /> Profile Photo</label>
                <label className="flex items-center gap-2"><input type="radio" name="photoType" /> Gallery</label>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button variant="default" size="sm"><ImagePlus className="h-4 w-4 mr-1" /> Select Photo...</Button>
                <Button variant="secondary" size="sm"><Camera className="h-4 w-4 mr-1" /> Take a Photo</Button>
                <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" /> Upload All</Button>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Available Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Logo", "Cover Photo", "Profile", "Gallery 1"].map((label, i) => (
                    <div key={i} className="border rounded-lg p-3 text-center">
                      <div className="h-20 bg-muted rounded flex items-center justify-center mb-2"><Camera className="h-6 w-6 text-muted-foreground" /></div>
                      <Badge variant="outline" className="text-xs">{label}</Badge>
                      <div className="flex gap-2 mt-2 justify-center">
                        <Button size="sm" variant="ghost" className="text-xs h-6">Set Default</Button>
                        <Button size="sm" variant="ghost" className="text-xs h-6 text-red-500">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Post Message */}
        <TabsContent value="post-message" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">💬 Post a Message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Posts added to <span className="text-primary font-medium">{hospital.name.toLowerCase().replace(/\s+/g, "-")}</span> profile page. Doctor posts also appear on the profile.</p>
              <Dialog open={postOpen} onOpenChange={setPostOpen}>
                <DialogTrigger asChild>
                  <Button><MessageSquare className="h-4 w-4 mr-1" /> Compose New Post</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Share a message with public</DialogTitle></DialogHeader>
                  <Textarea placeholder="Share what's going on..." value={postMsg} onChange={e => setPostMsg(e.target.value)} rows={5} />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>You can upload image.</span>
                    <Button size="sm" variant="outline"><Camera className="h-3.5 w-3.5 mr-1" /> Choose Image</Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPostOpen(false)}>Cancel</Button>
                    <Button onClick={() => { toast.success("Post published!"); setPostOpen(false); setPostMsg(""); }}>Post</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="bg-sky-50 border border-sky-200 rounded p-3 text-sm text-sky-700">There are no activity/posts found.</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Master Settings / Configuration */}
        <TabsContent value="master-settings" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">⚙️ Configuration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>How do you call your Doctor/Specialist?</Label>
                <Select value={config.doctorLabel} onValueChange={v => setConfig({...config, doctorLabel: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Vaidya">Vaidya</SelectItem><SelectItem value="Doctor">Doctor</SelectItem><SelectItem value="Physician">Physician</SelectItem><SelectItem value="Hakim">Hakim</SelectItem><SelectItem value="Practitioner">Practitioner</SelectItem></SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">This will be used in all app labels, e.g. "Book a Vaidya"</p>
              </div>
              <div><Label>How do you call your Patient/Customer?</Label>
                <Select value={config.patientLabel} onValueChange={v => setConfig({...config, patientLabel: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Rogi">Rogi</SelectItem><SelectItem value="Patient">Patient</SelectItem><SelectItem value="Client">Client</SelectItem><SelectItem value="Guest">Guest (Resort)</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Patient Type</Label>
                <Select value={config.patientType} onValueChange={v => setConfig({...config, patientType: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Both">Both (OP + IP)</SelectItem><SelectItem value="OP Only">OP Only</SelectItem><SelectItem value="IP Only">IP Only</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Why price increase reason</Label><Input value={config.whyPriceIncrease} onChange={e => setConfig({...config, whyPriceIncrease: e.target.value})} /></div>
              <div><Label>Default Consultation Template</Label>
                <Select value={config.defaultTemplate} onValueChange={v => setConfig({...config, defaultTemplate: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="AYURVEDA">Ayurveda</SelectItem><SelectItem value="SIDDHA">Siddha</SelectItem><SelectItem value="UNANI">Unani</SelectItem><SelectItem value="HOMEOPATHY">Homeopathy</SelectItem><SelectItem value="YOGA">Yoga & Naturopathy</SelectItem><SelectItem value="GENERAL">General</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Token Priority</Label>
                <Select value={config.tokenPriority} onValueChange={v => setConfig({...config, tokenPriority: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="First Come">First Come First Serve</SelectItem><SelectItem value="Time Based">Time-slot Based</SelectItem><SelectItem value="Doctor">Doctor Assigned</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>SMS/DND Override</Label><Input value={config.smsDnd} onChange={e => setConfig({...config, smsDnd: e.target.value})} /></div>
              <div><Label>Attendance Level</Label><Input value={config.attendanceLevel} onChange={e => setConfig({...config, attendanceLevel: e.target.value})} /></div>
              <div className="flex items-center gap-3"><Switch checked={config.onlineGadgetAttendance} onCheckedChange={v => setConfig({...config, onlineGadgetAttendance: v})} /><Label>Online Gadget Attendance</Label></div>
              <div className="flex items-center gap-3"><Switch checked={config.doctorOnlineReview} onCheckedChange={v => setConfig({...config, doctorOnlineReview: v})} /><Label>Doctor Online/Loadout Review</Label></div>
              <div className="flex items-center gap-3"><Switch checked={config.checkinEnabled} onCheckedChange={v => setConfig({...config, checkinEnabled: v})} /><Label>Checkin Enabled (Kiosk/App)</Label></div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success("Settings saved!")}>💾 Save Configuration</Button>
        </TabsContent>

        {/* TAB: Service Provider / Supplier */}
        <TabsContent value="service-provider" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">🚚 Service Providers & Suppliers</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Provider</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Contact</TableHead><TableHead>Services</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {[
                    { name: "Arya Vaidya Sala", type: "Medicine Supplier", contact: "0487-123456", services: "Ayurvedic Medicines, Oils", status: "Active" },
                    { name: "Kottakkal Pharma", type: "Medicine Supplier", contact: "0483-654321", services: "Classical Medicines, Arishtams", status: "Active" },
                    { name: "SRM Diagnostics", type: "Lab Partner", contact: "044-987654", services: "Blood Tests, Imaging", status: "Active" },
                    { name: "Himalaya Wellness", type: "Product Supplier", contact: "080-543210", services: "Proprietary Medicines", status: "Pending" },
                    { name: "Laundry Express", type: "Housekeeping", contact: "9876500000", services: "Linen, Therapy Cloths", status: "Active" },
                    { name: "MedEquip India", type: "Equipment", contact: "044-111222", services: "Panchakarma Equipment, Droni", status: "Active" },
                  ].map((sp, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{sp.name}</TableCell>
                      <TableCell><Badge variant="outline">{sp.type}</Badge></TableCell>
                      <TableCell className="text-xs">{sp.contact}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{sp.services}</TableCell>
                      <TableCell><Badge variant={sp.status === "Active" ? "default" : "secondary"}>{sp.status}</Badge></TableCell>
                      <TableCell><Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Branch Locations Table — REAL DATA */}
        <TabsContent value="branch-locations" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-lg">🌐 Branch Locations</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setAddBranchOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Branch</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {branches.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.branch_name}</TableCell>
                        <TableCell className="font-mono text-xs">{b.branch_code}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{(b.branch_type || "branch").replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-sm">{b.city || "—"}</TableCell>
                        <TableCell className="text-xs">{b.phone || "—"}</TableCell>
                        <TableCell className="text-xs">{b.manager_name || "—"}</TableCell>
                        <TableCell>{b.bed_count || 0}</TableCell>
                        <TableCell>
                          <Badge className={b.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {b.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => toggleBranch(b.id, b.is_active)}>
                              {b.is_active ? <Trash2 className="h-3.5 w-3.5 text-red-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {branches.length === 0 && !branchLoading && (
                      <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No branches found. Click "Add Branch" to create one.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{branches.length} branch(es) registered</p>
            </CardContent>
          </Card>

          {/* Add Branch Dialog */}
          <Dialog open={addBranchOpen} onOpenChange={setAddBranchOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Register New Branch / Franchise</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                {/* Section 1: Basic Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Building2 className="h-4 w-4" /> Basic Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Branch Name *</Label><Input value={newBranch.branch_name} onChange={e => setNewBranch({...newBranch, branch_name: e.target.value})} placeholder="e.g. Chennai - Keelkattalai" /></div>
                    <div><Label className="text-xs">Branch Code *</Label><Input value={newBranch.branch_code} onChange={e => setNewBranch({...newBranch, branch_code: e.target.value})} placeholder="e.g. ALCH-01" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div><Label className="text-xs">Branch Type *</Label>
                      <Select value={newBranch.branch_type} onValueChange={v => setNewBranch({...newBranch, branch_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main_hospital">Main Hospital</SelectItem>
                          <SelectItem value="branch">Branch</SelectItem>
                          <SelectItem value="franchisee">Franchisee</SelectItem>
                          <SelectItem value="exclusive_center">Exclusive Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">OP Patient ID Prefix</Label><Input value={newBranch.op_prefix} onChange={e => setNewBranch({...newBranch, op_prefix: e.target.value})} placeholder="ALCH-" /></div>
                    <div><Label className="text-xs">Manager / Head</Label><Input value={newBranch.manager_name} onChange={e => setNewBranch({...newBranch, manager_name: e.target.value})} placeholder="Dr. Name" /></div>
                  </div>
                </div>

                {/* Section 2: Contact & Location */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><MapPin className="h-4 w-4" /> Contact & Location</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">Phone</Label><Input value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} placeholder="+91 98765 43210" /></div>
                    <div><Label className="text-xs">Email</Label><Input value={newBranch.email} onChange={e => setNewBranch({...newBranch, email: e.target.value})} placeholder="branch@hospital.com" /></div>
                    <div><Label className="text-xs">WhatsApp No.</Label><Input value={newBranch.whatsapp_no} onChange={e => setNewBranch({...newBranch, whatsapp_no: e.target.value})} placeholder="+91..." /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div><Label className="text-xs">City</Label><Input value={newBranch.city} onChange={e => setNewBranch({...newBranch, city: e.target.value})} placeholder="Chennai" /></div>
                    <div><Label className="text-xs">State</Label><Input value={newBranch.state} onChange={e => setNewBranch({...newBranch, state: e.target.value})} /></div>
                    <div><Label className="text-xs">Pincode</Label><Input value={newBranch.pincode} onChange={e => setNewBranch({...newBranch, pincode: e.target.value})} placeholder="600073" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div><Label className="text-xs">Full Address</Label><Input value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} placeholder="Full street address..." /></div>
                    <div><Label className="text-xs">Google Maps URL</Label><Input value={newBranch.google_maps_url} onChange={e => setNewBranch({...newBranch, google_maps_url: e.target.value})} placeholder="https://maps.google.com/..." /></div>
                  </div>
                </div>

                {/* Section 3: Regulatory & Compliance */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><FileText className="h-4 w-4" /> Regulatory & Compliance</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label className="text-xs">GSTIN</Label><Input value={newBranch.gstin} onChange={e => setNewBranch({...newBranch, gstin: e.target.value})} placeholder="33AXXXX1234A1ZH" /></div>
                    <div><Label className="text-xs">AYUSH License No.</Label><Input value={newBranch.ayush_license_no} onChange={e => setNewBranch({...newBranch, ayush_license_no: e.target.value})} placeholder="TN/AYUSH/..." /></div>
                    <div><Label className="text-xs">Opening Hours</Label><Input value={newBranch.opening_hours} onChange={e => setNewBranch({...newBranch, opening_hours: e.target.value})} /></div>
                  </div>
                  <div className="mt-2">
                    <Label className="text-xs">Specialties Offered</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["Ayurveda", "Siddha", "Homeopathy", "Unani", "Yoga & Naturopathy", "Panchakarma", "Spine Care", "Integrative"].map(s => (
                        <label key={s} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input type="checkbox" className="rounded" checked={newBranch.specialties.includes(s)} onChange={e => {
                            setNewBranch({...newBranch, specialties: e.target.checked ? [...newBranch.specialties, s] : newBranch.specialties.filter(x => x !== s)});
                          }} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 4: Operations */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Settings className="h-4 w-4" /> Operations & Capacity</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div><Label className="text-xs">Bed Count</Label><Input value={newBranch.bed_count} onChange={e => setNewBranch({...newBranch, bed_count: e.target.value})} type="number" /></div>
                    <div><Label className="text-xs">Daily OP Capacity</Label><Input value={newBranch.daily_op_capacity} onChange={e => setNewBranch({...newBranch, daily_op_capacity: e.target.value})} type="number" /></div>
                    <div><Label className="text-xs">PK Rooms</Label><Input value={newBranch.panchakarma_rooms} onChange={e => setNewBranch({...newBranch, panchakarma_rooms: e.target.value})} type="number" /></div>
                    <div className="flex flex-col gap-1 pt-4">
                      <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" className="rounded" checked={newBranch.has_pharmacy} onChange={e => setNewBranch({...newBranch, has_pharmacy: e.target.checked})} /> Has Pharmacy</label>
                      <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" className="rounded" checked={newBranch.has_lab} onChange={e => setNewBranch({...newBranch, has_lab: e.target.checked})} /> Has Lab</label>
                      <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" className="rounded" checked={newBranch.has_ipd} onChange={e => setNewBranch({...newBranch, has_ipd: e.target.checked})} /> Has IPD</label>
                    </div>
                  </div>
                </div>

                {/* Section 5: Franchise (only show if type is franchisee) */}
                {newBranch.branch_type === "franchisee" && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Store className="h-4 w-4" /> Franchise Details</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label className="text-xs">Franchise Plan</Label>
                        <Select value={newBranch.franchise_plan} onValueChange={v => setNewBranch({...newBranch, franchise_plan: v})}>
                          <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs">Payment Type</Label>
                        <Select value={newBranch.franchise_payment_type} onValueChange={v => setNewBranch({...newBranch, franchise_payment_type: v})}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue_share">Revenue Share</SelectItem>
                            <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs">Revenue Share %</Label><Input value={newBranch.franchise_revenue_share_pct} onChange={e => setNewBranch({...newBranch, franchise_revenue_share_pct: e.target.value})} placeholder="15" type="number" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div><Label className="text-xs">Agreement Start</Label><Input value={newBranch.franchise_agreement_start} onChange={e => setNewBranch({...newBranch, franchise_agreement_start: e.target.value})} type="date" /></div>
                      <div><Label className="text-xs">Agreement End</Label><Input value={newBranch.franchise_agreement_end} onChange={e => setNewBranch({...newBranch, franchise_agreement_end: e.target.value})} type="date" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div><Label className="text-xs">Franchise Owner Name</Label><Input value={newBranch.franchise_owner_name} onChange={e => setNewBranch({...newBranch, franchise_owner_name: e.target.value})} /></div>
                      <div><Label className="text-xs">Owner Phone</Label><Input value={newBranch.franchise_owner_phone} onChange={e => setNewBranch({...newBranch, franchise_owner_phone: e.target.value})} /></div>
                      <div><Label className="text-xs">Owner Email</Label><Input value={newBranch.franchise_owner_email} onChange={e => setNewBranch({...newBranch, franchise_owner_email: e.target.value})} /></div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddBranchOpen(false)}>Cancel</Button>
                <Button onClick={handleAddBranch} disabled={savingBranch}>
                  {savingBranch ? "Saving..." : newBranch.branch_type === "franchisee" ? "Register Franchise" : "Register Branch"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB: Print Configuration */}
        <TabsContent value="print-config" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">🖨️ Print Configuration</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Print Header</Label><Input defaultValue="ALSHIFA AYUSH HOSPITAL" /></div>
              <div><Label>Print Sub-Header</Label><Input defaultValue="Authentic Ayurveda | Siddha | Unani | Yoga" /></div>
              <div><Label>Print Footer</Label><Input defaultValue="Thank you for choosing AYUSH healthcare" /></div>
              <div><Label>Paper Size</Label>
                <Select defaultValue="A4"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="A4">A4</SelectItem><SelectItem value="A5">A5</SelectItem><SelectItem value="Letter">Letter</SelectItem><SelectItem value="Thermal-80mm">Thermal 80mm</SelectItem><SelectItem value="Thermal-58mm">Thermal 58mm</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Prescription Format</Label>
                <Select defaultValue="ayurveda"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ayurveda">Ayurveda Standard</SelectItem><SelectItem value="siddha">Siddha Format</SelectItem><SelectItem value="unani">Unani Format</SelectItem><SelectItem value="homeopathy">Homeopathy Format</SelectItem><SelectItem value="general">General Format</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Show Hospital Logo on Print</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Show Doctor Signature Line</Label></div>
              <div className="flex items-center gap-3"><Switch /><Label>Auto-print on Billing</Label></div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success("Print config saved!")}>💾 Save Print Config</Button>
        </TabsContent>

        {/* TAB: Widget Generator */}
        <TabsContent value="widget" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">🔌 Widget Generator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Generate embeddable widgets for your hospital website</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Online Booking Widget", desc: "Embed appointment booking on your website" },
                  { label: "Doctor List Widget", desc: "Show available doctors with booking links" },
                  { label: "Feedback Widget", desc: "Collect patient reviews on your website" },
                  { label: "Queue Status Widget", desc: "Show live queue status for waiting patients" },
                ].map((w, i) => (
                  <Card key={i} className="p-4">
                    <h3 className="font-semibold text-sm">{w.label}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{w.desc}</p>
                    <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5 mr-1" /> Generate Code</Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Import Patient */}
        <TabsContent value="import-patient" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">📥 Import Patients</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Bulk import patient records from CSV/Excel file</p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Drop your CSV/Excel file here</p>
                <p className="text-xs text-muted-foreground mt-1">Supports: .csv, .xlsx, .xls (Max 10MB, up to 10,000 records)</p>
                <Button className="mt-4" variant="outline"><Upload className="h-4 w-4 mr-1" /> Choose File</Button>
              </div>
              <div className="bg-muted/50 rounded p-3">
                <h4 className="text-sm font-semibold mb-1">Required columns:</h4>
                <p className="text-xs text-muted-foreground">Patient Name, Phone, Gender, Age/DOB, City, UHID (optional)</p>
                <Button size="sm" variant="link" className="text-xs p-0 h-auto mt-1">📄 Download Sample Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default HmsBranchManagement;
