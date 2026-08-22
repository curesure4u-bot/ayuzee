import { Package } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const StockPurchaseGuide = () => {
  return (
    <GuideLayout
      title="Stock & Purchase Playbook"
      subtitle="Complete procurement cycle: Quotation → PO → GRN → Goods Return, supplier management, and inter-store transfers"
      icon={Package}
      color="bg-amber-500/10 text-amber-600"
      estimatedTime="20 min"
      roles={["Purchase Manager", "Store Keeper", "Admin"]}
    >
      {/* Section 1 */}
      <h2>1. Stock Module Navigation</h2>
      <StepCard number={1} title="Access the Stock module">
        <ul>
          <li>From HMS sidebar, navigate to <strong>Stock</strong> (<code>/hms/stock</code>).</li>
          <li>The Stock module is the complete inventory management system — separate from quick Pharmacy view.</li>
          <li>Dashboard shows: Total stock value, near-expiry count, pending POs, today's GRNs.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Module areas">
        <ul>
          <li><strong>Master:</strong> Manufacturer, Marketed By, Category, Sub-Category, Pharmacological Name, Indication, Frames, Lens</li>
          <li><strong>Product:</strong> Product List, New Product, Product Builder (bulk add)</li>
          <li><strong>Purchase:</strong> Quotation → PO → GRN → Goods Return</li>
          <li><strong>Sale:</strong> New Sale, Manage, Prescription, Returns</li>
          <li><strong>Indent:</strong> Inter-store request → GDN → Return Indent</li>
          <li><strong>Utilities:</strong> Adjustment, Product Flow, Expense, Due, Invoice, Credit, Cancel Operations</li>
          <li><strong>AI:</strong> Smart Reorder, Expiry Prediction, QR Tools</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Master Data Setup (First-Time)</h2>
      <StepCard number={1} title="Configure suppliers & manufacturers">
        <ul>
          <li><strong>Master → Manufacturer:</strong> Add all suppliers with: Name, Contact, GST Number, Address, Payment Terms.</li>
          <li><strong>Master → Marketed By:</strong> Add marketing companies (different from manufacturer).</li>
          <li>Link products to their manufacturer and marketer during product creation.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Configure product categories">
        <ul>
          <li><strong>Master → Category:</strong> Tablet, Capsule, Syrup, Churna, Kashayam, Oil, External, Surgical, etc.</li>
          <li><strong>Master → Sub-Category:</strong> Further classification within each category.</li>
          <li><strong>Master → Pharmacological Name:</strong> Drug group classifications for generic grouping.</li>
          <li><strong>Master → Indication:</strong> Disease/condition tags for product search.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Add products to catalog">
        <ul>
          <li><strong>Product → New:</strong> Add single product with all details.</li>
          <li>Fields: Name, Generic Name, Manufacturer, Category, HSN Code, MRP, Purchase Rate, Sale Rate, GST%, Reorder Level, Min/Max Qty, Storage conditions.</li>
          <li><strong>Product → Builder:</strong> Bulk add from Excel template — validates duplicates automatically.</li>
          <li>For Ayurvedic: Add Anupana, classical reference, shelf life.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use the <strong>SNA Formulary</strong> (HMS → SNA Formulary) to import pre-loaded AYUSH classical formulations directly into your product catalog.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Purchase Cycle — Step by Step</h2>
      <StepCard number={1} title="Step 1: Create Quotation (optional)">
        <ul>
          <li>Navigate to <strong>Purchase → Quotation</strong>.</li>
          <li>Send quotation requests to multiple suppliers for price comparison.</li>
          <li>Enter: Products needed, quantities, and target suppliers.</li>
          <li>Compare quotes and select the best supplier for each product.</li>
          <li>Convert winning quotation to Purchase Order with one click.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Step 2: Create Purchase Order (PO)">
        <ul>
          <li>Navigate to <strong>Purchase → PO → New</strong>.</li>
          <li>Select supplier from master list.</li>
          <li>Add products: Search by name → Enter quantity and negotiated rate.</li>
          <li>Apply trade discount if applicable.</li>
          <li>Review total (Subtotal + GST + Freight - Discount).</li>
          <li>Save as Draft (editable) or Confirm (locked, auto-numbered).</li>
          <li>Send confirmed PO to supplier via email/WhatsApp/print.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Step 3: Receive Goods — GRN (Goods Receipt Note)">
        <ul>
          <li>When goods arrive, go to <strong>Purchase → GRN → New</strong>.</li>
          <li>Select the PO number — items auto-populate with ordered quantities.</li>
          <li>For each item, enter:
            <ul>
              <li><strong>Batch Number</strong> (from label on product)</li>
              <li><strong>Expiry Date</strong> (mandatory)</li>
              <li><strong>Received Qty</strong> (may differ from ordered)</li>
              <li><strong>Free Qty</strong> (bonus/scheme units)</li>
              <li><strong>Actual Rate</strong> (if different from PO)</li>
            </ul>
          </li>
          <li>Physical verification: Count, check packaging, verify expiry, check batch against invoice.</li>
          <li>On confirmation: Stock quantities update instantly. Supplier ledger updated.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Step 4: Goods Return (if needed)">
        <ul>
          <li>Navigate to <strong>Purchase → Goods Return → New</strong>.</li>
          <li>Select original GRN number.</li>
          <li>Pick items to return with reason: Damaged, Expired, Wrong item, Short expiry, Quality issue.</li>
          <li>Enter return quantity and condition.</li>
          <li>System generates Debit Note for the supplier.</li>
          <li>Stock auto-deducts returned quantity.</li>
        </ul>
      </StepCard>

      <TipBox title="Golden Rule">
        <p>Never accept goods without creating a GRN. If supplier delivers without a PO, create a "Direct GRN" — but flag it for admin review. No GRN = no record = no accountability.</p>
      </TipBox>

      {/* Section 4 */}
      <h2>4. Managing Purchase Orders</h2>
      <StepCard number={1} title="Track PO status">
        <ul>
          <li>Navigate to <strong>Purchase → PO → Manage</strong>.</li>
          <li>Status lifecycle: Draft → Confirmed → Partially Received → Fully Received → Closed.</li>
          <li>Filter by: Status, Supplier, Date Range, Pending items.</li>
          <li>Click any PO to view details, GRN linkages, and pending items.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Find specific POs">
        <ul>
          <li><strong>Purchase → PO → Find:</strong> Search by PO number, supplier, product, or date.</li>
          <li>Useful for: Supplier follow-up on delayed orders, audit trail, and dispute resolution.</li>
        </ul>
      </StepCard>

      {/* Section 5 */}
      <h2>5. Inter-Store Transfers (Indent)</h2>
      <StepCard number={1} title="Request stock from central store">
        <ul>
          <li>Navigate to <strong>Indent → New</strong>.</li>
          <li>Branch/ward pharmacist raises indent: Select products + quantities needed.</li>
          <li>Indent goes to central store for approval.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Process GDN (Goods Delivery Note)">
        <ul>
          <li>Central store navigates to <strong>Indent → GDN → New</strong>.</li>
          <li>Select the approved indent → Pick batches to send → Confirm GDN.</li>
          <li>Stock deducts from central, adds to requesting store on acknowledgment.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Return indent (excess stock back)">
        <ul>
          <li>If branch has excess or near-expiry stock, raise a <strong>Return Indent</strong>.</li>
          <li>Central store acknowledges receipt → Stock transfers back.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. Stock Control & Adjustments</h2>
      <StepCard number={1} title="Stock adjustment">
        <ul>
          <li>Navigate to <strong>Stock → Adjustment</strong>.</li>
          <li>Use for: Physical count discrepancy, damage, pilferage, or sample distribution.</li>
          <li>Enter: Product, Batch, Adjustment Qty (+ or -), Reason.</li>
          <li>Requires admin approval — creates audit trail entry.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Product flow tracing">
        <ul>
          <li><strong>Stock → Product Flow:</strong> Track complete history of any product.</li>
          <li>Shows chain: Purchase → GRN → Stock → Sale/Issue/Transfer with batch-level detail.</li>
          <li>Essential for: Drug recalls, quality investigations, audit queries.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Issue to departments">
        <ul>
          <li><strong>Stock → Issue → New:</strong> Issue consumables to wards/departments.</li>
          <li>Select department, add items, confirm issue.</li>
          <li>Issued stock deducts from pharmacy inventory.</li>
          <li>Track all issues under <strong>Issue → Manage</strong>.</li>
        </ul>
      </StepCard>

      {/* Section 7 */}
      <h2>7. Cancel Operations</h2>
      <StepCard number={1} title="Cancellation workflow">
        <ul>
          <li>Navigate to <strong>Stock → Cancel</strong> for various cancellation types:</li>
          <li><strong>Cancel Sale Bill:</strong> Reverse a completed sale (stock returns to inventory).</li>
          <li><strong>Cancel Return Bill:</strong> Reverse a customer return.</li>
          <li><strong>Cancel Purchase Order:</strong> Cancel an undelivered PO.</li>
          <li><strong>Cancel GRN:</strong> Reverse a goods receipt (stock deducts).</li>
          <li><strong>Cancel Goods Return:</strong> Reverse a supplier return.</li>
          <li><strong>Cancel Issue:</strong> Reverse a department issue.</li>
          <li>All cancellations require a reason and create audit trail entries.</li>
        </ul>
      </StepCard>

      <TipBox title="Audit Note">
        <p>Cancellations don't delete records — they create reverse entries. The original + cancellation both remain visible in audit trail for compliance.</p>
      </TipBox>

      {/* Section 8 */}
      <h2>8. AI-Powered Procurement</h2>
      <StepCard number={1} title="Smart Reorder">
        <ul>
          <li><strong>Stock → AI → Reorder:</strong> AI analyzes 90-day consumption patterns.</li>
          <li>Suggests: What to order, how much, from which supplier, and when.</li>
          <li>Considers: Seasonal demand, lead time, safety stock, budget, and minimum order quantity.</li>
          <li>One-click: Convert AI suggestion into a Purchase Order.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Expiry management">
        <ul>
          <li><strong>Stock → AI → Expiry:</strong> Predictive expiry dashboard.</li>
          <li>Categories: Expiring in 30 / 60 / 90 days.</li>
          <li>Suggested actions: Discount sale, Return to supplier, Transfer to higher-volume branch, Dispose.</li>
          <li>Auto-generates near-expiry reports for CDSCO compliance.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="QR tools">
        <ul>
          <li><strong>Stock → AI → QR Tools:</strong> Generate QR codes for each product/batch.</li>
          <li>Scan to verify stock, check expiry, view product details.</li>
          <li>Patient-facing QR on bills for medicine usage instructions.</li>
        </ul>
      </StepCard>

      {/* Section 9 */}
      <h2>9. Financial Tracking</h2>
      <StepCard number={1} title="Supplier credits & dues">
        <ul>
          <li><strong>Credit → Supplier:</strong> Track what you owe to each supplier.</li>
          <li><strong>Credit → Patient:</strong> Track patient credit balances.</li>
          <li><strong>Due:</strong> Overall outstanding dues with aging analysis.</li>
          <li><strong>Expense:</strong> Record pharmacy-specific expenses (transport, cold chain, etc.).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Pharmacy invoice">
        <ul>
          <li><strong>Invoice → Pharmacy:</strong> Generate tax invoices for B2B sales.</li>
          <li>Includes: GSTIN, HSN codes, batch details, and proper tax breakup.</li>
          <li>Supports: Wholesale rates, bulk discounts, and credit terms.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + P", action: "New Purchase Order" },
          { keys: "Ctrl + G", action: "New GRN" },
          { keys: "Ctrl + S", action: "New Sale" },
          { keys: "Ctrl + F", action: "Find product/stock" },
          { keys: "Ctrl + I", action: "New Indent" },
          { keys: "F2", action: "Barcode scan" },
          { keys: "F5", action: "Refresh stock levels" },
        ]}
      />
    </GuideLayout>
  );
};

export default StockPurchaseGuide;
