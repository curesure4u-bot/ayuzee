// ============================================================
// Stock/Inventory HMS Module - Comprehensive Type Definitions
// Based on DocDoc HMS Stock Module Reference
// Integrated with AI-Powered AYUSH Hospital Management System
// ============================================================

// ─── Master Data Types ──────────────────────────────────────

export interface StockManufacturer {
  id: string;
  code: number;
  name: string;
  status: "Active" | "Inactive";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNo?: string;
  drugLicenseNo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockMarketedBy {
  id: string;
  code: number;
  name: string;
  status: "Active" | "Inactive";
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockCategory {
  id: string;
  code: number;
  name: string;
  status: "Active" | "Inactive";
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockSubCategory {
  id: string;
  code: number;
  name: string;
  categoryId?: string;
  categoryName?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}

export interface PharmacologicalName {
  id: string;
  code: number;
  name: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}

export interface StockIndication {
  id: string;
  code: number;
  name: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}

export interface StockFrame {
  id: string;
  code: number;
  name: string;
  brand?: string;
  frameType?: "Full Frame" | "Half Frame" | "Rimless" | "Semi-Rimless";
  material?: string;
  color?: string;
  size?: string;
  purchasePrice?: number;
  mrp?: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}

export interface StockLens {
  id: string;
  code: number;
  name: string;
  lensType?: "Single Vision" | "Bifocal" | "Progressive" | "Contact" | "Toric";
  material?: string;
  coating?: string;
  power?: string;
  purchasePrice?: number;
  mrp?: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}

// ─── Product Types ──────────────────────────────────────────

export type ProductType = "Tablet" | "Capsule" | "Syrup" | "Injection" | "Cream" | "Ointment" | "Drops" | "Powder" | "Churnam" | "Kashayam" | "Thailam" | "Ghritam" | "Guggulu" | "Lepa" | "Bhasma" | "Vati" | "Arka" | "Asava" | "Arishta" | "Lehyam" | "Soap" | "Oil" | "Strip" | "Bottle" | "Tube" | "Sachet" | "Kit" | "Linen" | "Lab" | "Frame" | "Lens" | "Other";

export type ScheduleCode = "H" | "H1" | "G" | "X" | "Schedule-H" | "Schedule-H1" | "Schedule-G" | "Schedule-X" | "OTC" | "Ayurveda" | "Homeo" | "Unani" | "Siddha" | "";

export type RiskLevel = "High" | "Medium" | "Low" | "";

export type ProductStatus = "Active" | "Inactive" | "Discontinued";

export interface StockProduct {
  id: string;
  pCode: string; // Product Code (auto-generated)
  hsn: string; // HSN/SAC code for GST
  name: string;
  shortCode?: string;
  genericName?: string;
  composition?: string; // Active ingredients/composition
  manufacturerId?: string;
  manufacturerName?: string;
  marketedById?: string;
  marketedByName?: string;
  type: ProductType;
  scheduleCode: ScheduleCode;
  pharmacologicalNameId?: string;
  pharmacologicalName?: string;
  vgd?: string; // V.G.D classification
  strength?: string;
  strengthUnit?: string; // mg, ml, g, etc.
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  reorderLevel: number;
  indicationId?: string;
  indicationName?: string;
  purchaseUnit: string; // Box, Strip, Bottle, etc.
  purchasePrice: number;
  mrp: number;
  marginPercent: number;
  temperature?: string; // Storage temperature
  uom?: string; // Unit of Measurement
  packUnit?: number; // No. of units in a pack
  tax: number; // GST percentage
  riskLevel: RiskLevel;
  status: ProductStatus;
  allowSaleRatio?: number; // Max sale discount %
  isMrpMandatory?: boolean;
  buyFromQuotation?: boolean;
  barcode?: string;
  // Prescription Params (default when prescribed)
  prescriptionParams?: {
    type?: ProductType;
    dosage?: string;
    duration?: string;
    route?: string;
    unit?: string;
    instruction?: "Before Food" | "After Food" | "N/A";
    frequency?: string; // "1-0-1" (Morn-Noon-Eve-Night)
  };
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Supplier Types ─────────────────────────────────────────

export interface StockSupplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstNo?: string;
  drugLicenseNo?: string;
  panNo?: string;
  bankName?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  creditDays?: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

// ─── Location & Store Types ─────────────────────────────────

export interface StockLocation {
  id: string;
  name: string; // e.g., "#11, Main Road, Kadayanallur"
  address?: string;
  city?: string;
  state?: string;
  status: "Active" | "Inactive";
}

export interface StockStore {
  id: string;
  name: string; // e.g., "ALSHIFA PHARMACY", "IP Pharmacy Store"
  locationId: string;
  locationName?: string;
  type: "Pharmacy" | "IP Store" | "OT Store" | "Panchakarma Store" | "Main Store" | "Branch Store";
  status: "Active" | "Inactive";
}

// ─── Purchase Module Types ──────────────────────────────────

// Quotation
export interface QuotationProduct {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  purchaseUnit: string;
  rate: number; // Purchase Price
  taxPercent: number;
  taxValue: number;
  discPercent: number;
  mrp: number;
  total: number;
}

export interface StockQuotation {
  id: string;
  quotationNo: string;
  supplierId: string;
  supplierName: string;
  quotationDate: string;
  quotationValidity?: string;
  products: QuotationProduct[];
  additionalNote?: string;
  totalAmount: number;
  status: "Active" | "Inactive" | "Converted";
  createdBy?: string;
  createdAt: string;
}

// Purchase Order
export interface PurchaseOrderProduct {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  purchaseUnit: string;
  rate: number;
  taxPercent: number;
  discPercent: number;
  mrp: number;
  total: number;
  receivedQty?: number;
}

export interface StockPurchaseOrder {
  id: string;
  poNo: number;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  orderDate: string;
  deliveryDate: string;
  products: PurchaseOrderProduct[];
  totalAmount: number;
  status: "Ordered" | "Partially Received" | "Received" | "Cancelled";
  orderedBy: string;
  createdAt: string;
}

// GRN (Goods Received Note)
export interface GRNProduct {
  id: string;
  productId: string;
  productName: string;
  batch: string;
  expiryDate: string;
  qty: number;
  freeQty?: number;
  purchaseUnit: string;
  rate: number;
  taxPercent: number;
  discPercent: number;
  mrp: number;
  total: number;
}

export interface StockGRN {
  id: string;
  grnNo: number;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  supplierId: string;
  supplierName: string;
  poId?: string; // Linked PO (optional)
  receivedDate: string;
  invoiceDate: string;
  invoiceNo: string;
  invoiceAmount: number;
  products: GRNProduct[];
  totalAmount: number;
  status: "Draft" | "Confirmed" | "Cancelled";
  createdBy: string;
  createdAt: string;
}

// Goods Returned Note
export interface GoodsReturnProduct {
  id: string;
  productId: string;
  productName: string;
  batch: string;
  expiryDate: string;
  returnQty: number;
  rate: number;
  mrp: number;
  taxPercent: number;
  total: number;
  reason?: string;
}

export interface StockGoodsReturn {
  id: string;
  returnNo: number;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  supplierId: string;
  supplierName: string;
  grnId?: string; // Linked GRN
  invoiceDate: string;
  invoiceAmount: number;
  products: GoodsReturnProduct[];
  totalAmount: number;
  status: "Draft" | "Confirmed" | "Cancelled";
  createdBy: string;
  createdAt: string;
}

// ─── Sale Module Types ──────────────────────────────────────

export interface SaleProduct {
  id: string;
  sNo: number;
  productId: string;
  productName: string;
  manufacturerName?: string;
  batch: string;
  expiryDate: string;
  qty: number;
  mrp: number;
  gstPercent: number;
  discPercent: number;
  total: number;
}

export type SaleBillType = "OP" | "IP" | "Counter" | "Emergency";
export type SalePaymentType = "Cash" | "Card" | "UPI" | "Credit" | "Insurance" | "Multiple";

export interface StockSaleBill {
  id: string;
  billNo: string;
  billType: SaleBillType;
  patientId?: string;
  patientName?: string;
  patientMobile?: string;
  patientAge?: number;
  patientGender?: string;
  opNo?: string; // OP # reference
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  consultantId?: string;
  consultantName?: string;
  prescriptionId?: string;
  packageId?: string;
  products: SaleProduct[];
  taxTotal: number;
  subTotal: number;
  discountPercent: number;
  discountAmount: number;
  additionalCharge: number;
  amountReceivable: number;
  amountReceived: number;
  due: number;
  cashTendered?: number;
  balance?: number;
  paymentMode: "Single" | "Multiple";
  paymentType: SalePaymentType;
  additionalNote?: string;
  reviewDays?: number;
  reviewUnit?: "Days" | "Weeks" | "Months";
  billDate: string;
  status: "Billed" | "Partially Billed" | "Pending" | "Cancelled" | "Returned";
  createdBy: string;
  createdAt: string;
}

// Sale Return
export interface SaleReturnProduct {
  id: string;
  productId: string;
  productName: string;
  manufacturerName?: string;
  batch: string;
  expiryDate: string;
  qty: number;
  mrp: number;
  gstPercent: number;
  discPercent: number;
  total: number;
}

export interface StockSaleReturn {
  id: string;
  returnNo: string;
  billType: SaleBillType;
  patientId?: string;
  patientName?: string;
  opNo?: string;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  consultantId?: string;
  consultantName?: string;
  products: SaleReturnProduct[];
  previousBalance: number;
  totalAmount: number;
  amountReturnable: number;
  amountReturned: number;
  paymentType: SalePaymentType;
  additionalNote?: string;
  returnDate: string;
  status: "Completed" | "Cancelled";
  createdBy: string;
  createdAt: string;
}

// ─── Indent Module Types ────────────────────────────────────

export interface IndentProduct {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  requestedQty: number;
  approvedQty?: number;
  issuedQty?: number;
  unit: string;
}

export interface StockIndent {
  id: string;
  indentNo: number;
  locationId: string;
  locationName?: string;
  fromStoreId: string;
  fromStoreName?: string;
  toStoreId: string;
  toStoreName?: string;
  products: IndentProduct[];
  orderDate: string;
  requestedBy: string;
  requestedTo: string;
  status: "Ordered" | "Approved" | "Partially Issued" | "Issued" | "Cancelled";
  orderedBy: string;
  createdAt: string;
}

// GDN (Goods Delivery Note) - for inter-store transfer
export interface GDNProduct {
  id: string;
  productId: string;
  productName: string;
  batch: string;
  expiryDate: string;
  qty: number;
  mrp: number;
}

export interface StockGDN {
  id: string;
  gdnNo: number;
  locationId: string;
  locationName?: string;
  fromStoreId: string;
  fromStoreName?: string;
  toStoreId: string;
  toStoreName?: string;
  products: GDNProduct[];
  dispatchDate: string;
  indentId?: string; // Linked Indent
  status: "Dispatched" | "Received" | "Cancelled";
  createdBy: string;
  createdAt: string;
}

// Return Indent
export interface ReturnIndentProduct {
  id: string;
  productId: string;
  productName: string;
  pharmacologicalName?: string;
  manufacturerName?: string;
  categoryName?: string;
  batch: string;
  expiryDate: string;
  purchasePrice: number;
  mrp: number;
  currentStock: number;
  returnQty: number;
  qtyPerUnit: number;
}

export interface StockReturnIndent {
  id: string;
  returnIndentNo: number;
  locationId: string;
  locationName?: string;
  fromStoreId: string;
  fromStoreName?: string;
  toStoreId: string;
  toStoreName?: string;
  products: ReturnIndentProduct[];
  returnDate: string;
  returnTime?: string;
  additionalNote?: string;
  status: "Ordered" | "Approved" | "Returned" | "Cancelled";
  returnedBy: string;
  createdAt: string;
}

// Issue (to Patient/Consultant/Users/Others)
export type IssueToType = "Patient" | "Consultant" | "Users" | "Others";

export interface IssueProduct {
  id: string;
  sNo: number;
  productId: string;
  productName: string;
  manufacturerName?: string;
  batch: string;
  expiryDate: string;
  qty: number;
  mrp: number;
  gstPercent: number;
  total: number;
}

export interface StockIssue {
  id: string;
  billNo: string;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  issueTo: IssueToType;
  recipientName: string;
  serviceName?: string; // Department/Service
  packageId?: string;
  products: IssueProduct[];
  grandTotal: number;
  issueNotes?: string;
  issueDate: string;
  status: "Issued" | "Cancelled";
  createdBy: string;
  createdAt: string;
}

// ─── Stock Adjustment Types ─────────────────────────────────

export type AdjustmentReason = "Damage" | "Expired" | "Theft" | "Counting Error" | "Sample" | "Breakage" | "Other";

export interface StockAdjustment {
  id: string;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  productId: string;
  productName: string;
  batch: string;
  expiryDate: string;
  currentStock: number;
  adjustedQty: number; // +/- quantity
  purchaseUnit: string;
  rate: number;
  mrp: number;
  maxSalesDisc?: number;
  taxPercent: number;
  reason: AdjustmentReason;
  reasonNote?: string;
  adjustedBy: string;
  adjustedAt: string;
}

// ─── Product Flow Analysis ──────────────────────────────────

export interface ProductFlowRecord {
  id: string;
  productId: string;
  productName: string;
  batch: string;
  openingStock: number;
  purchased: number;
  sold: number;
  returned: number;
  adjusted: number;
  transferred: number;
  closingStock: number;
  month: string; // "07/2026"
  locationId: string;
}

// ─── Expense Types ──────────────────────────────────────────

export type ExpenseType = "Salary - Consultants" | "Salary - Staff" | "Rent" | "Electricity" | "Maintenance" | "Transport" | "Office Supplies" | "Marketing" | "Insurance" | "Others";

export interface StockExpense {
  id: string;
  locationId: string;
  locationName?: string;
  type: ExpenseType;
  consultantName?: string;
  amount: number;
  tdsPercent: number;
  tdsAmount: number;
  totalExpense: number;
  date: string;
  time?: string;
  comments?: string;
  isAgainstPettyCash: boolean;
  paymentType: "Cash" | "Card" | "UPI" | "Bank Transfer" | "Cheque";
  attachments?: string[];
  createdBy: string;
  createdAt: string;
}

export interface StockPettyCash {
  id: string;
  locationId: string;
  locationName?: string;
  type: ExpenseType;
  userId: string;
  userName?: string;
  totalExpense: number;
  date: string;
  time?: string;
  comments?: string;
  paymentType: "Cash" | "Card" | "UPI" | "Bank Transfer";
  attachments?: string[];
  createdBy: string;
  createdAt: string;
}

// ─── Manage Due Types ───────────────────────────────────────

export interface StockDue {
  id: string;
  locationId: string;
  locationName?: string;
  supplierId: string;
  supplierName: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: "Pending" | "Partially Paid" | "Paid" | "Reverted";
  createdAt: string;
}

// ─── Generate Invoice Types ─────────────────────────────────

export interface PharmacyInvoice {
  id: string;
  invoiceNo: string;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  patientId?: string;
  patientName?: string;
  products: SaleProduct[];
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  grandTotal: number;
  invoiceDate: string;
  status: "Generated" | "Sent" | "Paid";
  createdBy: string;
  createdAt: string;
}

// ─── Credit Types ───────────────────────────────────────────

export interface SupplierCredit {
  id: string;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  supplierId: string;
  supplierName: string;
  totalCredit: number;
  totalPaid: number;
  balance: number;
  transactions: CreditTransaction[];
}

export interface PatientCredit {
  id: string;
  locationId: string;
  locationName?: string;
  storeId: string;
  storeName?: string;
  patientId: string;
  patientName: string;
  providerId?: string;
  providerName?: string;
  totalCredit: number;
  totalPaid: number;
  balance: number;
  startDate: string;
  endDate: string;
  transactions: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: "Credit" | "Payment";
  referenceNo?: string;
  notes?: string;
}

// ─── Cancel Operations Types ────────────────────────────────

export type CancelType = "Sale Bill" | "Return Bill" | "Purchase Order" | "Goods Received Note" | "Goods Returned Note" | "Issue";

export interface StockCancellation {
  id: string;
  cancelType: CancelType;
  referenceId: string;
  referenceNo: string;
  locationId: string;
  locationName?: string;
  storeId?: string;
  storeName?: string;
  originalDate: string;
  cancelDate: string;
  cancelReason?: string;
  cancelledBy: string;
  status: "Cancelled";
}

// ─── Ward Request Types (linked from IPD) ───────────────────

export interface WardMedicineRequest {
  id: string;
  requestDate: string;
  patientId: string;
  patientName: string;
  roomNo: string;
  consultantName: string;
  requestedBy: string;
  locationId: string;
  locationName?: string;
  products: {
    productId: string;
    productName: string;
    qty: number;
    unit: string;
  }[];
  billStatus: "Pending" | "Billed" | "Partially Billed" | "Cancelled";
  createdAt: string;
}

// ─── Prescription Integration Types ─────────────────────────

export interface PrescriptionForDispensing {
  id: string;
  prescriptionDate: string;
  patientId: string;
  patientName: string;
  consultantName: string;
  locationId: string;
  medicines: {
    productId?: string;
    productName: string;
    dosage: string;
    frequency: string;
    duration: string;
    qty: number;
    isBilled: boolean;
  }[];
  billStatus: "Pending" | "Billed" | "Partially Billed";
}

// ─── Dashboard/Analytics Types ──────────────────────────────

export interface StockDashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: number;
  expiringItems: number;
  todaySales: number;
  todaySalesAmount: number;
  todayPurchases: number;
  todayPurchaseAmount: number;
  pendingPOs: number;
  pendingDues: number;
  pendingDueAmount: number;
  fastMovingItems: { productName: string; soldQty: number }[];
  slowMovingItems: { productName: string; soldQty: number }[];
  nearExpiryItems: { productName: string; batch: string; expiryDate: string; stock: number }[];
}

// ─── Batch/Stock Tracking ───────────────────────────────────

export interface ProductBatchStock {
  id: string;
  productId: string;
  productName: string;
  storeId: string;
  storeName: string;
  batch: string;
  expiryDate: string;
  qty: number;
  purchasePrice: number;
  mrp: number;
  maxSalesDisc?: number;
  taxPercent: number;
}
