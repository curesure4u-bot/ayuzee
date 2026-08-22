import { Globe } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const OnlineBookingGuide = () => {
  return (
    <GuideLayout
      title="Online Booking & Self-Service Playbook"
      subtitle="Patient self-booking, online payments, WhatsApp notifications, and reception handling"
      icon={Globe}
      color="bg-cyan-500/10 text-cyan-600"
      estimatedTime="12 min"
      roles={["Receptionist", "Admin", "Marketing"]}
    >
      <h2>1. Online Booking Setup</h2>
      <StepCard number={1} title="Enable online booking">
        <ul>
          <li>Navigate to <strong>HMS → Online Booking</strong> (<code>/hms/online-booking</code>).</li>
          <li>Configure: Which doctors are bookable online, available slot times, advance booking window (e.g., 7 days).</li>
          <li>Set: Consultation fees for online booking, cancellation policy, and refund rules.</li>
          <li>Payment modes: Razorpay (card/UPI/netbanking) or Pay at Clinic.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Booking widget">
        <ul>
          <li>Navigate to <strong>HMS → Widget Generator</strong> for embeddable booking widget.</li>
          <li>Generates a code snippet to embed on your website or landing pages.</li>
          <li>Widget shows: Available doctors, slots, and accepts payment — zero coding needed.</li>
        </ul>
      </StepCard>

      <h2>2. Patient Self-Booking Flow</h2>
      <StepCard number={1} title="How patients book (from their side)">
        <ul>
          <li>Patient visits ayuzee.com → <strong>Find Care</strong> → Selects doctor → Views available slots.</li>
          <li>Chooses: Date, Time, Consultation Type (In-Person / Teleconsult).</li>
          <li>Enters: Name, Phone, Reason for visit (optional).</li>
          <li>Pays online (if configured) → Receives confirmation on WhatsApp + SMS.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Confirmation & reminders">
        <ul>
          <li>Instant: Booking confirmation with appointment ID, date, time, doctor, address.</li>
          <li>24 hours before: Reminder with directions and preparation instructions.</li>
          <li>1 hour before: Final reminder with token/queue number (if walk-in OPD).</li>
          <li>All via WhatsApp (primary) + SMS (fallback).</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Cancellation & rescheduling">
        <ul>
          <li>Patient can cancel/reschedule from their dashboard up to 24 hours before.</li>
          <li>Late cancellation: As per policy (partial refund or credit note).</li>
          <li>Refund auto-processed to original payment method within 3-5 business days.</li>
          <li>Cancelled slots immediately become available for other patients.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Online bookings typically have a <strong>lower no-show rate</strong> (15%) vs phone bookings (30%) because patients have prepaid and receive automated reminders.</p>
      </TipBox>

      <h2>3. Reception Handling of Online Bookings</h2>
      <StepCard number={1} title="View online bookings">
        <ul>
          <li>Online bookings appear in the <strong>Appointments</strong> list with "Online" badge.</li>
          <li>Filter: Online vs Walk-in vs Phone bookings.</li>
          <li>Patient details auto-populated — no manual re-entry needed.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Check-in process for online patients">
        <ul>
          <li>Patient arrives → Shows QR code (from WhatsApp confirmation) or gives name/phone.</li>
          <li>Reception verifies → Marks as "Arrived" → Token generated.</li>
          <li>If first visit: Complete remaining profile details (address, ID, etc.).</li>
          <li>If payment already done: Skip billing. If "Pay at Clinic": Collect now.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Handle no-shows">
        <ul>
          <li>If patient doesn't arrive within 15 min of slot: System sends "Are you coming?" WhatsApp.</li>
          <li>After 30 min: Auto-marked as "No Show" — slot freed for walk-ins.</li>
          <li>Repeat no-shows: System flags patient for future booking restrictions.</li>
        </ul>
      </StepCard>

      <h2>4. Digital Check-in (QR)</h2>
      <StepCard number={1} title="Self-service kiosk / QR check-in">
        <ul>
          <li>Navigate to <strong>HMS → Digital Check-in (QR)</strong>.</li>
          <li>Print QR poster at entrance — patient scans → enters phone → auto-checks in.</li>
          <li>Token auto-generated and sent to their phone.</li>
          <li>Reduces reception queue for pre-booked patients.</li>
        </ul>
      </StepCard>

      <h2>5. WhatsApp Integration</h2>
      <StepCard number={1} title="Configure WhatsApp messaging">
        <ul>
          <li>Navigate to <strong>HMS → WhatsApp Engage</strong> (<code>/hms/whatsapp</code>).</li>
          <li>Templates for: Appointment confirmation, Reminders, Prescription share, Report ready, Payment receipt, Follow-up reminder.</li>
          <li>All templates pre-approved by WhatsApp Business API.</li>
          <li>Track: Delivery status, Read receipts, Reply rate.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Automated triggers">
        <ul>
          <li>Booking → Instant confirmation</li>
          <li>Registration → Welcome message with hospital info</li>
          <li>Prescription saved → Auto-send to patient</li>
          <li>Lab report ready → Send download link</li>
          <li>Payment received → Digital receipt</li>
          <li>Follow-up due → Reminder with booking link</li>
          <li>Birthday/Anniversary → Wellness greeting with offer</li>
        </ul>
      </StepCard>

      <h2>6. Teleconsultation</h2>
      <StepCard number={1} title="Teleconsult booking & delivery">
        <ul>
          <li>Patient selects "Teleconsult" during booking.</li>
          <li>At appointment time: Patient clicks "Join" from their dashboard.</li>
          <li>Doctor clicks "Start Consult" from OPD queue.</li>
          <li>Secure video room opens (browser-based, no app download).</li>
          <li>After consult: Prescription shared digitally, follow-up scheduled.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Teleconsult works best for: Follow-ups, chronic disease management, medication reviews, and second opinions. First visits for new complaints should be in-person when possible.</p>
      </TipBox>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + B", action: "View today's bookings" },
          { keys: "Ctrl + C", action: "Check-in patient" },
          { keys: "Ctrl + W", action: "Send WhatsApp message" },
          { keys: "Ctrl + T", action: "Start teleconsult" },
        ]}
      />
    </GuideLayout>
  );
};

export default OnlineBookingGuide;
