import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MessageSquare, Bell, Calendar, Send, Phone, CheckCircle, Clock, MessageCircle } from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

const activeReminders = [
  { id: 1, type: "", addedFrom: "OP Prescription", date: "18/09/2025", time: "Evening(06:00 PM)" },
  { id: 2, type: "Review", addedFrom: "Sale Bill", date: "26/12/2025", time: "Evening(06:00 PM)" },
  { id: 3, type: "", addedFrom: "OP Prescription", date: "09/02/2026", time: "Evening(06:00 PM)" },
  { id: 4, type: "Review", addedFrom: "Sale Bill", date: "30/06/2026", time: "Evening(06:00 PM)" },
  { id: 5, type: "Review", addedFrom: "Sale Bill", date: "27/07/2026", time: "Evening(06:00 PM)" },
  { id: 6, type: "Review", addedFrom: "Sale Bill", date: "05/08/2026", time: "Evening(06:00 PM)" },
];

const PatientMessages = () => {
  const [tab, setTab] = useState("reminder");
  const [reminderLocation, setReminderLocation] = useState("#11, Main Road, Kadayanallur, .");
  const [reminderType, setReminderType] = useState("Review");
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().slice(0, 10));
  const [reminderTime, setReminderTime] = useState("Morning(06:00 AM)");
  const [birthdayWish, setBirthdayWish] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div><strong>Name:</strong> {patientHeader.name}</div>
            <div><strong>ID:</strong> {patientHeader.id}</div>
            <div><strong>Age:</strong> {patientHeader.age}</div>
            <div><strong>Gender:</strong> {patientHeader.gender}</div>
            <div><strong>Mobile:</strong> {patientHeader.mobile}</div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="history"><MessageCircle className="h-3 w-3 mr-1" /> History</TabsTrigger>
          <TabsTrigger value="send"><Send className="h-3 w-3 mr-1" /> Send Message</TabsTrigger>
          <TabsTrigger value="reminder"><Bell className="h-3 w-3 mr-1" /> Reminders</TabsTrigger>
          <TabsTrigger value="viewall"><Calendar className="h-3 w-3 mr-1" /> All Reminders</TabsTrigger>
          <TabsTrigger value="birthday"><MessageSquare className="h-3 w-3 mr-1" /> Birthday</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Communication History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "2026-08-07 09:15", channel: "WhatsApp", direction: "out", content: "Good morning! Your appointment with Dr. Saleem is today at 10:30 AM. Please arrive 15 min early.", status: "delivered" },
                  { date: "2026-08-05 18:00", channel: "WhatsApp", direction: "out", content: "Reminder: Please take your evening medicine — Rasnasaptakam 15ml with warm water.", status: "read" },
                  { date: "2026-08-03 10:30", channel: "WhatsApp", direction: "in", content: "Thank you doctor. My pain has reduced. Can I stop the oil application?", status: "received" },
                  { date: "2026-08-03 11:00", channel: "WhatsApp", direction: "out", content: "Please continue Kottamchukkadi Taila for 15 more days. It helps with long-term relief. See you on follow-up.", status: "read" },
                  { date: "2026-07-27 18:00", channel: "SMS", direction: "out", content: "Your medicine refill is due. Please visit or order online. Ref: RX-4521", status: "sent" },
                  { date: "2026-07-20 09:00", channel: "WhatsApp", direction: "out", content: "Your lab results are ready. ESR: 42 (slightly elevated). Doctor will discuss at next visit.", status: "read" },
                  { date: "2026-07-17 16:00", channel: "WhatsApp", direction: "out", content: "Discharge summary sent. Follow-up on 05/08/2026. Diet chart attached.", status: "delivered" },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-3 rounded-lg ${msg.direction === "out" ? "bg-green-50 border border-green-200" : "bg-muted border"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{msg.date}</span>
                        <Badge variant="outline" className="text-[9px]">{msg.channel}</Badge>
                        {msg.direction === "out" && (
                          <span className="text-[10px]">
                            {msg.status === "read" ? <CheckCircle className="h-3 w-3 text-blue-500 inline" /> : msg.status === "delivered" ? <CheckCircle className="h-3 w-3 text-green-500 inline" /> : <Clock className="h-3 w-3 text-muted-foreground inline" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Send Message to Patient</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Channel</Label>
                  <Select defaultValue="whatsapp">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Template (optional)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Custom message" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Message</SelectItem>
                      <SelectItem value="appointment">Appointment Reminder</SelectItem>
                      <SelectItem value="medicine">Medicine Reminder</SelectItem>
                      <SelectItem value="followup">Follow-up Reminder</SelectItem>
                      <SelectItem value="lab_result">Lab Result Available</SelectItem>
                      <SelectItem value="diet_chart">Diet Chart</SelectItem>
                      <SelectItem value="feedback">Feedback Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea rows={4} placeholder="Type your message here..." />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => toast.success("Message sent via WhatsApp")}><Send className="h-4 w-4 mr-1" /> Send</Button>
                <Button variant="outline" onClick={() => toast.info("Schedule message for later")}><Clock className="h-4 w-4 mr-1" /> Schedule</Button>
                <Button variant="outline" onClick={() => toast.info("Calling patient...")}><Phone className="h-4 w-4 mr-1" /> Call</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="birthday" className="mt-4">
          <Card><CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Set Birthday Wish</div>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4"><p className="text-red-600 text-sm">* (mandatory fields)</p></div>
            <div className="flex items-center gap-3">
              <strong className="text-sm">Set Birthday Wish? :</strong>
              <input type="checkbox" checked={birthdayWish} onChange={(e) => setBirthdayWish(e.target.checked)} />
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 mt-4" onClick={() => toast.success("Birthday wish settings saved")}>Save</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="reminder" className="mt-4">
          <Card><CardContent className="p-6">
            <div className="text-center text-teal-600 font-semibold text-lg mb-4">Reminder</div>
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4"><p className="text-red-600 text-sm">* (mandatory fields)</p></div>
            <h3 className="font-semibold mb-3">Set Reminder</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="font-semibold">Location <span className="text-red-500">*</span> :</Label><Select value={reminderLocation} onValueChange={setReminderLocation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="#11, Main Road, Kadayanallur, .">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent></Select></div>
              <div><Label className="font-semibold">Type <span className="text-red-500">*</span> :</Label><Select value={reminderType} onValueChange={setReminderType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Review">Review</SelectItem><SelectItem value="Follow-up">Follow-up</SelectItem><SelectItem value="Medicine Refill">Medicine Refill</SelectItem><SelectItem value="Lab Test">Lab Test</SelectItem></SelectContent></Select></div>
              <div><Label className="font-semibold">Date <span className="text-red-500">*</span> :</Label><Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} /><p className="text-xs text-muted-foreground">Date of the Reminder</p></div>
              <div><Label className="font-semibold">Time <span className="text-red-500">*</span> :</Label><Select value={reminderTime} onValueChange={setReminderTime}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Morning(06:00 AM)">Morning(06:00 AM)</SelectItem><SelectItem value="Afternoon(12:00 PM)">Afternoon(12:00 PM)</SelectItem><SelectItem value="Evening(06:00 PM)">Evening(06:00 PM)</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Time frame for the reminder</p></div>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 mt-4" onClick={() => toast.success("Reminder set successfully")}>Set</Button>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="viewall" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="text-center text-teal-600 font-semibold text-lg p-4">View All</div>
            <div className="px-4 pb-2"><Badge variant="destructive" className="text-xs">Note: This shows the list active reminders</Badge></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left text-orange-600">#</th><th className="px-3 py-2 text-left text-orange-600">Type</th><th className="px-3 py-2 text-left text-orange-600">Added From</th><th className="px-3 py-2 text-left text-orange-600">Date</th><th className="px-3 py-2 text-left text-orange-600">Time</th><th className="px-3 py-2 text-left text-orange-600">Remove</th></tr></thead>
                <tbody>
                  {activeReminders.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{r.id}</td><td className="px-3 py-2">{r.type}</td><td className="px-3 py-2">{r.addedFrom}</td><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{r.time}</td><td className="px-3 py-2"><Button size="sm" variant="ghost" className="h-5 text-xs text-red-600" onClick={() => toast.success("Reminder removed")}>×</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientMessages;
