import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, ShoppingCart, Truck, ArrowRightLeft, AlertTriangle,
  IndianRupee, BarChart3, FileText, Factory, Pill, TrendingUp,
  TrendingDown, Calendar, Warehouse, CreditCard, Receipt,
  ClipboardList, ArrowDownToLine, ArrowUpFromLine, RotateCcw,
} from "lucide-react";
import type { StockDashboardStats } from "@/types/stock-hms";
import AIStockInsights from "./ai/AIStockInsights";
import AIVoiceCommands from "./ai/AIVoiceCommands";

const mockStats: StockDashboardStats = {
  totalProducts: 1245,
  totalStockValue: 2856000,
  lowStockItems: 23,
  expiringItems: 15,
  todaySales: 47,
  todaySalesAmount: 34500,
  todayPurchases: 3,
  todayPurchaseAmount: 125000,
  pendingPOs: 8,
  pendingDues: 12,
  pendingDueAmount: 450000,
  fastMovingItems: [
    { productName: "Dasamoolarishtam", soldQty: 120 },
    { productName: "Kottakkal Dhanwantharam Tailam", soldQty: 95 },
    { productName: "Simhanada Guggulu", soldQty: 88 },
    { productName: "Rasnasaptakam Kashayam", soldQty: 75 },
    { productName: "Chyawanprash", soldQty: 70 },
  ],
  slowMovingItems: [
    { productName: "Arogyavardhini Vati", soldQty: 2 },
    { productName: "Mahasudarshan Churna", soldQty: 3 },
    { productName: "Sarpagandha Tablet", soldQty: 4 },
  ],
  nearExpiryItems: [
    { productName: "Ayuzee Amruthotharam Kashayam", batch: "AYZ-2026-034", expiryDate: "2026-09-19", stock: 5 },
    { productName: "Yogaraja Guggulu", batch: "B2026-110", expiryDate: "2026-10-30", stock: 3 },
    { productName: "Ksheerabala 101 Avarti", batch: "B2026-055", expiryDate: "2026-08-14", stock: 18 },
  ],
};

const quickActions = [
  { label: "New Sale", icon: ShoppingCart, to: "/hms/stock/sale/new", color: "bg-green-100 text-green-700" },
  { label: "New Purchase Order", icon: Truck, to: "/hms/stock/purchase/po/new", color: "bg-blue-100 text-blue-700" },
  { label: "GRN Entry", icon: ArrowDownToLine, to: "/hms/stock/purchase/grn/new", color: "bg-purple-100 text-purple-700" },
  { label: "Add Product", icon: Package, to: "/hms/stock/product/new", color: "bg-orange-100 text-orange-700" },
  { label: "Stock Adjustment", icon: ArrowRightLeft, to: "/hms/stock/adjustment", color: "bg-slate-100 text-slate-700" },
  { label: "New Indent", icon: ClipboardList, to: "/hms/stock/indent/new", color: "bg-teal-100 text-teal-700" },
  { label: "Issue Stock", icon: ArrowUpFromLine, to: "/hms/stock/issue/new", color: "bg-amber-100 text-amber-700" },
  { label: "Sale Return", icon: RotateCcw, to: "/hms/stock/sale/return/new", color: "bg-red-100 text-red-700" },
];

const StockDashboard = () => {
  const [stats] = useState<StockDashboardStats>(mockStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-orange-600" /> Stock & Pharmacy Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete inventory, purchase, sale, indent & store management
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-2xl font-bold mt-1">{stats.totalProducts.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-3 text-center">
            <IndianRupee className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-lg font-bold mt-1 text-green-600">₹{(stats.totalStockValue / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">Stock Value</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-red-600" />
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.lowStockItems}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-3 text-center">
            <Calendar className="h-5 w-5 mx-auto text-amber-600" />
            <p className="text-2xl font-bold mt-1 text-amber-600">{stats.expiringItems}</p>
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-3 text-center">
            <CreditCard className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-lg font-bold mt-1 text-purple-600">₹{(stats.pendingDueAmount / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">Pending Dues</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-green-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Today Sales</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.todaySales}</p>
            <p className="text-xs text-green-600">₹{stats.todaySalesAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Today Purchases</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.todayPurchases}</p>
            <p className="text-xs text-blue-600">₹{stats.todayPurchaseAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-muted-foreground">Pending POs</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.pendingPOs}</p>
            <p className="text-xs text-orange-600">Awaiting delivery</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Pending Dues</span>
            </div>
            <p className="text-xl font-bold mt-1">{stats.pendingDues}</p>
            <p className="text-xs text-red-600">Suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to}>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Intelligence Panel + Voice Commands */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIStockInsights />
        </div>
        <div>
          <AIVoiceCommands />
        </div>
      </div>

      {/* Bottom Grid - Fast/Slow Moving & Expiry */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Fast Moving */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" /> Fast Moving Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {stats.fastMovingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[160px]">{item.productName}</span>
                  <Badge variant="outline" className="text-green-600 text-xs">{item.soldQty} sold</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Slow Moving */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600" /> Slow Moving Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {stats.slowMovingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[160px]">{item.productName}</span>
                  <Badge variant="outline" className="text-amber-600 text-xs">{item.soldQty} sold</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Near Expiry */}
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" /> Near Expiry (90 days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {stats.nearExpiryItems.map((item, idx) => (
                <div key={idx} className="text-sm">
                  <div className="flex justify-between">
                    <span className="truncate max-w-[140px] font-medium">{item.productName}</span>
                    <span className="text-xs text-red-600">{item.stock} left</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Batch: {item.batch} | Exp: {item.expiryDate}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StockDashboard;
