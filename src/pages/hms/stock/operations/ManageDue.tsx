import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

const ManageDue = () => {
  const [view, setView] = useState<"due" | "revert">("due");
  const [location, setLocation] = useState("loc1");

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={view === "due" ? "default" : "outline"} onClick={() => setView("due")}
          className={view === "due" ? "bg-orange-600 hover:bg-orange-700" : "text-orange-600 border-orange-300"}>
          Manage Due
        </Button>
        <Button size="sm" variant={view === "revert" ? "default" : "outline"} onClick={() => setView("revert")}
          className={view === "revert" ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-300"}>
          Manage Due - Revert
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">
          {view === "due" ? "Manage Due" : "Manage Due - Revert"}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 max-w-lg">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
                <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
                <SelectItem value="loc3">Old GH Road, Theni</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-orange-600 hover:bg-orange-700">Go</Button>
            {view === "due" && (
              <Button variant="ghost" size="sm" className="text-teal-600">
                <Info className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageDue;
