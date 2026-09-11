import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Smartphone, Video, Package, CalendarCheck, Brain, ArrowRight,
  Building2, Wifi, Layers, CheckCircle2, Clock, IndianRupee,
  Truck, MessageSquare, Activity, Heart, Stethoscope, MapPin,
  Home, Star, Send,
} from "lucide-react";

// ─── Patient Journey Steps (Online/Hybrid) ───
const journeySteps = [
  { id: 1, title: "AI Spine Assessment", price: "₹199", channel: "Online", icon: Brain, desc: "Patient completes AI assessment at home → gets Spine Score + risk report", cta: "Start Assessment" },
  { id: 2, title: "Book Consultation", price: "₹300-500", channel: "Online/Physical", icon: CalendarCheck, desc: "Choose video consult or physical visit → pick doctor + time slot", cta: "Book Slot" },
  { id: 3, title: "Doctor Consultation", price: "Included", channel: "Video/Physical", icon: Video, desc: "Diagnosis, protocol design, prescription → digital plan sent", cta: "Join Consult" },
  { id: 4, title: "Home Therapy Kit", price: "₹500-2000", channel: "Courier", icon: Package, desc: "Ear seeds, cupping kit, exercise cards, meditation audio, medicines couriered", cta: "Order Kit" },
  { id: 5, title: "Guided Sessions", price: "Package", channel: "Physical/Video", icon: Stethoscope, desc: "Physical Panchakarma OR guided home therapy via video", cta: "Start Sessions" },
  { id: 6, title: "Video Follow-up & Coaching", price: "Included", channel: "Online", icon: MessageSquare, desc: "Video LMS exercises + WhatsApp coaching + progress check", cta: "Continue Care" },
  { id: 7, title: "Outcome Tracking", price: "Free", channel: "App", icon: Activity, desc: "Patient logs VAS/progress → doctor monitors remotely", cta: "Track Progress" },
];

// ─── Home Kit options ───
const homeKits = [
  { id: "k1", name: "Sciatica Home Kit", price: 1200, contents: ["Ear seeds (spine zone)", "BL40 acupressure guide", "Piriformis release ball", "Cat-cow exercise cards", "Maharasnadi Kashayam (15 days)"], condition: "Gridhrasi / Sciatica" },
  { id: "k2", name: "Cervical Home Kit", price: 1000, contents: ["Ear seeds (cervical zone)", "GB20 acupressure guide", "Chin tuck exercise cards", "Anu Taila (Nasya)", "Neck stretch band"], condition: "Cervical Spondylosis" },
  { id: "k3", name: "Low Back Pain Kit", price: 1100, contents: ["Silicone cupping cups (2)", "Tennis ball (paraspinal)", "Core exercise cards", "Rasnasaptakam Kashayam", "Mahanarayan Taila"], condition: "Chronic LBP" },
  { id: "k4", name: "Cupping Self-Care Kit", price: 800, contents: ["Silicone cups (4 sizes)", "Cupping guide + oil", "Point location chart", "Aftercare instructions"], condition: "Muscle tension / spasm" },
  { id: "k5", name: "Meditation & Recovery Kit", price: 500, contents: ["Dispenza meditation audio access", "Breathwork guide", "Journal", "Progress tracker"], condition: "Stress-related / chronic pain" },
  { id: "k6", name: "Complete Spine Kit", price: 2000, contents: ["All assessment tools", "Ear seeds + cupping", "Full exercise set", "30-day medicines", "Meditation access", "Priority WhatsApp support"], condition: "Comprehensive care" },
];

