import { BedDouble } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const IpdNursingGuide = () => {
  return (
    <GuideLayout
      title="IPD & Nursing Playbook"
      subtitle="Admission → Ward assignment → Nursing station → Diet orders → OT → Discharge workflow"
      icon={BedDouble}
      color="bg-violet-500/10 text-violet-600"
      estimatedTime="20 min"
      roles={["Nurse", "Ward In-charge", "IPD Coordinator"]}
    >
      {/* Section 1 */}
      <h2>1. IPD Module Overview</h2>
      <StepCard number={1} title="Access IPD modules">
        <ul>
          <li>From HMS, click <strong>More</strong> tab → <strong>IPD & Nursing</strong> group.</li>
          <li>Sub-modules: IPD & Wards, Nursing Station, Diet & Kitchen, Ward Consumables, Operation Theater, Blood Bank, Procedures.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Ward & bed setup (admin)">
        <ul>
          <li>Go to <strong>Masters → Wards</strong> to configure: Ward name, type (General/Semi-Private/Private/ICU/Panchakarma), bed count, charges/day.</li>
          <li>Each bed has: Number, occupancy status, amenities, and nursing station assignment.</li>
          <li>Bed status: Available (Green), Occupied (Red), Reserved (Yellow), Maintenance (Grey).</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Admission Workflow</h2>
      <StepCard number={1} title="Initiate admission">
        <ul>
          <li>Doctor decides admission → Places IP order from consultation.</li>
          <li>Or use <strong>Patient → IP/Admission</strong> from sidebar.</li>
          <li>Select: Patient, Admitting Doctor, Department, Expected Stay Duration.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Assign ward & bed">
        <ul>
          <li>System shows available beds by ward type.</li>
          <li>Select ward → Pick available bed → Confirm assignment.</li>
          <li>Bed status changes to "Occupied" with patient name.</li>
          <li>Admission timestamp and expected discharge date recorded.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="OP → IP transfer">
        <ul>
          <li>Navigate to <strong>OP → IP Transfer</strong> for seamless transition.</li>
          <li>All OPD records (vitals, prescriptions, investigations) carry forward.</li>
          <li>Billing switches from OPD to IPD mode automatically.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Collect advance">
        <ul>
          <li>At admission, collect advance payment (amount per hospital policy).</li>
          <li>Record via <strong>Accounts → Refund & Advance</strong>.</li>
          <li>Issue advance receipt to patient/attendant.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>For Panchakarma packages, use <strong>OP → Therapy (OPT)</strong> transfer for patients who are admitted specifically for multi-day therapy programs.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Nursing Station Operations</h2>
      <StepCard number={1} title="Nursing dashboard">
        <ul>
          <li>Navigate to <strong>Nursing</strong> (<code>/hms/nursing</code>).</li>
          <li>Shows: All admitted patients in your ward, pending tasks, medication due, vitals due.</li>
          <li>Color-coded priority: Critical (Red), Urgent (Orange), Routine (Green).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Record vitals (IP)">
        <ul>
          <li>Click patient → Vitals tab → Enter: BP, Pulse, Temperature, SpO2, Respiration Rate.</li>
          <li>Frequency as per doctor's order (Q4H, Q6H, Q8H, BD, OD).</li>
          <li>System auto-plots vitals trend chart visible to doctors.</li>
          <li>Critical values trigger immediate alert to duty doctor.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Medication administration">
        <ul>
          <li>View medication schedule from doctor's prescription.</li>
          <li>Mark each dose as: Given, Held (with reason), Refused, Vomited.</li>
          <li>Record: Time administered, nurse name, any adverse reaction.</li>
          <li>PRN (as-needed) medications: Record indication and doctor who authorized.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Nursing notes & care plans">
        <ul>
          <li>Document shift-wise nursing notes: Patient condition, interventions, patient/family communication.</li>
          <li>Care plans for: Fall prevention, pressure sore prevention, pain management, IV site care.</li>
          <li>Handoff notes at shift change for continuity.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Diet & Kitchen Management</h2>
      <StepCard number={1} title="Diet order workflow">
        <ul>
          <li>Navigate to <strong>Diet & Kitchen</strong> (<code>/hms/diet-kitchen</code>).</li>
          <li>Doctor prescribes diet type: Normal, Soft, Liquid, NPO (nil by mouth), Pathya (Ayurvedic therapeutic diet).</li>
          <li>Nurse confirms patient's preferences and allergies.</li>
          <li>Kitchen receives consolidated diet list for each meal time.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Ayurvedic Pathya (therapeutic diet)">
        <ul>
          <li>Based on: Dosha type, disease, treatment stage (pre/during/post Panchakarma).</li>
          <li>Samsarjana Krama (graded diet) after Panchakarma: Peya → Vilepi → Akruta Yusha → Kruta Yusha → Normal.</li>
          <li>Diet chart generated from doctor's case sheet and shared with kitchen.</li>
        </ul>
      </StepCard>

      {/* Section 5 */}
      <h2>5. Ward Consumables & Requests</h2>
      <StepCard number={1} title="Ward store management">
        <ul>
          <li>Navigate to <strong>Ward Consumables</strong> (<code>/hms/ward-store</code>).</li>
          <li>Each ward maintains a mini-stock of consumables (cotton, gauze, syringes, etc.).</li>
          <li>When stock runs low, raise indent to central pharmacy.</li>
          <li>Track usage per patient for accurate billing.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Consumable billing">
        <ul>
          <li>Record items used per patient per day.</li>
          <li>Auto-adds to patient's IP bill: Consumables, Medicines, Procedures.</li>
          <li>Daily running bill visible to patient/attendant on request.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. Operation Theater (OT)</h2>
      <StepCard number={1} title="OT scheduling">
        <ul>
          <li>Navigate to <strong>OT</strong> (<code>/hms/ot</code>).</li>
          <li>Book OT slot: Date, Time, Surgeon, Anesthetist, Procedure, Estimated Duration.</li>
          <li>Pre-op checklist: Consent, NPO confirmed, Blood arranged, Investigation reports reviewed.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="OT documentation">
        <ul>
          <li>Intra-op notes: Procedure performed, findings, specimens sent, implants used.</li>
          <li>Anesthesia record: Type, agents, vitals during procedure, complications.</li>
          <li>Post-op orders: Monitoring frequency, medications, diet restrictions, drain management.</li>
        </ul>
      </StepCard>

      {/* Section 7 */}
      <h2>7. Blood Bank</h2>
      <StepCard number={1} title="Blood bank operations">
        <ul>
          <li>Navigate to <strong>Blood Bank</strong> (<code>/hms/blood-bank</code>).</li>
          <li>Functions: Blood requisition, Cross-match, Issue, Stock management, Donor records.</li>
          <li>Requisition flow: Doctor orders → Lab cross-matches → Blood bank issues → Nurse administers.</li>
          <li>Track: Blood group wise stock, expiry dates, transfusion reactions.</li>
        </ul>
      </StepCard>

      {/* Section 8 */}
      <h2>8. Discharge Workflow</h2>
      <StepCard number={1} title="Initiate discharge">
        <ul>
          <li>Navigate to <strong>Discharge Workflow</strong> or doctor marks patient for discharge.</li>
          <li>System triggers discharge checklist:</li>
          <ul>
            <li>✅ Doctor's discharge orders written</li>
            <li>✅ Discharge medications prescribed</li>
            <li>✅ Final investigations reviewed</li>
            <li>✅ Nursing clearance (IV removed, wound dressed, belongings returned)</li>
            <li>✅ Diet/Pathya instructions given</li>
            <li>✅ Follow-up date scheduled</li>
          </ul>
        </ul>
      </StepCard>

      <StepCard number={2} title="Generate discharge summary">
        <ul>
          <li>Auto-compiled from: Admission notes, daily progress, investigations, procedures, final diagnosis.</li>
          <li>Doctor reviews, edits if needed, and signs digitally.</li>
          <li>Includes: Discharge medications, dietary advice, exercise instructions, warning signs.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Final billing & settlement">
        <ul>
          <li>All IP charges consolidated: Room, Procedures, Medicines, Investigations, Consumables, Doctor fees.</li>
          <li>Advance deducted → Balance calculated → Patient pays remaining.</li>
          <li>If insurance: Bill sent to TPA, patient pays co-pay only.</li>
          <li>Bed status changes to "Available" after checkout.</li>
        </ul>
      </StepCard>

      <TipBox title="Discharge Delay Alert">
        <p>The system flags patients who've been cleared for discharge but haven't checked out within 4 hours — helps reduce bed blocking and improve turnover.</p>
      </TipBox>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + A", action: "New admission" },
          { keys: "Ctrl + V", action: "Record vitals" },
          { keys: "Ctrl + M", action: "Medication administration" },
          { keys: "Ctrl + N", action: "Add nursing note" },
          { keys: "Ctrl + D", action: "Initiate discharge" },
          { keys: "F5", action: "Refresh ward view" },
        ]}
      />
    </GuideLayout>
  );
};

export default IpdNursingGuide;
