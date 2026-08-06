import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Camera, XCircle } from "lucide-react";

const ManageExpense = () => {
  const [view, setView] = useState<"new" | "manage">("new");
  const [expenseType, setExpenseType] = useState<"expense" | "pettycash">("expense");
  const [location, setLocation] = useState("loc1");
  const [type, setType] = useState("Salary - Consultants");
  const [consultantName, setConsultantName] = useState("");
  const [userName, setUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [tdsPercent, setTdsPercent] = useState("0");
  const [tdsAmount, setTdsAmount] = useState("0");
  const [total, setTotal] = useState("");
  const [date, setDate] = useState("2026-07-21");
  const [time, setTime] = useState("22:53");
  const [comments, setComments] = useState("");
  const [isPettyCash, setIsPettyCash] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");

  // Manage view state
  const [manageStartDate, setManageStartDate] = useState("2026-07-21");
  const [manageEndDate, setManageEndDate] = useState("2026-07-21");

  const handleSave = () => {
    if (!amount) { toast.error("Amount is required"); return; }
    toast.success(`${expenseType === "expense" ? "Expense" : "PettyCash"} added successfully`);
  };

  if (view === "manage") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setView("new")} className="text-orange-600 border-orange-300">New</Button>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage</Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={expenseType === "expense" ? "default" : "outline"} onClick={() => setExpenseType("expense")}>Expense Pharmacy</Button>
          <Button size="sm" variant={expenseType === "pettycash" ? "default" : "outline"} onClick={() => setExpenseType("pettycash")}>PettyCash Pharmacy</Button>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-orange-600">
            Manage {expenseType === "expense" ? "Expense" : "PettyCash"}-Pharmacy
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[250px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
          </Select>
          <Input type="date" className="h-8 text-xs w-[130px]" value={manageStartDate} onChange={(e) => setManageStartDate(e.target.value)} />
          <Input type="date" className="h-8 text-xs w-[130px]" value={manageEndDate} onChange={(e) => setManageEndDate(e.target.value)} />
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8">Go</Button>
        </div>
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No expenses found for the selected period.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Button size="sm" variant="outline" onClick={() => setView("manage")} className="text-orange-600 border-orange-300">Manage</Button>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={expenseType === "expense" ? "default" : "outline"} onClick={() => setExpenseType("expense")}>Expense Pharmacy</Button>
        <Button size="sm" variant={expenseType === "pettycash" ? "default" : "outline"} onClick={() => setExpenseType("pettycash")}>PettyCash Pharmacy</Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">
          {expenseType === "expense" ? "Expense - Pharmacy" : "PettyCash - Pharmacy"}
        </h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold text-red-600">Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Choose the entity location for expense</span>
            </div>
            <div>
              <Label className="text-sm font-semibold text-red-600">Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary - Consultants">Salary - Consultants</SelectItem>
                  <SelectItem value="Salary - Staff">Salary - Staff</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Electricity">Electricity</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Expense type</span>
            </div>
            <div>
              {expenseType === "expense" ? (
                <>
                  <Label className="text-sm font-semibold">Consultant Name</Label>
                  <Input placeholder="Consultant Name" value={consultantName} onChange={(e) => setConsultantName(e.target.value)} />
                  <span className="text-xs text-muted-foreground">Provide the consultant's name</span>
                </>
              ) : (
                <>
                  <Label className="text-sm font-semibold text-red-600">User *</Label>
                  <Select value={userName} onValueChange={setUserName}>
                    <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                    <SelectContent><SelectItem value="user1">Admin User</SelectItem></SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          {/* Row 2 - Amount, TDS */}
          {expenseType === "expense" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold text-red-600">Amount *</Label>
                <Input placeholder="Expense before TDS" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <span className="text-xs text-muted-foreground">Amount before TDS</span>
              </div>
              <div>
                <Label className="text-sm font-semibold">TDS (%)</Label>
                <Input value={tdsPercent} onChange={(e) => setTdsPercent(e.target.value)} />
                <span className="text-xs text-muted-foreground">TDS Percentage</span>
              </div>
              <div>
                <Label className="text-sm font-semibold text-red-600">TDS *</Label>
                <Input value={tdsAmount} onChange={(e) => setTdsAmount(e.target.value)} />
                <span className="text-xs text-muted-foreground">TDS Amount</span>
              </div>
            </div>
          )}

          {/* Row 3 - Total, Date, Comments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold text-red-600">Total *</Label>
              <Input placeholder={expenseType === "expense" ? "Total Expense" : "Expense before TDS"} value={total} onChange={(e) => setTotal(e.target.value)} />
              <span className="text-xs text-muted-foreground">Total Expense</span>
            </div>
            <div>
              <Label className="text-sm font-semibold text-red-600">Date *</Label>
              <div className="flex gap-1">
                <span className="text-xs self-center">Date</span>
                <Input type="date" className="flex-1" value={date} onChange={(e) => setDate(e.target.value)} />
                <span className="text-xs self-center">Time</span>
                <Input type="time" className="w-24" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <span className="text-xs text-muted-foreground">Date of the expense</span>
            </div>
            <div>
              <Label className="text-sm font-semibold">Comments</Label>
              <Textarea placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} rows={2} />
              <span className="text-xs text-muted-foreground">Provide notes about the expense</span>
            </div>
          </div>

          {/* PettyCash checkbox (only for expense) */}
          {expenseType === "expense" && (
            <div>
              <Label className="text-sm font-semibold">Expense Against PettyCash</Label>
              <div className="flex items-center gap-2 mt-1">
                <Checkbox checked={isPettyCash} onCheckedChange={(v) => setIsPettyCash(v as boolean)} />
                <span className="text-sm">-</span>
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <Label className="text-sm font-semibold">Added Docs</Label>
            <div className="flex gap-2 mt-1">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs"><Plus className="mr-1 h-3 w-3" /> Add Doc</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs"><Camera className="mr-1 h-3 w-3" /> Take a Photo</Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-300 text-xs"><XCircle className="mr-1 h-3 w-3" /> Cancel upload</Button>
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <Label className="text-sm font-semibold text-red-600">Payment Type * :</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-center pt-2">
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 px-8">Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageExpense;
