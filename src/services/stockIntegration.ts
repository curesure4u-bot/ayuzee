// ============================================================
// Stock Integration Service
// Connects Stock module with Billing, Patient & Prescription
// ============================================================

import type {
  StockSaleBill,
  SaleProduct,
  ProductBatchStock,
  PrescriptionForDispensing,
  WardMedicineRequest,
  StockProduct,
} from "@/types/stock-hms";

/**
 * Stock Integration Service
 * Provides cross-module operations between Stock and other HMS modules
 */

// ─── Prescription → Dispensing Integration ──────────────────

/**
 * Converts a doctor's prescription into a sale bill for dispensing
 * Used when pharmacy staff clicks "Bill" on ManagePrescription page
 */
export function prescriptionToSaleBill(
  prescription: PrescriptionForDispensing,
  locationId: string,
  storeId: string,
  batchSelections: Record<string, ProductBatchStock>
): Partial<StockSaleBill> {
  const products: SaleProduct[] = prescription.medicines
    .filter((m) => !m.isBilled && m.productId)
    .map((med, idx) => {
      const batch = batchSelections[med.productId!];
      return {
        id: `${Date.now()}-${idx}`,
        sNo: idx + 1,
        productId: med.productId!,
        productName: med.productName,
        manufacturerName: "",
        batch: batch?.batch ?? "",
        expiryDate: batch?.expiryDate ?? "",
        qty: med.qty,
        mrp: batch?.mrp ?? 0,
        gstPercent: batch?.taxPercent ?? 0,
        discPercent: 0,
        total: med.qty * (batch?.mrp ?? 0),
      };
    });

  const subTotal = products.reduce((sum, p) => sum + p.total, 0);
  const taxTotal = products.reduce((sum, p) => sum + (p.total * p.gstPercent / 100), 0);

  return {
    billType: "OP",
    patientId: prescription.patientId,
    patientName: prescription.patientName,
    consultantName: prescription.consultantName,
    prescriptionId: prescription.id,
    locationId,
    storeId,
    products,
    taxTotal,
    subTotal,
    discountPercent: 0,
    discountAmount: 0,
    additionalCharge: 0,
    amountReceivable: subTotal + taxTotal,
    amountReceived: 0,
    due: subTotal + taxTotal,
    paymentMode: "Single",
    paymentType: "Cash",
    status: "Pending",
  };
}

// ─── Stock Deduction on Sale ────────────────────────────────

/**
 * Calculates stock deductions when a sale bill is confirmed
 * Returns array of batch updates to apply
 */
export function calculateStockDeductions(
  saleBill: StockSaleBill
): { productId: string; batch: string; storeId: string; deductQty: number }[] {
  return saleBill.products.map((product) => ({
    productId: product.productId,
    batch: product.batch,
    storeId: saleBill.storeId,
    deductQty: product.qty,
  }));
}

/**
 * Calculates stock additions when a sale return is processed
 * Returns array of batch updates to add back
 */
export function calculateStockAdditions(
  returnProducts: SaleProduct[],
  storeId: string
): { productId: string; batch: string; storeId: string; addQty: number }[] {
  return returnProducts.map((product) => ({
    productId: product.productId,
    batch: product.batch,
    storeId,
    addQty: product.qty,
  }));
}

// ─── Ward Request → Issue Integration ───────────────────────

/**
 * Converts a ward medicine request into an Issue for fulfillment
 * Used when ward staff submits medicine request for admitted patient
 */
export function wardRequestToIssue(
  request: WardMedicineRequest,
  storeId: string
) {
  return {
    locationId: request.locationId,
    storeId,
    issueTo: "Patient" as const,
    recipientName: request.patientName,
    products: request.products.map((p, idx) => ({
      id: `ward-${Date.now()}-${idx}`,
      sNo: idx + 1,
      productId: p.productId,
      productName: p.productName,
      manufacturerName: "",
      batch: "",
      expiryDate: "",
      qty: p.qty,
      mrp: 0,
      gstPercent: 0,
      total: 0,
    })),
    issueNotes: `Ward Request - Room ${request.roomNo} - ${request.consultantName}`,
  };
}

// ─── Billing Integration ────────────────────────────────────

/**
 * Creates pharmacy bill entry for the billing module
 * Called after a sale bill is saved
 */
