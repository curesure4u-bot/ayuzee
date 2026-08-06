import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Brain, Plus } from "lucide-react";

const patientHeader = { name: "Mr. Nagaraj 14233", id: "AL-8472", age: "65 years 1 months 16 days", gender: "M", mobile: "9443314670" };

const upcomingAppts = [
  { date: "21/07/2026", time: "15:00 - 15:05", purpose: "Consultation", doctor: "Dr. Mohamad Saleem MD (AYURVEDA)", bookedBy: "AKSHARA" },
];

const PatientAppointments = () => {
  const [tab, setTab] = useState("upcoming");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [doctor, setDoctor] = useState("");
  const [purpose, setPurpose] = useState("Consultation");

  const handleBook = () => {
    if (!apptDate || !doctor) return toast.error("Select date and doctor");
    toast.success("Appointment booked successfully");
  };

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <CardContent className="p-4">
          <div className="text-center text-teal-600 font-semibold text-lg mb-2">Appointment</div>
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
        <TabsList>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="previous" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Previous Appointments</TabsTrigger>
          <TabsTrigger value="book">Book Appt</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-4 py-3 text-left text-orange-600">Appt Date</th><th className="px-4 py-3 text-left text-orange-600">Appt Time</th><th className="px-4 py-3 text-left text-orange-600">Purpose</th><th className="px-4 py-3 text-left text-orange-600">Doctor Name</th><th className="px-4 py-3 text-left text-orange-600">Booked by</th></tr></thead>
              <tbody>{upcomingAppts.map((a, i) => (<tr key={i} className="border-b"><td className="px-4 py-3">{a.date}</td><td className="px-4 py-3">{a.time}</td><td className="px-4 py-3">{a.purpose}</td><td className="px-4 py-3">{a.doctor}</td><td className="px-4 py-3">{a.bookedBy}</td></tr>))}</tbody>
            </table></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="previous" className="mt-4">
          <Card><CardContent className="p-8 text-center text-muted-foreground">No Previous Appointments</CardContent></Card>
        </TabsContent>

        <TabsContent value="book" className="mt-4">
          <Card><CardContent className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Book New Appointment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Date <span className="text-red-500">*</span></Label><Input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} /></div>
              <div><Label>Time</Label><Input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} /></div>
              <div><Label>Doctor <span className="text-red-500">*</span></Label><Select value={doctor} onValueChange={setDoctor}><SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger><SelectContent><SelectItem value="dr-saleem">Dr. Mohamad Saleem MD (AYURVEDA)</SelectItem><SelectItem value="dr-sahana">Dr. sahana fathima B.A.M.S</SelectItem></SelectContent></Select></div>
              <div><Label>Purpose</Label><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} /></div>
            </div>
            <Button onClick={handleBook} className="bg-green-600 hover:bg-green-700"><Plus className="h-3 w-3 mr-1" /> Book Appointment</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientAppointments;
