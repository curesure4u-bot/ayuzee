import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Globe, Calendar, Clock, Users, IndianRupee, Copy,
  ExternalLink, CheckCircle, TrendingUp, QrCode,
  Smartphone, MessageCircle, Loader2,
} from "lucide-react";
import { useOnlineBooking } from "@/hooks/useOnlineBooking";

type BookingSlot = { time: string; available: boolean; booked: number; total: number };

const todaySlots: BookingSlot[] = [
  { time: "09:00 AM", available: false, booked: 3, total: 3 },
  { time: "09:30 AM", available: false, booked: 3, total: 3 },
  { time: "10:00 AM", available: true, booked: 2, total: 3 },
  { time: "10:30 AM", available: true, booked: 1, total: 3 },
  { time: "11:00 AM", available: true, booked: 0, total: 3 },
  { time: "11:30 AM", available: true, booked: 1, total: 3 },
  { time: "02:00 PM", available: true, booked: 1, total: 3 },
  { time: "02:30 PM", available: true, booked: 0, total: 3 },
  { time: "03:00 PM", available: true, booked: 0, total: 3 },
  { time: "03:30 PM", available: true, booked: 1, total: 3 },
  { time: "04:00 PM", available: true, booked: 2, total: 3 },
  { time: "04:30 PM", available: false, booked: 3, total: 3 },
];