export function createPharmacyBillEntry(saleBill: StockSaleBill) {
  return {
    billNo: saleBill.billNo,
    billType: "Pharmacy" as const,
    patientId: saleBill.patientId,
    patientName: saleBill.patientName,
    consultantName: saleBill.consultantName,
    amount: saleBill.amountReceivable,
    paid: saleBill.amountReceived,
    balance: saleBill.due,
    paymentMode: saleBill.paymentType,
    billDate: saleBill.billDate,
    status: saleBill.due > 0 ? "Partial" : "Paid",
    items: saleBill.products.map((p) => ({
      particulars: p.productName,
      qty: p.qty,
      price: p.mrp,
      gstPercent: p.gstPercent,
      discPercent: p.discPercent,
      total: p.total,
    })),
  };
}

// ─── Low Stock Alerts for Prescription ──────────────────────

/**
 * Checks if prescribed medicines have sufficient stock
 * Returns medicines that are out of stock or low
 */
export function checkPrescriptionStock(
  prescribedMedicines: { productId: string; productName: string; qty: number }[],
  availableStock: ProductBatchStock[]
): { productName: string; required: number; available: number; status: "OK" | "Low" | "Out" }[] {
  return prescribedMedicines.map((med) => {
    const totalAvailable = availableStock
      .filter((s) => s.productId === med.productId)
      .reduce((sum, s) => sum + s.qty, 0);

    return {
      productName: med.productName,
      required: med.qty,
      available: totalAvailable,
      status: totalAvailable === 0 ? "Out" : totalAvailable < med.qty ? "Low" : "OK",
    };
  });
}

// ─── Reorder Alert Integration ──────────────────────────────

/**
 * Generates auto-purchase-order suggestions based on reorder levels
 * Links to Purchase Order creation
 */
export function generateReorderSuggestions(
  products: StockProduct[],
  currentStock: Record<string, number>
): { productId: string; productName: string; currentStock: number; reorderLevel: number; suggestedQty: number }[] {
  return products
    .filter((p) => {
      const stock = currentStock[p.id] ?? 0;
      return stock <= p.reorderLevel && p.status === "Active";
    })
    .map((p) => ({
      productId: p.id,
      productName: p.name,
      currentStock: currentStock[p.id] ?? 0,
      reorderLevel: p.reorderLevel,
      suggestedQty: Math.max(p.reorderLevel * 2 - (currentStock[p.id] ?? 0), p.reorderLevel),
    }));
}

// ─── Discharge Summary Medication Link ──────────────────────

/**
 * Extracts discharge medications that need to be dispensed from pharmacy
 * Links discharge summary medications to stock sale
 */
export function dischargeMedsToSale(
  patientId: string,
  patientName: string,
  dischargeMeds: { name: string; dosage: string; duration: string; qty: number }[],
  locationId: string,
  storeId: string
): Partial<StockSaleBill> {
  return {
    billType: "IP",
    patientId,
    patientName,
    locationId,
    storeId,
    products: dischargeMeds.map((med, idx) => ({
      id: `dc-${Date.now()}-${idx}`,
      sNo: idx + 1,
      productId: "",
      productName: med.name,
      batch: "",
      expiryDate: "",
      qty: med.qty,
      mrp: 0,
      gstPercent: 0,
      discPercent: 0,
      total: 0,
    })),
    taxTotal: 0,
    subTotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    additionalCharge: 0,
    amountReceivable: 0,
    amountReceived: 0,
    due: 0,
    paymentMode: "Single",
    paymentType: "Cash",
    status: "Pending",
  };
}

// ─── GRN → Accounts Payable Integration ─────────────────────

/**
 * Creates supplier due entry when GRN is confirmed
 * Links stock receiving to accounts payable
 */
export function grnToSupplierDue(
  grnId: string,
  supplierId: string,
  supplierName: string,
  invoiceNo: string,
  invoiceDate: string,
  invoiceAmount: number,
  locationId: string
) {
  return {
    locationId,
    supplierId,
    supplierName,
    invoiceNo,
    invoiceDate,
    invoiceAmount,
    paidAmount: 0,
    dueAmount: invoiceAmount,
    dueDate: invoiceDate, // Can be calculated based on supplier credit days
    status: "Pending" as const,
    grnId,
  };
}
