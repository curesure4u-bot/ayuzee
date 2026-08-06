import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, Package, Factory, ShoppingCart, Truck, ArrowRightLeft,
  ClipboardList, FileText, BarChart3, CreditCard, XCircle, Warehouse,
  Receipt, IndianRupee, Pill, Eye, Glasses,
} from "lucide-react";

interface MenuGroup {
  label: string;
  icon: any;
  items: { label: string; to: string; badge?: string }[];
}

const stockMenuGroups: MenuGroup[] = [
  {
    label: "Master",
    icon: Factory,
    items: [
      { label: "Manufacturer", to: "/hms/stock/master/manufacturer" },
      { label: "Marketed By", to: "/hms/stock/master/marketed-by" },
      { label: "Category", to: "/hms/stock/master/category" },
      { label: "Sub Category", to: "/hms/stock/master/sub-category" },
      { label: "Pharmacological Name", to: "/hms/stock/master/pharmacological-name" },
      { label: "Indication", to: "/hms/stock/master/indication" },
      { label: "Frames", to: "/hms/stock/master/frames" },
      { label: "Lens", to: "/hms/stock/master/lens" },
    ],
  },
  {
    label: "Purchase",
    icon: Truck,
    items: [
      { label: "Quotation", to: "/hms/stock/purchase/quotation" },
      { label: "Purchase Order", to: "/hms/stock/purchase/po" },
      { label: "Goods Received Note", to: "/hms/stock/purchase/grn" },
      { label: "Goods Returned Note", to: "/hms/stock/purchase/goods-return" },
    ],
  },
  {
    label: "Sale",
    icon: ShoppingCart,
    items: [
      { label: "Direct/Prescription", to: "/hms/stock/sale/new" },
      { label: "Sale Return", to: "/hms/stock/sale/return" },
    ],
  },
  {
    label: "Indent",
    icon: ClipboardList,
    items: [
      { label: "Indent", to: "/hms/stock/indent/new" },
      { label: "Return Indent", to: "/hms/stock/indent/return" },
    ],
  },
  {
    label: "Generate Invoice",
    icon: Receipt,
    items: [
      { label: "Pharmacy Invoice", to: "/hms/stock/invoice/pharmacy" },
    ],
  },
  {
    label: "Credit",
    icon: CreditCard,
    items: [
      { label: "Supplier", to: "/hms/stock/credit/supplier" },
      { label: "Patient", to: "/hms/stock/credit/patient" },
    ],
  },
  {
    label: "Cancel",
    icon: XCircle,
    items: [
      { label: "Sale Bill", to: "/hms/stock/cancel/sale-bill" },
      { label: "Return Bill", to: "/hms/stock/cancel/return-bill" },
      { label: "Purchase Order", to: "/hms/stock/cancel/purchase-order" },
      { label: "Goods Received Note", to: "/hms/stock/cancel/grn" },
      { label: "Goods Returned Note", to: "/hms/stock/cancel/goods-return" },
      { label: "Issue", to: "/hms/stock/cancel/issue" },
    ],
  },
];

const singleItems = [
  { label: "Product", icon: Package, to: "/hms/stock/product" },
  { label: "Stock Adjustment", icon: ArrowRightLeft, to: "/hms/stock/adjustment" },
  { label: "Product Flow Analysis", icon: BarChart3, to: "/hms/stock/product-flow" },
  { label: "Manage Expense", icon: IndianRupee, to: "/hms/stock/expense" },
  { label: "Manage Due", icon: FileText, to: "/hms/stock/due" },
  { label: "Issue", icon: Warehouse, to: "/hms/stock/issue" },
  { label: "AI Reorder", icon: Package, to: "/hms/stock/ai/reorder" },
  { label: "AI Expiry", icon: Package, to: "/hms/stock/ai/expiry" },
  { label: "QR Tools", icon: Package, to: "/hms/stock/ai/qr-tools" },
];

const HmsStockLayout = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="space-y-0">
      {/* Stock Module Top Navigation Bar - DocDoc style */}
      <div className="bg-white border-b border-orange-200 shadow-sm -mx-6 -mt-6 px-6 mb-6">
        {/* Primary Nav Row */}
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          <NavLink
            to="/hms/stock"
            end
            className={({ isActive: active }) =>
              `px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap ${
                active ? "bg-orange-600 text-white" : "text-gray-700 hover:bg-orange-50"
              }`
            }
          >
            Dashboard
          </NavLink>

          {/* Dropdown Menus */}
          {stockMenuGroups.map((group) => (
            <div key={group.label} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                onMouseEnter={() => setOpenMenu(group.label)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap flex items-center gap-1 ${
                  group.items.some((item) => isActive(item.to))
                    ? "bg-orange-600 text-white"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                {group.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              {openMenu === group.label && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px] py-1"
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpenMenu(null)}
                      className={`block px-4 py-2 text-sm transition ${
                        isActive(item.to)
                          ? "bg-orange-50 text-orange-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 text-xs">{item.badge}</Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Single Items */}
          {singleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive: active }) =>
                `px-3 py-1.5 rounded text-sm font-medium transition whitespace-nowrap ${
                  active ? "bg-orange-600 text-white" : "text-gray-700 hover:bg-orange-50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <Outlet />
    </div>
  );
};

export default HmsStockLayout;
