import { Sparkles } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const PanchakarmaOpsGuide = () => {
  return (
    <GuideLayout
      title="Panchakarma Operations Playbook"
      subtitle="Consent → Scheduling → Multi-day protocols → Room/resource management → Documentation"
      icon={Sparkles}
      color="bg-yellow-500/10 text-yellow-700"
      estimatedTime="20 min"
      roles={["PK Coordinator", "Therapist Lead", "Doctor"]}
    >
      {/* Section 1 */}
      <h2>1. Panchakarma Module Overview</h2>
      <StepCard number={1} title="Access PK operations">
        <ul>
          <li>From HMS sidebar: <strong>Panchakarma</strong> (<code>/hms/panchakarma</code>).</li>
          <li>Sub-pages: Main dashboard, <strong>Schedule</strong> (calendar), <strong>Packages</strong> (treatment bundles).</li>
          <li>Also accessible from Spine tab → Treatment Delivery section.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="PK dashboard">
        <ul>
          <li>Today's sessions: Patient, Therapy, Time, Room, Therapist assigned.</li>
          <li>Active packages: Patients currently in multi-day programs (day X of Y).</li>
          <li>Pending consents: Patients needing consent before therapy can start.</li>
          <li>Room utilization: Which therapy rooms are booked/available.</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Consent Workflow</h2>
      <StepCard number={1} title="Digital PK Consent">
        <ul>
          <li>Navigate to <strong>HMS → PK Consent</strong> (<code>/hms/pk-consent</code>).</li>
          <li>Before any Panchakarma procedure, digital consent is mandatory.</li>
          <li>Consent form includes: Procedure details, benefits, risks, alternatives, and patient acknowledgment.</li>
          <li>Patient signs digitally (finger/stylus on screen) or scanned wet signature.</li>
          <li>Consent stored in patient's MRD with timestamp.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Contraindication check">
        <ul>
          <li>System auto-checks before consent: Known allergies, pregnancy status, acute infections, bleeding disorders.</li>
          <li>Flags contraindicated patients — requires doctor override with documented justification.</li>
          <li>For specific procedures: Vamana (emesis) contraindicated in pregnancy, cardiac patients, children.</li>
        </ul>
      </StepCard>

      <TipBox title="Compliance">
        <p>No PK session can be recorded without a valid consent on file. The system blocks session documentation if consent is missing — protects against medico-legal issues.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Package Management</h2>
      <StepCard number={1} title="Create treatment packages">
        <ul>
          <li>Navigate to <strong>Panchakarma → Packages</strong>.</li>
          <li>Define packages with: Name, Duration (days), Included therapies, Number of sessions per therapy, Total price.</li>
          <li>Examples: 7-Day Spine Relief (Kati Basti × 7 + Swedana × 7 + Medicines), 14-Day Detox (Snehapana + Virechana + Basti), 21-Day Rejuvenation (Full Panchakarma cycle).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Assign package to patient">
        <ul>
          <li>Doctor prescribes package → Select patient → Choose package → Set start date.</li>
          <li>System auto-generates the full session schedule (day-wise therapy plan).</li>
          <li>Sessions appear on PK Schedule calendar and therapist schedules.</li>
          <li>Patient receives WhatsApp with full treatment calendar.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Modify mid-treatment">
        <ul>
          <li>If doctor decides to change protocol mid-way (patient responding differently):</li>
          <li>Modify package: Add/remove therapies, extend duration, change therapy type.</li>
          <li>Price adjustment calculated automatically.</li>
          <li>All modifications logged with doctor's reason for audit trail.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Scheduling & Calendar</h2>
      <StepCard number={1} title="PK Schedule view">
        <ul>
          <li>Navigate to <strong>Panchakarma → Schedule</strong> (<code>/hms/panchakarma/schedule</code>).</li>
          <li>Calendar view: Daily/Weekly with time slots, rooms, and therapists.</li>
          <li>Each slot shows: Patient name, Therapy, Duration, Room, Assigned therapist.</li>
          <li>Drag-and-drop to reschedule if needed.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Room allocation">
        <ul>
          <li>Therapy rooms have specific capabilities (Shirodhara room, Basti room, General therapy).</li>
          <li>System auto-assigns room based on therapy type.</li>
          <li>Conflict detection: Warns if room double-booked or equipment unavailable.</li>
          <li>Cleaning/turnover time between sessions auto-blocked (15-30 min).</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Therapist assignment">
        <ul>
          <li>Assign therapists based on: Specialization, availability, workload balance.</li>
          <li>For multi-day programs, same therapist preferred for continuity (auto-assigned).</li>
          <li>If therapist on leave: System suggests replacement with similar skills.</li>
        </ul>
      </StepCard>

      {/* Section 5 */}
      <h2>5. Three-Stage Documentation</h2>
      <StepCard number={1} title="Poorvakarma (Preparatory)">
        <ul>
          <li>Document preparation therapies before main procedure:</li>
          <li><strong>Snehana (Internal):</strong> Ghee/oil intake — Record: Day, Dose, Oil type, Digestion time, Signs of adequate Snehana.</li>
          <li><strong>Snehana (External):</strong> Abhyanga — Record: Oil type, quantity, body areas, duration.</li>
          <li><strong>Swedana:</strong> Steam/fomentation — Record: Type (Bashpa/Nadi/Pinda), duration, sweat pattern.</li>
          <li>Track daily for 3-7 days. AI suggests readiness for main procedure based on signs.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Pradhana Karma (Main Procedure)">
        <ul>
          <li>Document the primary Panchakarma procedure:</li>
          <li><strong>Vamana:</strong> Emesis count (Vegas), volume, output characteristics, Vaigiki/Maniki/Laingiki Shuddhi grade.</li>
          <li><strong>Virechana:</strong> Purgation count, nature, volume, Shuddhi assessment.</li>
          <li><strong>Basti:</strong> Type (Niruha/Anuvasana/Matra), formulation, volume, retention time, expulsion details.</li>
          <li><strong>Nasya:</strong> Drug, drops per nostril, method, patient response, secretion details.</li>
          <li><strong>Raktamokshana:</strong> Site, method (Jalaukavacharana/Siravyadha), volume, duration.</li>
          <li>Record vitals before, during (if applicable), and after procedure.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Paschath Karma (Post-Procedure)">
        <ul>
          <li>Document post-procedure care:</li>
          <li><strong>Samsarjana Krama:</strong> Graded diet protocol — Record which level patient is on (Peya/Vilepi/Yusha/Normal).</li>
          <li><strong>Vitals monitoring:</strong> Record post-procedure vitals at intervals.</li>
          <li><strong>Patient response:</strong> Energy levels, appetite return, bowel normalization.</li>
          <li><strong>Complications (if any):</strong> Nausea, weakness, dehydration — and interventions given.</li>
          <li>Follow-up schedule generated automatically.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>The three-stage documentation creates a complete evidence record. Outcome data (VAS, ODI scores before/after) feeds into the hospital's success rate metrics and research database.</p>
      </TipBox>

      {/* Section 6 */}
      <h2>6. Materials & Inventory</h2>
      <StepCard number={1} title="Track materials per session">
        <ul>
          <li>When recording a session, enter materials consumed: Oil (ml), Herbs (g), Linens used.</li>
          <li>System auto-deducts from pharmacy/store inventory.</li>
          <li>Low-stock alerts: If a therapy material drops below reorder level, alert shows before next scheduled session.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Material cost tracking">
        <ul>
          <li>Each session's material cost auto-calculated from inventory rates.</li>
          <li>Compare material cost vs package revenue per patient for margin tracking.</li>
          <li>Monthly materials consumption report for procurement planning.</li>
        </ul>
      </StepCard>

      {/* Section 7 */}
      <h2>7. Daily Operations Checklist</h2>
      <StepCard number={1} title="Morning (PK Coordinator)">
        <ul>
          <li>✅ Check today's schedule — confirm all patients, rooms, therapists</li>
          <li>✅ Verify materials available for all scheduled therapies</li>
          <li>✅ Check any pending consents — remind patients</li>
          <li>✅ Review previous day's incomplete documentation</li>
          <li>✅ Confirm room readiness (clean, equipment working)</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="During sessions (Therapist)">
        <ul>
          <li>✅ Verify patient identity and consent before starting</li>
          <li>✅ Check contraindications and allergies</li>
          <li>✅ Start session (system timer begins)</li>
          <li>✅ Follow protocol as prescribed — document any deviations</li>
          <li>✅ Record observations, patient response, and vitals</li>
          <li>✅ End session — document materials used and outcome notes</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="End of day">
        <ul>
          <li>✅ All sessions documented and closed</li>
          <li>✅ Materials consumption logged</li>
          <li>✅ Next-day preparation: Check schedule, materials, room prep</li>
          <li>✅ Outstanding items reported to coordinator</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + S", action: "Start therapy session" },
          { keys: "Ctrl + E", action: "End therapy session" },
          { keys: "Ctrl + C", action: "Open consent form" },
          { keys: "Ctrl + P", action: "View package details" },
          { keys: "Ctrl + T", action: "Today's schedule" },
          { keys: "F5", action: "Refresh schedule" },
        ]}
      />
    </GuideLayout>
  );
};

export default PanchakarmaOpsGuide;
