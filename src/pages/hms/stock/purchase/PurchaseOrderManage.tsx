import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const mockPOs = [
  { sNo: 1, store: "ALSHIFA PHARMACY", poNo: 1, orderDate: "20/12/2019", deliveryDate: "20/12/2019", supplier: "AVM HOMOEO AGENCIES\n9994143187", total: 0.00, status: "Ordered", orderedBy: "MANIKANDAN" },
  { sNo: 2, store: "ALSHIFA PHARMACY", poNo: 2, orderDate: "20/12/2019", deliveryDate: "20/12/2019", supplier: "AVM HOMOEO AGENCIES\n9994143187", total: 0.00, status: "Ordered", orderedBy: "MANIKANDAN" },
  { sNo: 3, store: "IP Pharmacy Store", poNo: 1, orderDate: "09/12/2019", deliveryDate: "09/12/2019", supplier: "RICH HERBALS\n7538883888", total: 0.00, status: "Ordered", orderedBy: "Al Shifa Ayush Hospital" },
  { sNo: 4, store: "IP Pharmacy Store", poNo: 2, orderDate: "14/08/2020", deliveryDate: "14/08/2020", supplier: "RAJAH HEALTHY ACRES P LTD\n044-26202188", total: 0.00, status: "Ordered", orderedBy: "ARUNKUMAR" },
  { sNo: 5, store: "IP Pharmacy Store", poNo: 2, orderDate: "01/05/2021", deliveryDate: "01/05/2021", supplier: "skm siddha and ayrvedha\n0", total: 0.00, status: "Ordered", orderedBy: "SHAKEELA" },
  { sNo: 6, store: "IP Pharmacy Store", poNo: 2, orderDate: "19/04/2022", deliveryDate: "19/04/2022", supplier: "SIDDHASRAMAM SIVANANANDA\n04282-235127", total: 0.00, status: "Ordered", orderedBy: "ALSHIFA STORE ROOM" },
  { sNo: 7, store: "IP Pharmacy Store", poNo: 2, orderDate: "11/12/2019", deliveryDate: "11/12/2019", supplier: "skm siddha and ayrvedha\n0", total: 0.00, status: "Ordered", orderedBy: "ARUNKUMAR" },
  { sNo: 8, store: "IP Pharmacy Store", poNo: 3, orderDate: "11/12/2019", deliveryDate: "11/12/2019", supplier: "THE ARYA VAIDYA PHARMACY\n0422-4280171,99439920", total: 0.00, status: "Ordered", orderedBy: "ARUNKUMAR" },
];

const PurchaseOrderManage = () => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("loc1");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/purchase/po/new">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">New</Button>
        </Link>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Manage PO</Button>
        <Link to="/hms/stock/purchase/po/find">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Find Product PO</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage PO</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[220px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
          </SelectContent>
        </Select>
        <Select value={storeFilter} onValueChange={setStoreFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Show All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All</SelectItem>
            <SelectItem value="alshifa">ALSHIFA PHARMACY</SelectItem>
            <SelectItem value="ip">IP Pharmacy Store</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Show All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Show All Status</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="h-8 text-xs w-[130px]" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" className="h-8 text-xs w-[130px]" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-8">Go</Button>
      </div>

      {/* Entries & Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <select className="border rounded px-2 py-1 text-sm"><option>100</option></select>
          <span>entries</span>
        </div>
        <div className="relative w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search:" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">PO No</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Order Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Delivery Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Supplier</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Total</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-orange-600">Ordered By</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {mockPOs.map((po) => (
                  <tr key={`${po.sNo}-${po.store}`} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{po.sNo}.</td>
                    <td className="px-3 py-2">{po.store}</td>
                    <td className="px-3 py-2">{po.poNo}</td>
                    <td className="px-3 py-2">{po.orderDate}</td>
                    <td className="px-3 py-2">{po.deliveryDate}</td>
                    <td className="px-3 py-2 max-w-[200px]">{po.supplier.split("\n")[0]}<br/><span className="text-muted-foreground">{po.supplier.split("\n")[1]}</span></td>
                    <td className="px-3 py-2">{po.total.toFixed(2)}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{po.status}</Badge></td>
                    <td className="px-3 py-2">{po.orderedBy}</td>
                    <td className="px-3 py-2"><Button variant="ghost" size="sm" className="h-6 text-xs">...</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderManage;
