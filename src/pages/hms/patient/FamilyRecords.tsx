import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Heart, CreditCard, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const familyMembers = [
  { id: 1, name: "Mr. Rajesh Kumar", relation: "Self (Head)", age: 42, gender: "Male", uhid: "AYZ-2024-001285", conditions: ["Kati Shoola", "Vata Vyadhi"], isActive: true },
  { id: 2, name: "Mrs. Lakshmi Kumar", relation: "Spouse", age: 38, gender: "Female", uhid: "AYZ-2024-001286", conditions: ["PCOS", "Hypothyroid"] },
  { id: 3, name: "Arjun Kumar", relation: "Son", age: 16, gender: "Male", uhid: "AYZ-2024-001287", conditions: ["Allergic Rhinitis"] },
  { id: 4, name: "Priya Kumar", relation: "Daughter", age: 12, gender: "Female", uhid: "AYZ-2024-001288", conditions: [] },
  { id: 5, name: "Mr. Mohan Kumar", relation: "Father", age: 68, gender: "Male", uhid: "AYZ-2024-001289", conditions: ["Diabetes Type 2", "Sandhivata (OA Knee)"] },
  { id: 6, name: "Mrs. Saraswati Kumar", relation: "Mother", age: 64, gender: "Female", uhid: "AYZ-2024-001290", conditions: ["Hypertension", "Amavata (RA)"] },
];

const hereditaryConditions = [
  { condition: "Diabetes Mellitus Type 2", affectedMembers: ["Father (Mr. Mohan Kumar)"], risk: "high" },
  { condition: "Hypertension", affectedMembers: ["Mother (Mrs. Saraswati Kumar)"], risk: "medium" },
  { condition: "Rheumatoid Arthritis", affectedMembers: ["Mother (Mrs. Saraswati Kumar)"], risk: "medium" },
  { condition: "Allergic Rhinitis", affectedMembers: ["Son (Arjun Kumar)"], risk: "low" },
];

const billingAccount = {
  totalSpent: "₹1,24,500",
  pendingDues: "₹8,200",
  lastPayment: "2024-12-22",
  insuranceLinked: "Star Health Family Floater – ₹5,00,000",
};

export default function FamilyRecords() {
  const handleAddMember = () => {
    toast.success("Add family member dialog opened");
  };

  const handleSwitchPatient = (name: string) => {
    toast.info(`Switched to ${name}'s records`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Family Records</h1>
          <p className="text-muted-foreground">Kumar Family • Primary: Mr. Rajesh Kumar</p>
        </div>
        <Button size="sm" onClick={handleAddMember}><Plus className="h-4 w-4 mr-1" /> Link Member</Button>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Family Members</TabsTrigger>
          <TabsTrigger value="hereditary">Hereditary History</TabsTrigger>
          <TabsTrigger value="billing">Family Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map((member) => (
              <Card key={member.id} className={member.isActive ? "border-primary ring-1 ring-primary/20" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{member.relation} • {member.age}y • {member.gender}</p>
                    </div>
                    {member.isActive && <Badge className="text-xs">Active</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">UHID: {member.uhid}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {member.conditions.length > 0 ? member.conditions.map((c, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                    )) : (
                      <span className="text-xs text-muted-foreground">No active conditions</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => handleSwitchPatient(member.name)}>
                    <ArrowRight className="h-3 w-3 mr-1" /> View Records
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hereditary">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4" /> Hereditary Conditions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hereditaryConditions.map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.condition}</p>
                      <p className="text-xs text-muted-foreground mt-1">Affected: {item.affectedMembers.join(", ")}</p>
                    </div>
                    <Badge variant={item.risk === "high" ? "destructive" : item.risk === "medium" ? "default" : "secondary"}>
                      {item.risk} risk
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Family Billing Account</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-bold">{billingAccount.totalSpent}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Pending Dues</p>
                  <p className="text-lg font-bold text-red-600">{billingAccount.pendingDues}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Last Payment</p>
                  <p className="text-lg font-bold">{billingAccount.lastPayment}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Insurance</p>
                  <p className="text-sm font-medium">{billingAccount.insuranceLinked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
