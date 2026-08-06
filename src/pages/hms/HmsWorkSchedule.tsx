import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { CalendarClock, Plus, Users, Clock, Building2 } from "lucide-react";

type ScheduleEntry = {
  id: string; date: string; department: string; slot: string;
};

type DutyRosterEntry = {
  department: string; user: string; startTime: string; endTime: string;
};

const departments = ["pharmacy", "reception", "consultation", "Therapy", "LAB"];

const mockSchedules: ScheduleEntry[] = [
  { id: "1", date: "2026-07-22", department: "reception", slot: "09:00 - 17:00" },
  { id: "2", date: "2026-07-22", department: "pharmacy", slot: "08:00 - 20:00" },
  { id: "3", date: "2026-07-23", department: "consultation", slot: "09:00 - 13:00" },
  { id: "4", date: "2026-07-23", department: "Therapy", slot: "10:00 - 18:00" },
];

const HmsWorkSchedule = () => {
  const [activeTab, setActiveTab] = useState("roster");
  const [selectedLocation, setSelectedLocation] = useState("loc1");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sliderValue, setSliderValue] = useState([9, 17]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(mockSchedules);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roster" className="text-orange-600">New</TabsTrigger>
          <TabsTrigger value="list" className="text-red-600">List</TabsTrigger>
        </TabsList>

        {/* Duty Roster - New */}
        <TabsContent value="roster" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600 text-center">Duty Roster</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Top section */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-6">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">From</Label>
                  <Input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm font-medium">To</Label>
                  <Input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <Button className="bg-red-600 hover:bg-red-700">Generate</Button>
              </div>

              {/* Roster Settings */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-bold mb-3">Roster Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Department</Label>
                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                      <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Users</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vignesh">Vignesh</SelectItem>
                        <SelectItem value="bhavani">Bhavani</SelectItem>
                        <SelectItem value="sindhu">Sindhu</SelectItem>
                        <SelectItem value="sankari">Sankari</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Time Slider */}
                <div className="mb-4">
                  <Slider
                    min={0}
                    max={24}
                    step={1}
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">Drag the Slider to choose timing for the day.</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium border px-2 py-1 rounded">Starts</span>
                      <Input className="h-7 text-xs" value={`${sliderValue[0]}:00`} readOnly />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium border px-2 py-1 rounded">Ends</span>
                      <Input className="h-7 text-xs" value={`${sliderValue[1]}:00`} readOnly />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Specify when you start and end consulting in 24hrs format</p>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => toast.success("Schedule added")}>Add</Button>
              </div>

              {/* Scheduled Dates Table */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-bold mb-3">Scheduled Dates</h3>
                <table className="w-full text-sm">
                  <thead className="border-b"><tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Department</th>
                    <th className="px-3 py-2 text-left font-medium">Slot</th>
                  </tr></thead>
                  <tbody>
                    {schedules.length === 0 ? (
                      <tr><td colSpan={3} className="px-3 py-4 text-center text-muted-foreground text-xs">No schedules yet</td></tr>
                    ) : schedules.map(s => (
                      <tr key={s.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 text-xs">{s.date}</td>
                        <td className="px-3 py-2 text-xs">{s.department}</td>
                        <td className="px-3 py-2 text-xs">{s.slot}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Work Schedule - List */}
        <TabsContent value="list" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600 text-center">Employee Work Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <Select defaultValue="loc1">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <Input type="date" placeholder="Start Date" />
                </div>
                <Button className="bg-red-600 hover:bg-red-700">Go</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsWorkSchedule;
