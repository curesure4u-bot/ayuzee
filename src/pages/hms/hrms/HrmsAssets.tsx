import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Plus, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const MOCK_ASSETS = [
  { id: "a1", employeeName: "Dr. Arun Sharma", assetType: "laptop", assetName: "HP ProBook 450", assetCode: "AST-001", issuedDate: "2023-04-15", status: "issued", condition: "good" },
  { id: "a2", employeeName: "Dr. Arun Sharma", assetType: "mobile", assetName: "Samsung A54", assetCode: "AST-002", issuedDate: "2023-04-15", status: "issued", condition: "good" },
  { id: "a3", employeeName: "Kavita S", assetType: "laptop", assetName: "Dell Latitude 5520", assetCode: "AST-003", issuedDate: "2022-07-01", status: "issued", condition: "fair" },
  { id: "a4", employeeName: "Rajesh K", assetType: "id_card", assetName: "Employee ID Card", assetCode: "ID-003", issuedDate: "2024-06-05", status: "issued", condition: "new" },
  { id: "a5", employeeName: "All Therapists", assetType: "uniform", assetName: "Therapy Uniform Set", assetCode: "UNI-PK-01", issuedDate: "2026-01-10", status: "issued", condition: "good" },
  { id: "a6", employeeName: "Sunita M", assetType: "stethoscope", assetName: "Littmann Classic III", assetCode: "MED-001", issuedDate: "2023-09-05", status: "issued", condition: "good" },
  { id: "a7", employeeName: "Former Employee", assetType: "laptop", assetName: "Lenovo ThinkPad", assetCode: "AST-004", issuedDate: "2024-01-10", status: "returned", condition: "fair" },
  { id: "a8", employeeName: "Vikram R", assetType: "keys", assetName: "Pharmacy Store Keys", assetCode: "KEY-PH-01", issuedDate: "2024-03-05", status: "issued", condition: "good" },
];

const statusColors: Record<string, string> = {
  issued: "bg-blue-100 text-blue-700",
  returned: "bg-green-100 text-green-700",
  damaged: "bg-amber-100 text-amber-700",
  lost: "bg-red-100 text-red-700",
  written_off: "bg-gray-100 text-gray-600",
};

const HrmsAssets = () => {
  const issued = MOCK_ASSETS.filter((a) => a.status === "issued").length;
  const returned = MOCK_ASSETS.filter((a) => a.status === "returned").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-orange-600" /> Assets</h1>
          <p className="text-sm text-muted-foreground">Track company assets issued to employees</p>
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Issue Asset</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{MOCK_ASSETS.length}</p><p className="text-[9px] text-muted-foreground">Total Assets</p></CardContent></Card>
        <Card className="border-blue-100"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-700">{issued}</p><p className="text-[9px] text-muted-foreground">Issued</p></CardContent></Card>
        <Card className="border-green-100"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-700">{returned}</p><p className="text-[9px] text-muted-foreground">Returned</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/40"><tr>
            <th className="px-3 py-2 text-left font-medium">Employee</th>
            <th className="px-3 py-2 text-left font-medium">Asset</th>
            <th className="px-3 py-2 text-left font-medium">Code</th>
            <th className="px-3 py-2 text-center font-medium">Type</th>
            <th className="px-3 py-2 text-center font-medium">Issued</th>
            <th className="px-3 py-2 text-center font-medium">Condition</th>
            <th className="px-3 py-2 text-center font-medium">Status</th>
            <th className="px-3 py-2 text-center font-medium">Action</th>
          </tr></thead>
          <tbody>
            {MOCK_ASSETS.map((a) => (
              <tr key={a.id} className="border-b hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{a.employeeName}</td>
                <td className="px-3 py-2">{a.assetName}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{a.assetCode}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[8px] capitalize">{a.assetType.replace("_", " ")}</Badge></td>
                <td className="px-3 py-2 text-center text-[10px]">{new Date(a.issuedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                <td className="px-3 py-2 text-center capitalize text-[10px]">{a.condition}</td>
                <td className="px-3 py-2 text-center"><Badge className={`text-[8px] border-0 capitalize ${statusColors[a.status]}`}>{a.status}</Badge></td>
                <td className="px-3 py-2 text-center">
                  {a.status === "issued" && <Button size="sm" variant="ghost" className="h-5 text-[9px] text-green-600" onClick={() => toast.success("Marked returned")}>Return</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>
    </div>
  );
};

export default HrmsAssets;
