import { HandHeart } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const TherapistGuide = () => {
  return (
    <GuideLayout
      title="Therapist Quick Start"
      subtitle="Panchakarma scheduling, therapy sessions, patient tracking, and treatment documentation"
      icon={HandHeart}
      color="bg-teal-500/10 text-teal-600"
      estimatedTime="15 min"
      roles={["Therapist", "Panchakarma Staff"]}
    >
      {/* Section 1 */}
      <h2>1. Accessing the Therapist Module</h2>
      <StepCard number={1} title="Log in and navigate">
        <ul>
          <li>Log in at <code>/hms/auth</code> with your therapist credentials.</li>
          <li>Your dashboard shows: Today's Sessions, Assigned Patients, Room Availability, and Materials Needed.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Understand your schedule">
        <ul>
          <li>The <strong>Panchakarma Schedule</strong> shows all booked therapy sessions for today/week.</li>
          <li>Each entry shows: Patient, Therapy Type, Time Slot, Room, and Doctor's Instructions.</li>
          <li>Color codes: 🟢 Confirmed, 🟡 Pending Consent, 🔴 Cancelled.</li>
        </ul>
      </StepCard>

      {/* Section 2 */}
      <h2>2. Managing Therapy Sessions</h2>
      <StepCard number={1} title="View the doctor's therapy order">
        <ul>
          <li>When a doctor prescribes a therapy, it appears in your <strong>Pending Orders</strong>.</li>
          <li>The order includes: Therapy name, duration, number of sessions, special instructions, and Anupana.</li>
          <li>Review the patient's Prakriti and contraindications before starting.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Prepare for the session">
        <ul>
          <li>Check room assignment and material requirements (oils, herbs, equipment).</li>
          <li>Verify patient consent — use <strong>PK Consent</strong> to record digital consent.</li>
          <li>Note any allergies or skin sensitivities from the patient record.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Start the therapy session">
        <ul>
          <li>Click <strong>Start Session</strong> on the scheduled therapy.</li>
          <li>Timer begins — record the actual start time.</li>
          <li>During the session, you can log observations in real time.</li>
        </ul>
      </StepCard>

      <StepCard number={4} title="Complete and document">
        <ul>
          <li>Click <strong>End Session</strong> when done.</li>
          <li>Document: Duration, oils/materials used, patient response, and therapist observations.</li>
          <li>Note any adverse reactions or discomfort reported by the patient.</li>
          <li>Mark session completion — remaining sessions count updates automatically.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Use the <strong>Therapy Packages</strong> view to see multi-day programs (e.g., 7/14/21 day Panchakarma) and track overall progress.</p>
      </TipBox>

      {/* Section 3 */}
      <h2>3. Panchakarma-Specific Workflows</h2>
      <StepCard number={1} title="Poorvakarma (preparatory)">
        <ul>
          <li>Document Snehana (oleation) and Swedana (sudation) given in preparation.</li>
          <li>Record: Oil type, quantity, duration, and patient tolerance.</li>
          <li>Note dietary instructions given (Pathya chart from doctor's order).</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Pradhana Karma (main procedure)">
        <ul>
          <li>For Vamana: Record emesis count, output volume, and Vaigiki Shuddhi grade.</li>
          <li>For Virechana: Record number of episodes, nature, and Shuddhi assessment.</li>
          <li>For Basti: Record type (Niruha/Anuvasana), volume, retention time, and output.</li>
          <li>For Nasya: Record drops, side, and patient response.</li>
          <li>For Raktamokshana: Record volume and method.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Paschath Karma (post-procedure)">
        <ul>
          <li>Document Samsarjana Krama (post-therapy diet regimen) followed.</li>
          <li>Record patient vitals after procedure (BP, pulse, general condition).</li>
          <li>Schedule follow-up observation if needed.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. Common Therapies Quick Reference</h2>
      <StepCard number={1} title="Abhyanga (Oil Massage)">
        <ul>
          <li>Duration: 45-60 min typical</li>
          <li>Record: Oil type, quantity (ml), technique, and target areas.</li>
          <li>Post-session: Rest period, then Swedana if prescribed.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Shirodhara">
        <ul>
          <li>Duration: 30-45 min typical</li>
          <li>Record: Oil/liquid type, temperature, stream height, duration, and oscillation pattern.</li>
          <li>Monitor: Patient relaxation, any headache, and sleep quality feedback.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Kati/Janu/Greeva/Uro Basti">
        <ul>
          <li>Duration: 20-30 min typical</li>
          <li>Record: Oil type, temperature, retention time, and target joint/area.</li>
          <li>Note: Pain VAS score before and after.</li>
        </ul>
      </StepCard>

      {/* Section 5 */}
      <h2>5. Room & Resource Management</h2>
      <StepCard number={1} title="Check room availability">
        <ul>
          <li>The schedule view shows room occupancy by time slot.</li>
          <li>Each room has assigned therapy types and equipment.</li>
          <li>If a room is occupied, the system suggests next available slot.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Track materials used">
        <ul>
          <li>When documenting a session, record materials consumed (oils, herbs, linens).</li>
          <li>This auto-deducts from pharmacy/store inventory.</li>
          <li>Low-stock alerts appear when supplies are running low.</li>
        </ul>
      </StepCard>

      <TipBox title="Safety First">
        <p>Always check the <strong>Contraindications</strong> panel before starting any Panchakarma. The system flags known allergies, pregnancy, and acute conditions automatically.</p>
      </TipBox>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + S", action: "Start session" },
          { keys: "Ctrl + E", action: "End session" },
          { keys: "Ctrl + N", action: "Add session note" },
          { keys: "Ctrl + T", action: "View today's schedule" },
          { keys: "F5", action: "Refresh schedule" },
        ]}
      />
    </GuideLayout>
  );
};

export default TherapistGuide;
