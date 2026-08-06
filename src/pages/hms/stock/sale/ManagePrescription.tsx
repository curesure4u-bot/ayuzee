import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const mockPrescriptions = [
  { sNo: 1, date: "21/07/2026 21:02", id: "AL-13956", name: "Mr. Mohamed Yusuf 21243", consultant: "Dr. Mohamad Saleem MD (AYURVEDA)", billStatus: "Pending" },
  { sNo: 2, date: "21/07/2026 20:44", id: "AL-14624", name: "Mujiya Fathima21652", consultant: "Dr. Mohamad Saleem MD (AYURVEDA)", billStatus: "Billed" },
  { sNo: 3, date: "21/07/2026 19:20", id: "AL-12563", name: "Mr. Mariappan19484", consultant: "Dr. Mohamad Saleem MD (AYURVEDA)", billStatus: "Billed" },
  { sNo: 4, date: "21/07/2026 19:10", id: "AL-15597", name: "Mr. Mohammed Irshad22210", consultant: "Dr. Mohamad Saleem MD (AYURVEDA)", billStatus: "Partially Billed" },
];

const ManagePrescription = () => {
  const [location, setLocation] = useState("loc1");
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Prescription</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">Go</Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span><select className="border rounded px-2 py-1 text-sm"><option>100</option></select><span>entries</span>
        </div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Patient Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Consultant</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Bill Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {mockPrescriptions.map((p) => (
                  <tr key={p.sNo} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{p.sNo}</td>
                    <td className="px-3 py-2">{p.date}</td>
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.consultant}</td>
                    <td className="px-3 py-2">
                      <Badge variant={p.billStatus === "Billed" ? "default" : p.billStatus === "Pending" ? "secondary" : "outline"}
                        className={`text-xs ${p.billStatus === "Billed" ? "bg-orange-600" : p.billStatus === "Partially Billed" ? "bg-purple-600 text-white" : ""}`}>
                        {p.billStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2"><Button variant="ghost" size="sm" className="h-6 text-xs">...</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagePrescription;
