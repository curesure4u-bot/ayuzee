import { Wallet } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const BillingAccountsGuide = () => {
  return (
    <GuideLayout
      title="Billing & Accounts Playbook"
      subtitle="Day-end reconciliation, insurance claims, GST compliance, advance/refund flow, and financial reporting"
      icon={Wallet}
      color="bg-emerald-500/10 text-emerald-600"
      estimatedTime="20 min"
      roles={["Accounts Staff", "Cashier", "Admin"]}
    >
      {/* Section 1 */}
      <h2>1. Accounts Module Overview</h2>
      <StepCard number={1} title="Access Accounts">
        <ul>
          <li>From the HMS sidebar, navigate to <strong>Accounts</strong> (<code>/hms/accounts</code>).</li>
          <li>Sub-modules: Revenue Dashboard, Payment Collection, Expenses, Payroll, GST, TDS, Insurance, Day End, Refund & Advance, Financial Reports, Bank AI, Reconciliation, Cash Flow, Cashier, Sales Analytics, Target & Achieved, Incentive, Staff Credits, Supplier/Franchise, Follow-up, CRM, State Fund, Tally Export.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Revenue Dashboard at a glance">
        <ul>
          <li><strong>Accounts → Revenue</strong> shows: Today's collection, pending receivables, department-wise revenue, doctor-wise earnings.</li>
          <li>Compare against targets with the <strong>Target & Achieved</strong> view.</li>
          <li>Real-time vs end-of-day reconciled figures.</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Daily Billing Workflow</h2>
      <StepCard number={1} title="Creating a bill">
        <ul>
          <li>Bills are generated from: Registration (+Bill combo), Consultation fee, Lab orders, Pharmacy sales, Therapy sessions, IP charges.</li>
          <li>Each bill gets a unique invoice number (auto-generated per sequence).</li>
          <li>Select rate plan: General, VIP, Corporate, Insurance, Staff.</li>
          <li>Apply discount (% or flat) — requires reason and may need admin approval.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Collecting payment">
        <ul>
          <li>Payment modes: Cash, Card (POS), UPI (QR), Online Transfer, Cheque, Wallet.</li>
          <li>Split payment supported — e.g., ₹500 cash + ₹1000 UPI.</li>
          <li>Print receipt or send via WhatsApp/email.</li>
          <li>Receipt shows: Patient name, services, amount, tax, payment mode, and QR code.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Handling outstanding / credit patients">
        <ul>
          <li>Mark bill as "Credit" for known patients or corporate accounts.</li>
          <li>Track outstanding via <strong>Accounts → Follow-up</strong>.</li>
          <li>Send payment reminders via WhatsApp.</li>
          <li>Corporate dues tracked under <strong>Supplier/Franchise</strong> ledger.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use the <strong>Cashier</strong> view for a simplified POS-style interface focused on fast billing without the full accounts dashboard.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Advance & Refund Management</h2>
      <StepCard number={1} title="Collecting advance (IPD / Packages)">
        <ul>
          <li>Navigate to <strong>Accounts → Refund & Advance</strong>.</li>
          <li>Select patient → Enter advance amount → Choose payment mode → Generate advance receipt.</li>
          <li>Advance balance auto-deducts from final bill at discharge.</li>
          <li>Multiple advances can be collected for the same admission.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Processing refunds">
        <ul>
          <li>Go to <strong>Accounts → Refund & Advance</strong> → Refund tab.</li>
          <li>Enter original receipt number or patient ID.</li>
          <li>Select reason: Cancellation, Overcharge, Partial service, Package downgrade.</li>
          <li>Enter refund amount — system validates against original payment.</li>
          <li>Approval workflow: Cashier initiates → Admin approves → Finance processes.</li>
          <li>Refund mode: Same as original payment (mandatory for card/UPI), or cash.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Insurance & TPA Claims</h2>
      <StepCard number={1} title="Insurance billing workflow">
        <ul>
          <li>Navigate to <strong>Billing → Insurance</strong> or <strong>Accounts → Insurance</strong>.</li>
          <li>At registration, capture: Insurance company, Policy number, Card photo, Pre-auth status.</li>
          <li>Generate pre-authorization request with diagnosis and estimated cost.</li>
          <li>On approval, bill is tagged as "Insurance" with approved amount.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Claim submission & tracking">
        <ul>
          <li>After discharge, compile claim file: Bills, Discharge summary, Investigation reports.</li>
          <li>Submit via insurance portal or physically (as per TPA requirement).</li>
          <li>Track claim status: Submitted → Under Review → Approved/Rejected → Settled.</li>
          <li>Rejected claims: Review reason, resubmit with additional documents if applicable.</li>
          <li>Settlement received → Match against claim → Close in system.</li>
        </ul>
      </StepCard>

      <TipBox title="Important">
        <p>Always verify insurance eligibility BEFORE treatment starts. Pre-auth lapses and policy exclusions are the #1 cause of claim rejections.</p>
      </TipBox>

      {/* Section 5 */}
      <h2>5. GST & Statutory Compliance</h2>
      <StepCard number={1} title="GST management">
        <ul>
          <li>Navigate to <strong>Accounts → GST</strong>.</li>
          <li>All invoices auto-calculate GST based on HSN codes configured in Masters.</li>
          <li>View: GSTR-1 (outward supplies), GSTR-3B (summary), and Input Tax Credit.</li>
          <li>Export data in GST portal-compatible format for filing.</li>
          <li>Track GST receivable vs payable monthly.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="TDS compliance">
        <ul>
          <li>Navigate to <strong>Accounts → TDS</strong>.</li>
          <li>Auto-calculates TDS on doctor payouts, contractor payments, and rent.</li>
          <li>Generate TDS certificates (Form 16A) for deductees.</li>
          <li>Quarterly filing data ready for download.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Tally export">
        <ul>
          <li>Navigate to <strong>Accounts → Tally</strong>.</li>
          <li>Export all vouchers (Sales, Purchase, Receipt, Payment, Journal) in Tally-compatible XML format.</li>
          <li>Map HMS accounts to Tally ledger names in settings.</li>
          <li>Daily or monthly batch export supported.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. Day-End Reconciliation</h2>
      <StepCard number={1} title="Perform day-end close">
        <ul>
          <li>Navigate to <strong>Accounts → Day End</strong>.</li>
          <li>System shows: Total collections by payment mode (Cash/Card/UPI/Online).</li>
          <li>Cashier enters: Actual cash in hand, POS settlement printout total, UPI settlement.</li>
          <li>System auto-calculates discrepancy (if any).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Handle discrepancies">
        <ul>
          <li>If cash short/excess: Enter reason (rounding, change error, etc.).</li>
          <li>Excess goes to "Cash Over" account; shortage to "Cash Short" account.</li>
          <li>Recurring shortages are flagged for admin review.</li>
          <li>Submit day-end report — digitally signed with timestamp.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="End-of-day checklist">
        <ul>
          <li>✅ All bills finalized (no pending drafts)</li>
          <li>✅ Cash counted and matched</li>
          <li>✅ POS settlement slip printed</li>
          <li>✅ UPI settlements verified</li>
          <li>✅ Refunds processed and approved</li>
          <li>✅ Outstanding list reviewed</li>
          <li>✅ Day-end report submitted</li>
          <li>✅ Cash deposited in safe / bank</li>
        </ul>
      </StepCard>

      {/* Section 7 */}
      <h2>7. Expenses & Payroll</h2>
      <StepCard number={1} title="Record expenses">
        <ul>
          <li>Navigate to <strong>Accounts → Expenses</strong>.</li>
          <li>Categories: Rent, Utilities, Consumables, Maintenance, Marketing, Miscellaneous.</li>
          <li>Attach invoice/receipt photo for each expense entry.</li>
          <li>Approval workflow for expenses above threshold.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Payroll processing">
        <ul>
          <li>Navigate to <strong>Accounts → Payroll</strong>.</li>
          <li>Links to HRMS payroll — shows monthly salary disbursement status.</li>
          <li>Track: Gross salary, deductions (PF/ESI/TDS), net pay, bank transfer status.</li>
          <li>Doctor commission payouts tracked separately under <strong>Incentive</strong>.</li>
        </ul>
      </StepCard>

      {/* Section 8 */}
      <h2>8. Financial Reports & AI</h2>
      <StepCard number={1} title="Standard reports">
        <ul>
          <li><strong>Financial Reports:</strong> P&L, Balance Sheet, Cash Flow, AR Aging, Expense Summary.</li>
          <li><strong>Sales Analytics:</strong> Revenue by service, department, doctor, time period.</li>
          <li><strong>Cash Flow:</strong> Daily/weekly/monthly cash inflow vs outflow visualization.</li>
          <li>Export any report to Excel or PDF.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Bank AI & Reconciliation">
        <ul>
          <li><strong>Bank AI:</strong> Upload bank statement → AI matches transactions to bills automatically.</li>
          <li><strong>Reconciliation:</strong> View matched/unmatched transactions and resolve differences.</li>
          <li>Reduces month-end reconciliation from days to hours.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + B", action: "New bill" },
          { keys: "Ctrl + R", action: "Record receipt" },
          { keys: "Ctrl + E", action: "Record expense" },
          { keys: "Ctrl + D", action: "Day-end close" },
          { keys: "Ctrl + G", action: "GST report" },
          { keys: "F8", action: "Print receipt" },
        ]}
      />
    </GuideLayout>
  );
};

export default BillingAccountsGuide;
