import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, Target, ShoppingCart, Shield, UserCog, Wallet, Users,
  Truck, TrendingUp, Trophy, Bell, Brain, Globe, Zap
} from "lucide-react";
import AccountsDashboard from "./AccountsDashboard";
import TargetVsAchieved from "./TargetVsAchieved";
import SalesAnalytics from "./SalesAnalytics";
import Reconciliation from "./Reconciliation";
import CashierRole from "./CashierRole";
import ExpenseManager from "./ExpenseManager";
import StaffCredits from "./StaffCredits";
import SupplierFranchise from "./SupplierFranchise";
import CashFlowManager from "./CashFlowManager";
import IncentiveGamification from "./IncentiveGamification";
import FollowUpManager from "./FollowUpManager";
import BankStatementAI from "./BankStatementAI";
import CrmAccounts from "./CrmAccounts";
import AccountsPoints from "./AccountsPoints";

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "targets", label: "Target vs Achieved", icon: Target },
  { value: "sales", label: "Sales & QR", icon: ShoppingCart },
  { value: "bank-ai", label: "Bank Statement AI", icon: Brain },
  { value: "reconciliation", label: "Reconciliation", icon: Shield },
  { value: "cashier", label: "Cashier Role", icon: UserCog },
  { value: "expenses", label: "Expenses", icon: Wallet },
  { value: "staff-credits", label: "Staff Credits", icon: Users },
  { value: "supplier", label: "Supplier & Franchise", icon: Truck },
  { value: "cashflow", label: "Cash Flow", icon: TrendingUp },
  { value: "crm", label: "CRM & API", icon: Globe },
  { value: "incentives", label: "Incentives & Points", icon: Trophy },
  { value: "accounts-points", label: "Afoofa Points", icon: Zap },
  { value: "followups", label: "Follow-ups", icon: Bell },
];

const HmsAccounts = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max gap-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs whitespace-nowrap">
                <tab.icon className="mr-1 h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard"><AccountsDashboard /></TabsContent>
        <TabsContent value="targets"><TargetVsAchieved /></TabsContent>
        <TabsContent value="sales"><SalesAnalytics /></TabsContent>
        <TabsContent value="bank-ai"><BankStatementAI /></TabsContent>
        <TabsContent value="reconciliation"><Reconciliation /></TabsContent>
        <TabsContent value="cashier"><CashierRole /></TabsContent>
        <TabsContent value="expenses"><ExpenseManager /></TabsContent>
        <TabsContent value="staff-credits"><StaffCredits /></TabsContent>
        <TabsContent value="supplier"><SupplierFranchise /></TabsContent>
        <TabsContent value="cashflow"><CashFlowManager /></TabsContent>
        <TabsContent value="crm"><CrmAccounts /></TabsContent>
        <TabsContent value="incentives"><IncentiveGamification /></TabsContent>
        <TabsContent value="accounts-points"><AccountsPoints /></TabsContent>
        <TabsContent value="followups"><FollowUpManager /></TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsAccounts;
