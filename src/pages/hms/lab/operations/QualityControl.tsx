import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const QualityControl = () => (
  <div className="space-y-4">
    <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Quality Control</h2></div>
    <div className="grid sm:grid-cols-3 gap-4">
      <Card><CardContent className="p-4 text-center"><CheckCircle2 className="h-6 w-6 mx-auto text-green-600" /><p className="text-2xl font-bold mt-2 text-green-600">98.5%</p><p className="text-xs text-muted-foreground">Internal QC Pass Rate</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 mx-auto text-amber-600" /><p className="text-2xl font-bold mt-2 text-amber-600">2</p><p className="text-xs text-muted-foreground">Pending QC Runs</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><Badge className="bg-green-600">EQAS</Badge><p className="text-2xl font-bold mt-2">Active</p><p className="text-xs text-muted-foreground">External QA Program</p></CardContent></Card>
    </div>
    <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Quality Control module allows managing IQC runs, Levy-Jennings charts, and EQAS participation. Configure QC parameters per test.</CardContent></Card>
  </div>
);

export default QualityControl;
