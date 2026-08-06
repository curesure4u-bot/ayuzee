import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  BarChart3, IndianRupee, Pill, FlaskConical, Users, CalendarClock,
  Building2, Heart, CreditCard, Warehouse, Clock, FileText,
  Brain, Sparkles, Download, Star, Search, Filter, TrendingUp,
  Printer, Table, Eye, Layers, Send, Lightbulb
} from "lucide-react";
import MisCollection from "./MisCollection";
import MisAccountsReports from "./MisAccountsReports";
import MisStocks from "./MisStocks";
import MisTestOrders from "./MisTestOrders";
import MisOperational from "./MisOperational";
import MisAdvancedFilters from "./MisAdvancedFilters";
import MisAIInterpretation from "./MisAIInterpretation";
import MisOrgReporting from "./MisOrgReporting";

const sections = [
  { value: "collection", label: "Collection", icon: IndianRupee },
  { value: "accounts", label: "Accounts", icon: BarChart3 },
  { value: "stocks", label: "Stocks", icon: Pill },
  { value: "test-orders", label: "Test Orders", icon: FlaskConical },
  { value: "operational", label: "Operations & More", icon: Building2 },
  { value: "filters", label: "Filters & Export", icon: Layers },
  { value: "ai-interpret", label: "AI Interpretation", icon: Lightbulb },
  { value: "org-reporting", label: "Org & Scheduling", icon: Send },
];

const HmsMIS = () => {
  const [activeSection, setActiveSection] = useState("collection");
  const [location, setLocation] = useState("all");
  const [period, setPeriod] = useState("today");
  const [dateFrom, setDateFrom] = useState("2026-07-22");
  const [dateTo, setDateTo] = useState("2026-07-22");
  const [timeFrom, setTimeFrom] = useState("00:00");
  const [timeTo, setTimeTo] = useState("23:59");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            MIS - Real-Time Reports
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered Management Information System</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <Brain className="mr-1 h-3 w-3" /> AI Analytics Active
        </Badge>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="kadayanallur">#11, Main Road, Kadayanallur</SelectItem>
                <SelectItem value="rajapalayam">195, Lakshmi Puram, Rajapalayam</SelectItem>
                <SelectItem value="theni">43, Miranda Lane, Theni</SelectItem>
                <SelectItem value="chennai">4, Keelkattalai, Chennai</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[135px] h-9" />
              <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="w-[90px] h-9" />
            </div>
            <span className="text-xs text-muted-foreground">to</span>
            <div className="flex items-center gap-1">
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[135px] h-9" />
              <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="w-[90px] h-9" />
            </div>
            <Button size="sm" variant="link" className="text-primary text-xs">Show All</Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">AI Summary: </span>
              Today's collection ₹60,700 (+18% vs avg). OPD visits 32 (above target). 3 overdue settlements need attention. 
              Stock reorder alert for 5 items. Lab TAT avg: 1.8hrs (within SLA).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex w-max">
            {sections.map((s) => (
              <TabsTrigger key={s.value} value={s.value} className="text-xs whitespace-nowrap">
                <s.icon className="mr-1 h-3.5 w-3.5" />
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="collection"><MisCollection /></TabsContent>
        <TabsContent value="accounts"><MisAccountsReports /></TabsContent>
        <TabsContent value="stocks"><MisStocks /></TabsContent>
        <TabsContent value="test-orders"><MisTestOrders /></TabsContent>
        <TabsContent value="operational"><MisOperational /></TabsContent>
        <TabsContent value="filters"><MisAdvancedFilters /></TabsContent>
        <TabsContent value="ai-interpret"><MisAIInterpretation /></TabsContent>
        <TabsContent value="org-reporting"><MisOrgReporting /></TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsMIS;