const HmsOnlineBooking = () => {
  const { bookings, loading, error, confirmed, pendingPayment, totalToday } = useOnlineBooking();
  const bookingUrl = "https://book.ayuzee.com/main-hospital";
  const embedCode = `<iframe src="${bookingUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const totalRevenue = bookings.filter(b => b.status !== "cancelled").length * 400;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" /> Online Appointment Booking
          </h1>
          <p className="text-sm text-muted-foreground">Patient-facing booking widget · Doctor availability · UPI payment · WhatsApp confirmation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(bookingUrl, "_blank")}><ExternalLink className="mr-1 h-4 w-4" /> Preview Widget</Button>
          <Button size="sm" onClick={() => { navigator.clipboard?.writeText(bookingUrl); toast.success("Booking URL copied!"); }}><Copy className="mr-1 h-4 w-4" /> Copy Link</Button>
        </div>
      </div>

      {/* Stats */}
      {loading && (
        <div className="flex items-center justify-center py-2 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading bookings...</span>
        </div>
      )}
      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-2 text-xs text-amber-700">⚠ Using demo data. {error}</CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{totalToday}</p><p className="text-xs text-muted-foreground">Today's Bookings</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{confirmed}</p><p className="text-xs text-muted-foreground">Confirmed</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{pendingPayment}</p><p className="text-xs text-muted-foreground">Pending Payment</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-green-600" /><p className="text-lg font-bold mt-1">₹{totalRevenue.toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground">Revenue (Online)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-purple-600" /><p className="text-xl font-bold mt-1">32%</p><p className="text-xs text-muted-foreground">Online vs Walk-in</p></CardContent></Card>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="bookings">Online Bookings</TabsTrigger>
          <TabsTrigger value="slots">Slot Management</TabsTrigger>
          <TabsTrigger value="widget">Widget Setup</TabsTrigger>
          <TabsTrigger value="settings">Booking Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <Card><CardContent className="p-0"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50"><tr>
                <th className="px-3 py-2 text-left font-medium">Patient</th>
                <th className="px-3 py-2 text-left font-medium">Doctor</th>
                <th className="px-3 py-2 text-left font-medium">Date & Time</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Payment</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2"><p className="font-medium text-xs">{b.patient}</p><p className="text-[10px] text-muted-foreground">{b.phone}</p></td>
                    <td className="px-3 py-2 text-xs">{b.doctor}<br/><span className="text-muted-foreground">{b.department}</span></td>
                    <td className="px-3 py-2 text-xs">{b.date}<br/><span className="font-medium">{b.time}</span></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{b.type}</Badge></td>
                    <td className="px-3 py-2 text-xs">{b.payment}</td>
                    <td className="px-3 py-2"><Badge variant={b.status === "confirmed" ? "outline" : b.status === "pending_payment" ? "secondary" : b.status === "completed" ? "default" : "destructive"} className={`text-[10px] capitalize ${b.status === "confirmed" || b.status === "completed" ? "text-green-600" : ""}`}>{b.status.replace("_", " ")}</Badge></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]"><MessageCircle className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]"><Smartphone className="h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Today's Slot Availability - Dr. Arun Sharma</CardTitle>
                <Select defaultValue="dr-arun"><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="dr-arun">Dr. Arun Sharma</SelectItem><SelectItem value="dr-meena">Dr. Meena Patel</SelectItem><SelectItem value="dr-priya">Dr. Priya Das</SelectItem></SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {todaySlots.map((slot) => (
                  <div key={slot.time} className={`p-3 rounded-lg border text-center ${!slot.available ? "bg-red-50 border-red-200" : slot.booked > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                    <p className="text-sm font-medium">{slot.time}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{slot.booked}/{slot.total} booked</p>
                    <Badge variant={!slot.available ? "destructive" : "outline"} className={`text-[9px] mt-1 ${slot.available ? "text-green-600" : ""}`}>
                      {slot.available ? "Open" : "Full"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widget" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Booking Widget Links</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Booking Page URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={bookingUrl} readOnly className="font-mono text-xs" />
                    <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(bookingUrl); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Share this link on WhatsApp, SMS, or your website</p>
                </div>
                <div>
                  <Label>QR Code for Booking</Label>
                  <div className="mt-1 p-4 bg-muted/50 rounded-lg text-center">
                    <QrCode className="h-24 w-24 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-2">Scan to book appointment</p>
                    <Button size="sm" variant="outline" className="mt-2">Download QR</Button>
                  </div>
                </div>
                <div>
                  <Label>Embed Code (for website)</Label>
                  <div className="mt-1 p-3 bg-slate-900 rounded-lg">
                    <code className="text-xs text-green-400 font-mono break-all">{embedCode}</code>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard?.writeText(embedCode); toast.success("Embed code copied!"); }}><Copy className="mr-1 h-3 w-3" /> Copy Embed Code</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Widget Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-primary p-4 text-white text-center">
                    <p className="font-display font-bold text-lg">Ayuzee AYUSH Hospital</p>
                    <p className="text-xs text-white/70">Book Your Appointment Online</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div><Label className="text-xs">Select Department</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choose..." /></SelectTrigger><SelectContent><SelectItem value="ayu">Ayurveda</SelectItem><SelectItem value="pk">Panchakarma</SelectItem><SelectItem value="hom">Homeopathy</SelectItem></SelectContent></Select></div>
                    <div><Label className="text-xs">Select Doctor</Label><Select><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choose..." /></SelectTrigger><SelectContent><SelectItem value="d1">Dr. Arun Sharma</SelectItem><SelectItem value="d2">Dr. Meena Patel</SelectItem></SelectContent></Select></div>
                    <div><Label className="text-xs">Preferred Date</Label><Input type="date" className="h-8 text-xs" /></div>
                    <div><Label className="text-xs">Available Slots</Label>
                      <div className="grid grid-cols-3 gap-1 mt-1">
                        {["10:00", "10:30", "11:00", "02:00", "02:30", "03:00"].map(t => (
                          <Button key={t} variant="outline" size="sm" className="text-[10px] h-7">{t}</Button>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full h-8 text-xs">Confirm & Pay ₹500</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Booking Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="text-sm font-medium">Online Booking Enabled</p><p className="text-[10px] text-muted-foreground">Allow patients to book online</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="text-sm font-medium">Payment Required</p><p className="text-[10px] text-muted-foreground">Collect consultation fee during booking</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="text-sm font-medium">WhatsApp Confirmation</p><p className="text-[10px] text-muted-foreground">Auto-send confirmation via WhatsApp</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="text-sm font-medium">SMS Reminder</p><p className="text-[10px] text-muted-foreground">Send reminder 2 hours before</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border"><div><p className="text-sm font-medium">Teleconsultation Slots</p><p className="text-[10px] text-muted-foreground">Show video consult option</p></div><Switch defaultChecked /></div>
                </div>
                <div className="space-y-3">
                  <div><Label>Slot Duration (minutes)</Label><Select defaultValue="30"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 min</SelectItem><SelectItem value="20">20 min</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="45">45 min</SelectItem></SelectContent></Select></div>
                  <div><Label>Max Bookings per Slot</Label><Input type="number" defaultValue="3" /></div>
                  <div><Label>Advance Booking Days</Label><Input type="number" defaultValue="30" /></div>
                  <div><Label>Cancellation Policy</Label><Select defaultValue="24"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">No restriction</SelectItem><SelectItem value="2">2 hours before</SelectItem><SelectItem value="24">24 hours before</SelectItem><SelectItem value="48">48 hours before</SelectItem></SelectContent></Select></div>
                  <div><Label>Payment Gateway</Label><Select defaultValue="razorpay"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="razorpay">Razorpay</SelectItem><SelectItem value="phonepe">PhonePe</SelectItem><SelectItem value="paytm">Paytm</SelectItem></SelectContent></Select></div>
                </div>
              </div>
              <Button onClick={() => toast.success("Settings saved")}>Save Booking Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsOnlineBooking;
