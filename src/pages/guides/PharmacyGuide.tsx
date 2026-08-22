import { Pill } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const PharmacyGuide = () => {
  return (
    <GuideLayout
      title="Pharmacy Quick Start"
      subtitle="Stock management, dispensing, purchase orders, GRN, and inventory control"
      icon={Pill}
      color="bg-red-500/10 text-red-600"
      estimatedTime="20 min"
      roles={["Pharmacist", "Store Manager"]}
    >
      {/* Section 1 */}
      <h2>1. Pharmacy Dashboard</h2>
      <StepCard number={1} title="Access Pharmacy / Stock module">
        <ul>
          <li>From HMS sidebar, go to <strong>Pharmacy</strong> (quick view) or <strong>Stock</strong> (full module).</li>
          <li>The Stock module at <code>/hms/stock</code> gives you the complete pharmacy management system.</li>
          <li>Dashboard shows: Today's Sales, Pending Prescriptions, Near-Expiry Count, and Stock Value.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Understand the navigation">
        <ul>
          <li><strong>Master:</strong> Product categories, manufacturers, pharmacological names</li>
          <li><strong>Product:</strong> Product catalog and stock levels</li>
          <li><strong>Purchase:</strong> Quotation → PO → GRN → Goods Return</li>
          <li><strong>Sale:</strong> New sale, manage bills, prescriptions, returns</li>
          <li><strong>Indent:</strong> Inter-store transfers and GDN</li>
          <li><strong>AI:</strong> Smart reorder, expiry prediction, QR tools</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Product Master Setup</h2>
      <StepCard number={1} title="Add a new product">
        <ul>
          <li>Navigate to <strong>Stock → Product → New</strong>.</li>
          <li>Fill in: Product Name, Generic Name, Manufacturer, Category, HSN Code.</li>
          <li>Set: MRP, Purchase Rate, Sale Rate, GST%, Reorder Level, Min/Max Qty.</li>
          <li>For Ayurvedic medicines: Add Anupana, classical reference, and storage conditions.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Use Product Builder (bulk)">
        <ul>
          <li><strong>Stock → Product → Builder</strong> lets you add multiple products quickly.</li>
          <li>Import from Excel template for large catalogs.</li>
          <li>The system validates duplicates and suggests matching existing entries.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Configure master data">
        <ul>
          <li><strong>Master → Manufacturer:</strong> Add suppliers and manufacturers.</li>
          <li><strong>Master → Category / Sub-Category:</strong> Organize products (Tablet, Churna, Kashayam, etc.).</li>
          <li><strong>Master → Pharmacological Name:</strong> Drug group classifications.</li>
          <li><strong>Master → Indication:</strong> Link products to conditions for quick search.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>For Ayurvedic products, the <strong>SNA Formulary</strong> provides pre-loaded classical formulations that you can directly add to your catalog.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Purchase Workflow</h2>
      <StepCard number={1} title="Create a Purchase Order (PO)">
        <ul>
          <li>Go to <strong>Stock → Purchase → PO → New</strong>.</li>
          <li>Select supplier, add products with quantities and rates.</li>
          <li>Apply discount if negotiated. Save as draft or confirm.</li>
          <li>Confirmed PO can be sent to the supplier via email/WhatsApp.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Receive goods (GRN - Goods Receipt Note)">
        <ul>
          <li>When goods arrive, go to <strong>Stock → Purchase → GRN → New</strong>.</li>
          <li>Select the PO number — items auto-populate.</li>
          <li>Enter: Batch Number, Expiry Date, Received Qty, Free Qty, and actual rates.</li>
          <li>Verify physical stock against invoice before confirming GRN.</li>
          <li>On confirmation, stock quantities update automatically.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Process goods return">
        <ul>
          <li>For damaged/expired goods, use <strong>Purchase → Goods Return → New</strong>.</li>
          <li>Select original GRN, pick items to return with reason.</li>
          <li>Generate debit note for the supplier.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Dispensing & Sales</h2>
      <StepCard number={1} title="Dispense against prescription">
        <ul>
          <li>Go to <strong>Stock → Sale → Prescription</strong>.</li>
          <li>Pending prescriptions from doctors appear here automatically.</li>
          <li>Click a prescription to load items into the sale bill.</li>
          <li>Confirm stock availability, pick batches (FEFO - First Expiry First Out), and bill.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Create a direct sale (OTC)">
        <ul>
          <li>For over-the-counter sales, go to <strong>Stock → Sale → New</strong>.</li>
          <li>Search and add products, select quantity and batch.</li>
          <li>Apply discount if applicable. Accept payment and print bill.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Process sale returns">
        <ul>
          <li>Navigate to <strong>Stock → Sale → Return → New</strong>.</li>
          <li>Enter original bill number, select items being returned.</li>
          <li>Record reason and condition. Process refund or credit note.</li>
          <li>Returned stock goes back to inventory (if condition permits).</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>The system uses <strong>FEFO</strong> (First Expiry, First Out) by default. Batches closest to expiry are suggested first during dispensing.</p>
      </TipBox>

      {/* Section 5 */}
      <h2>5. Inventory Control</h2>
      <StepCard number={1} title="Stock adjustment">
        <ul>
          <li><strong>Stock → Adjustment:</strong> Record stock corrections (damage, pilferage, or physical count discrepancy).</li>
          <li>Requires reason and admin approval for audit trail.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Inter-store transfers (Indent)">
        <ul>
          <li>For multi-store hospitals, use <strong>Stock → Indent → New</strong> to request stock from central store.</li>
          <li>Central store processes via <strong>GDN</strong> (Goods Delivery Note).</li>
          <li>Receiving store acknowledges receipt — stock transfers between locations.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Track product flow">
        <ul>
          <li><strong>Stock → Product Flow:</strong> View complete movement history of any product.</li>
          <li>Shows: Purchase → GRN → Stock → Sale/Issue chain with batch-level tracing.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. AI-Powered Tools</h2>
      <StepCard number={1} title="Smart Reorder">
        <ul>
          <li><strong>Stock → AI → Reorder:</strong> AI analyzes consumption patterns and suggests reorder quantities.</li>
          <li>Considers: Seasonal demand, lead time, safety stock, and budget constraints.</li>
          <li>One-click PO generation from AI recommendations.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Expiry Management">
        <ul>
          <li><strong>Stock → AI → Expiry:</strong> Predictive expiry analysis.</li>
          <li>Shows: Items expiring in 30/60/90 days with suggested actions (discount sale, return to supplier, or dispose).</li>
          <li>Auto-generates near-expiry reports for audit.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="QR Tools">
        <ul>
          <li><strong>Stock → AI → QR Tools:</strong> Generate and scan QR codes for products.</li>
          <li>Quick stock verification using mobile camera.</li>
          <li>Patient can scan QR on bill to view medicine usage instructions.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + S", action: "New sale" },
          { keys: "Ctrl + P", action: "Pending prescriptions" },
          { keys: "Ctrl + G", action: "New GRN" },
          { keys: "Ctrl + F", action: "Find product" },
          { keys: "Ctrl + B", action: "Print bill" },
          { keys: "F2", action: "Search by barcode" },
        ]}
      />
    </GuideLayout>
  );
};

export default PharmacyGuide;