export default function SpineFranchisePortal() {
  const [activeTab, setActiveTab] = useState("journey");
  const [booking, setBooking] = useState({ name: "", phone: "", condition: "", channel: "video", date: "", slot: "", notes: "" });
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [kitOrder, setKitOrder] = useState({ name: "", phone: "", address: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  const submitBooking = async () => {
    if (!booking.name || !booking.phone) { toast.error("Enter name and phone"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("spine_franchise_data").insert({
        record_type: "booking",
        owner_id: user?.id || null,
        patient_name: booking.name,
        phone: booking.phone,
        condition: booking.condition,
        channel: booking.channel,
        booking_date: booking.date || null,
        time_slot: booking.slot,
        notes: booking.notes,
        booking_status: "pending",
      });
      toast.success("Booking request submitted! Patient will get confirmation.");
      setBooking({ name: "", phone: "", condition: "", channel: "video", date: "", slot: "", notes: "" });
    } catch (err) { toast.error("Booking failed"); }
    setSaving(false);
  };

  const submitKitOrder = async () => {
    if (!selectedKit || !kitOrder.name || !kitOrder.address) { toast.error("Select kit and enter delivery details"); return; }
    setSaving(true);
    const kit = homeKits.find(k => k.id === selectedKit);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("spine_franchise_data").insert({
        record_type: "kit_order",
        owner_id: user?.id || null,
        kit_name: kit?.name || "",
        kit_price: kit?.price || 0,
        patient_name: kitOrder.name,
        phone: kitOrder.phone,
        delivery_address: kitOrder.address,
        pincode: kitOrder.pincode,
        order_status: "pending",
      });
      toast.success(`${kit?.name} order placed! Will be dispatched via courier.`);
      setKitOrder({ name: "", phone: "", address: "", pincode: "" });
      setSelectedKit(null);
    } catch (err) { toast.error("Order failed"); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-pink-600" />
            Online / Hybrid Patient Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Digital patient journey — assessment, booking, teleconsult, home kits & follow-up
          </p>
        </div>
        <Badge className="bg-pink-100 text-pink-700">
          <Building2 className="h-3 w-3 mr-1" /> Franchise Tool #6
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="journey" className="text-xs gap-1"><ArrowRight className="h-3 w-3" /> Journey</TabsTrigger>
          <TabsTrigger value="booking" className="text-xs gap-1"><CalendarCheck className="h-3 w-3" /> Booking</TabsTrigger>
          <TabsTrigger value="kits" className="text-xs gap-1"><Package className="h-3 w-3" /> Home Kits</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs gap-1"><Layers className="h-3 w-3" /> Channels</TabsTrigger>
        </TabsList>

        {/* TAB 1: Patient Journey */}
        <TabsContent value="journey" className="space-y-3">
          <p className="text-sm text-muted-foreground">The complete digital-first patient journey from assessment to recovery:</p>
          <div className="space-y-2">
            {journeySteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-pink-600" />
                    </div>
                    {i < journeySteps.length - 1 && <div className="w-0.5 h-6 bg-pink-200" />}
                  </div>
                  <Card className="flex-1">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px]">Step {step.id}</Badge>
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-50 text-green-700 text-[9px]">{step.price}</Badge>
                          <Badge variant="secondary" className="text-[9px]">{step.channel}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: Booking */}
        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><CalendarCheck className="h-4 w-4" /> New Consultation Booking</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Patient Name</label><Input value={booking.name} onChange={e => setBooking(p => ({ ...p, name: e.target.value }))} placeholder="Full name" /></div>
                <div><label className="text-xs font-medium">Phone / WhatsApp</label><Input value={booking.phone} onChange={e => setBooking(p => ({ ...p, phone: e.target.value }))} placeholder="+91..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Condition</label>
                  <Select value={booking.condition} onValueChange={v => setBooking(p => ({ ...p, condition: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sciatica">Sciatica</SelectItem>
                      <SelectItem value="cervical">Neck / Cervical</SelectItem>
                      <SelectItem value="lbp">Low Back Pain</SelectItem>
                      <SelectItem value="disc">Disc Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Consultation Type</label>
                  <Select value={booking.channel} onValueChange={v => setBooking(p => ({ ...p, channel: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">📹 Video Consultation</SelectItem>
                      <SelectItem value="physical">🏥 Physical Visit</SelectItem>
                      <SelectItem value="phone">📞 Phone Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Preferred Date</label><Input type="date" value={booking.date} onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} /></div>
                <div>
                  <label className="text-xs font-medium">Time Slot</label>
                  <Select value={booking.slot} onValueChange={v => setBooking(p => ({ ...p, slot: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9-10">9:00 - 10:00 AM</SelectItem>
                      <SelectItem value="10-11">10:00 - 11:00 AM</SelectItem>
                      <SelectItem value="11-12">11:00 - 12:00 PM</SelectItem>
                      <SelectItem value="4-5">4:00 - 5:00 PM</SelectItem>
                      <SelectItem value="5-6">5:00 - 6:00 PM</SelectItem>
                      <SelectItem value="6-7">6:00 - 7:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><label className="text-xs font-medium">Notes / Symptoms</label><Textarea className="h-16 text-xs" value={booking.notes} onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))} placeholder="Brief description of pain, duration, etc." /></div>
              <Button className="w-full gap-1" onClick={submitBooking} disabled={saving}>
                <Send className="h-4 w-4" /> {saving ? "Submitting..." : "Submit Booking"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Home Kits */}
        <TabsContent value="kits" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {homeKits.map(kit => (
              <Card
                key={kit.id}
                className={`cursor-pointer transition hover:shadow-md ${selectedKit === kit.id ? "border-pink-400 ring-2 ring-pink-200" : ""}`}
                onClick={() => setSelectedKit(kit.id)}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded bg-pink-100 flex items-center justify-center"><Package className="h-4 w-4 text-pink-600" /></div>
                    <span className="font-bold text-pink-700">₹{kit.price}</span>
                  </div>
                  <p className="font-medium text-sm mt-2">{kit.name}</p>
                  <Badge variant="secondary" className="text-[9px] mt-1">{kit.condition}</Badge>
                  <ul className="mt-2 space-y-0.5">
                    {kit.contents.map((c, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5 text-green-400 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                  {selectedKit === kit.id && <Badge className="bg-pink-100 text-pink-700 text-[9px] mt-2">✓ Selected</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedKit && (
            <Card className="border-pink-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Truck className="h-4 w-4" /> Delivery Details for {homeKits.find(k => k.id === selectedKit)?.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Name</label><Input value={kitOrder.name} onChange={e => setKitOrder(p => ({ ...p, name: e.target.value }))} placeholder="Recipient name" /></div>
                  <div><label className="text-xs font-medium">Phone</label><Input value={kitOrder.phone} onChange={e => setKitOrder(p => ({ ...p, phone: e.target.value }))} placeholder="Contact" /></div>
                </div>
                <div><label className="text-xs font-medium">Delivery Address</label><Textarea className="h-16 text-xs" value={kitOrder.address} onChange={e => setKitOrder(p => ({ ...p, address: e.target.value }))} placeholder="Full address" /></div>
                <div className="w-32"><label className="text-xs font-medium">Pincode</label><Input value={kitOrder.pincode} onChange={e => setKitOrder(p => ({ ...p, pincode: e.target.value }))} placeholder="Pincode" /></div>
                <Button className="w-full gap-1" onClick={submitKitOrder} disabled={saving}>
                  <Truck className="h-4 w-4" /> {saving ? "Placing..." : `Order Kit — ₹${homeKits.find(k => k.id === selectedKit)?.price}`}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 4: Channels Comparison */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Physical", icon: Building2, color: "blue", best: ["Panchakarma (needs hands-on)", "Agnikarma / cupping", "First-time assessment", "Elderly patients"], desc: "Full in-clinic experience" },
              { name: "Online", icon: Wifi, color: "green", best: ["AI assessment", "Follow-up consultations", "Home exercise coaching", "Remote/distant patients"], desc: "Reach anyone, anywhere" },
              { name: "Hybrid", icon: Layers, color: "purple", best: ["Assess online, treat physical", "Intensive PK + home follow-up", "Best patient retention", "Maximum reach + depth"], desc: "Best of both worlds" },
            ].map(ch => {
              const Icon = ch.icon;
              return (
                <Card key={ch.name}>
                  <CardContent className="pt-4 pb-3">
                    <div className={`w-12 h-12 rounded-lg bg-${ch.color}-100 flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 text-${ch.color}-600`} />
                    </div>
                    <h3 className="font-bold">{ch.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{ch.desc}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Best For</p>
                    {ch.best.map((b, i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px]"><CheckCircle2 className={`h-2.5 w-2.5 text-${ch.color}-500`} /> {b}</div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Hybrid flow diagram */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Layers className="h-4 w-4 text-purple-600" /> Recommended Hybrid Flow</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {["Online AI Assessment (₹199)", "Video Consult", "Physical Intensive (7-14 days PK)", "Home Kit + Video Follow-up", "Monthly Maintenance (1 physical + 3 online)"].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-700 text-[10px]">{step}</Badge>
                    {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-purple-400" />}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">This hybrid flow maximizes reach (online assessment + follow-up) while delivering hands-on Panchakarma that requires physical presence.</p>
            </CardContent>
          </Card>

          {/* Revenue by channel */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><IndianRupee className="h-4 w-4" /> Revenue Streams by Channel</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b text-muted-foreground"><th className="text-left p-2">Revenue Stream</th><th className="text-center p-2">Physical</th><th className="text-center p-2">Online</th><th className="text-center p-2">Hybrid</th></tr></thead>
                  <tbody>
                    {[
                      ["AI Assessment ₹199", true, true, true],
                      ["Level 1 Therapies (₹500-1000)", true, false, true],
                      ["Panchakarma Packages (₹8.5k-22k)", true, false, true],
                      ["Teleconsultation (₹300-500)", false, true, true],
                      ["Home Therapy Kits (₹500-2000)", false, true, true],
                      ["Medicines (courier/pharmacy)", true, true, true],
                      ["Monthly Maintenance (₹3500)", true, true, true],
                      ["Corporate Wellness (B2B)", true, true, true],
                    ].map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 font-medium">{row[0]}</td>
                        <td className="p-2 text-center">{row[1] ? "✅" : "—"}</td>
                        <td className="p-2 text-center">{row[2] ? "✅" : "—"}</td>
                        <td className="p-2 text-center">{row[3] ? "✅" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
