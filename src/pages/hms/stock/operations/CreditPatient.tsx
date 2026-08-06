import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CreditPatient = () => {
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("all");
  const [provider, setProvider] = useState("");
  const [patient, setPatient] = useState("");
  const [startDate, setStartDate] = useState("2026-07-21");
  const [endDate, setEndDate] = useState("2026-07-21");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Credit Patient</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <Label className="text-xs font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Store</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Show All" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Show All</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent><SelectItem value="dr1">Dr. Mohamad Saleem</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Patient</Label>
              <Select value={patient} onValueChange={setPatient}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Start date</Label>
              <Input type="date" className="w-[120px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold">End date</Label>
              <Input type="date" className="w-[120px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="self-end">
              <Button className="bg-orange-600 hover:bg-orange-700">Go</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditPatient;
