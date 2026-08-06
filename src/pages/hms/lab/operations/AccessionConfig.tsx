import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Barcode } from "lucide-react";

const AccessionConfig = () => {
  const [enableLocationId, setEnableLocationId] = useState(true);
  const [locationDigits, setLocationDigits] = useState("3");
  const [enableContainerId, setEnableContainerId] = useState(true);
  const [addCurrentYear, setAddCurrentYear] = useState(true);
  const [addDepartment, setAddDepartment] = useState(false);

  // Preview values
  const year = "26";
  const locationCode = "001";
  const containerCode = "02";
  const sampleId = "00000024";

  const barcodeNumber = `${addCurrentYear ? year : ""}${enableLocationId ? locationCode : ""}${enableContainerId ? containerCode : ""}${addDepartment ? "" : ""}${sampleId}`;

  const handleUpdate = () => {
    toast.success("Accession configuration updated successfully");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Accession</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuration Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={enableLocationId}
                  onCheckedChange={(v) => setEnableLocationId(v as boolean)}
                  id="locId"
                />
                <Label htmlFor="locId" className="font-medium">Enable Location Based ID</Label>
                <Select value={locationDigits} onValueChange={setLocationDigits}>
                  <SelectTrigger className="w-[60px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={enableContainerId}
                  onCheckedChange={(v) => setEnableContainerId(v as boolean)}
                  id="containerId"
                />
                <Label htmlFor="containerId" className="font-medium">Enable Container ID</Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={addCurrentYear}
                  onCheckedChange={(v) => setAddCurrentYear(v as boolean)}
                  id="currentYear"
                />
                <Label htmlFor="currentYear" className="font-medium">Add Current Year</Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  checked={addDepartment}
                  onCheckedChange={(v) => setAddDepartment(v as boolean)}
                  id="addDept"
                />
                <Label htmlFor="addDept" className="font-medium">Add Department</Label>
              </div>

              <Button onClick={handleUpdate} className="bg-red-600 hover:bg-red-700 mt-4">Update</Button>
            </div>

            {/* Barcode Preview */}
            <div className="space-y-4">
              {/* Structure Table */}
              <div className="overflow-x-auto">
                <table className="text-sm border">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border px-3 py-2 text-blue-700">Year</th>
                      <th className="border px-3 py-2 text-blue-700">Location ID</th>
                      <th className="border px-3 py-2 text-blue-700">Container ID</th>
                      <th className="border px-3 py-2 text-blue-700">Department</th>
                      <th className="border px-3 py-2 text-blue-700">Sample ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-3 py-2 text-center font-bold">{addCurrentYear ? year : "—"}</td>
                      <td className="border px-3 py-2 text-center font-bold">{enableLocationId ? locationCode : "—"}</td>
                      <td className="border px-3 py-2 text-center font-bold">{enableContainerId ? containerCode : "—"}</td>
                      <td className="border px-3 py-2 text-center font-bold">{addDepartment ? "LAB" : ""}</td>
                      <td className="border px-3 py-2 text-center font-bold">{sampleId}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Barcode Visual */}
              <div className="text-center border rounded-lg p-6 bg-white">
                <p className="text-sm font-medium mb-2">Michael Joe(HMI-123)</p>
                <div className="flex justify-center my-3">
                  <Barcode className="h-16 w-48 text-black" />
                </div>
                <p className="font-mono text-lg font-bold">{barcodeNumber}</p>
                <p className="text-sm text-muted-foreground mt-1">CBC</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessionConfig;
