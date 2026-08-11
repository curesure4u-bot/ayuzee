import { useState } from "react";
import { Clock, Play, Plus, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SLARule {
  id: string;
  name: string;
  condition: string;
  action: string;
  trigger_after_hours: number;
  active: boolean;
  last_triggered: string;
}

const initialRules: SLARule[] = [
  {
    id: "1",
    name: "Doctor sign-off overdue",
    condition: "If doctor doesn't sign-off within 24hrs",
    action: "Auto-approve + notify admin",
    trigger_after_hours: 24,
    active: true,
    last_triggered: "Aug 10, 2026 at 14:30",
  },
  {
    id: "2",
    name: "Support ticket response",
    condition: "If urgent ticket not responded in 4hrs",
    action: "Escalate to super admin",
    trigger_after_hours: 4,
    active: true,
    last_triggered: "Aug 11, 2026 at 09:15",
  },
  {
    id: "3",
    name: "Support ticket resolution",
    condition: "If ticket not resolved in 48hrs",
    action: "Alert super admin",
    trigger_after_hours: 48,
    active: true,
    last_triggered: "Aug 9, 2026 at 18:00",
  },
  {
    id: "4",
    name: "Therapist no-show",
    condition: "If therapist doesn't check-in within 30min of scheduled",
    action: "Auto-cancel + notify doctor",
    trigger_after_hours: 0.5,
    active: true,
    last_triggered: "Aug 11, 2026 at 10:00",
  },
  {
    id: "5",
    name: "Payout delay",
    condition: "If approved payout not processed in 3 days",
    action: "Alert finance admin",
    trigger_after_hours: 72,
    active: false,
    last_triggered: "Aug 8, 2026 at 12:00",
  },
];

export default function AdminSLAEscalation() {
  const [rules, setRules] = useState<SLARule[]>(initialRules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    condition: "",
    action: "",
    trigger_after_hours: 0,
  });

  const activeCount = rules.filter((r) => r.active).length;

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    toast.success("Rule status updated");
  };

  const runCheck = (name: string) => {
    toast.success(`SLA check initiated for "${name}"`);
  };

  const addRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.action) {
      toast.error("Please fill all fields");
      return;
    }
    const rule: SLARule = {
      id: Date.now().toString(),
      name: newRule.name,
      condition: newRule.condition,
      action: newRule.action,
      trigger_after_hours: newRule.trigger_after_hours,
      active: true,
      last_triggered: "Never",
    };
    setRules((prev) => [...prev, rule]);
    setNewRule({ name: "", condition: "", action: "", trigger_after_hours: 0 });
    setDialogOpen(false);
    toast.success("Rule added successfully");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            SLA & Escalation Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            Define response time expectations and auto-escalation triggers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add SLA Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Rule Name</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) =>
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                  placeholder="e.g. Doctor sign-off overdue"
                />
              </div>
              <div>
                <Label>Condition</Label>
                <Textarea
                  value={newRule.condition}
                  onChange={(e) =>
                    setNewRule({ ...newRule, condition: e.target.value })
                  }
                  placeholder="Describe when this rule triggers..."
                />
              </div>
              <div>
                <Label>Action</Label>
                <Textarea
                  value={newRule.action}
                  onChange={(e) =>
                    setNewRule({ ...newRule, action: e.target.value })
                  }
                  placeholder="What happens when triggered..."
                />
              </div>
              <div>
                <Label>Trigger After (hours)</Label>
                <Input
                  type="number"
                  value={newRule.trigger_after_hours}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      trigger_after_hours: Number(e.target.value),
                    })
                  }
                  min={0}
                  step={0.5}
                />
              </div>
              <Button onClick={addRule} className="w-full">
                Add Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Rules</p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Escalations Today</p>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Condition:</span>{" "}
                    {rule.condition}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Action:</span> {rule.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trigger after: {rule.trigger_after_hours}h | Last triggered:{" "}
                    {rule.last_triggered}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.active}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runCheck(rule.name)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run Check Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
