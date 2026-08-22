import { Heart } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const PatientGuide = () => {
  return (
    <GuideLayout
      title="Patient Quick Start"
      subtitle="Booking appointments, viewing prescriptions, ordering medicines, and managing health records"
      icon={Heart}
      color="bg-pink-500/10 text-pink-600"
      estimatedTime="10 min"
      roles={["Patient", "Caregiver"]}
    >
      {/* Section 1 */}
      <h2>1. Creating Your Account</h2>
      <StepCard number={1} title="Sign up on Ayuzee">
        <ul>
          <li>Visit <strong>ayuzee.com</strong> and click <strong>Login / Sign Up</strong>.</li>
          <li>Enter your phone number — you'll receive an OTP for verification.</li>
          <li>Set your name and basic profile details.</li>
          <li>That's it! You now have an Ayuzee patient account.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Complete your health profile">
        <ul>
          <li>Go to <strong>Dashboard → Profile</strong> to add health details.</li>
          <li>Fill in: Age, Gender, Blood Group, Known Allergies, Current Medications.</li>
          <li>Add your <strong>ABHA ID</strong> (Ayushman Bharat Health Account) if you have one.</li>
          <li>A complete profile helps doctors provide better care.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Your data is private and encrypted. Only doctors you consult with can view your health records.</p>
      </TipBox>

      {/* Section 2 */}
      <h2>2. Finding & Booking a Doctor</h2>
      <StepCard number={1} title="Search for a doctor">
        <ul>
          <li>Use <strong>Find Care</strong> from the top menu or go to <code>/doctors</code>.</li>
          <li>Filter by: System (Ayurveda, Siddha, Unani, Yoga, Homeopathy), Specialty, Location, or Language.</li>
          <li>View doctor profiles with qualifications, experience, reviews, and available slots.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Book an appointment">
        <ul>
          <li>Click <strong>Book Appointment</strong> on the doctor's profile.</li>
          <li>Choose: Date, Time Slot, and Consultation Type (In-Person / Teleconsult).</li>
          <li>Select payment mode and confirm booking.</li>
          <li>You'll receive confirmation via WhatsApp/SMS with appointment details.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Manage appointments">
        <ul>
          <li>View all bookings at <strong>Dashboard → Appointments</strong>.</li>
          <li>Cancel or reschedule at least 24 hours before for a full refund.</li>
          <li>For teleconsult: Join the video call from your appointment page at the scheduled time.</li>
        </ul>
      </StepCard>

      {/* Section 3 */}
      <h2>3. During Your Consultation</h2>
      <StepCard number={1} title="In-person visit">
        <ul>
          <li>Arrive at the clinic and show your token (received via WhatsApp or at the reception).</li>
          <li>A nurse may record your vitals (BP, weight, temperature) before seeing the doctor.</li>
          <li>Share your symptoms, previous reports, and any medications you're taking.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Teleconsult (video call)">
        <ul>
          <li>Open your appointment on the website at the scheduled time.</li>
          <li>Click <strong>Join Consultation</strong> to enter the secure video room.</li>
          <li>Keep a quiet space, good internet, and your phone camera ready.</li>
          <li>The doctor can share their screen for explanations or reference charts.</li>
        </ul>
      </StepCard>

      {/* Section 4 */}
      <h2>4. After Your Consultation</h2>
      <StepCard number={1} title="View your prescription">
        <ul>
          <li>After the consult, your prescription appears in <strong>Dashboard → Prescriptions</strong>.</li>
          <li>It includes: Diagnosis, Medicines (with dosage & timing), Diet advice, and Follow-up date.</li>
          <li>Download or print the prescription anytime.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Order medicines online">
        <ul>
          <li>Click <strong>Order Medicines</strong> on your prescription to add them to cart.</li>
          <li>Or browse the <strong>Shop</strong> for Ayurvedic products and wellness items.</li>
          <li>Track your order from <strong>Dashboard → Orders</strong> or <code>/shop/track</code>.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="View lab reports">
        <ul>
          <li>If the doctor ordered tests, your reports appear in <strong>Dashboard → Reports</strong> once ready.</li>
          <li>AI-powered Smart Reports explain your results in simple language.</li>
          <li>Download reports in PDF format for your records.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>Set up <strong>WhatsApp notifications</strong> to receive prescription, report, and appointment reminders directly on your phone.</p>
      </TipBox>

      {/* Section 5 */}
      <h2>5. Managing Your Health Records</h2>
      <StepCard number={1} title="View visit history">
        <ul>
          <li>Your complete consultation history is in <strong>Dashboard</strong>.</li>
          <li>Each visit shows: Date, Doctor, Diagnosis, Prescription, and Lab Results.</li>
          <li>Track treatment progress over time.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Upload previous records">
        <ul>
          <li>Upload old prescriptions, reports, or discharge summaries to your profile.</li>
          <li>These are visible to your doctors for better continuity of care.</li>
          <li>Supports: PDF, JPEG, PNG formats.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Share records (ABDM)">
        <ul>
          <li>If you have an ABHA ID, your records can be shared across ABDM-linked hospitals.</li>
          <li>You control who sees your data — approve/deny sharing requests.</li>
        </ul>
      </StepCard>

      {/* Section 6 */}
      <h2>6. Additional Features</h2>
      <StepCard number={1} title="Prakriti assessment">
        <ul>
          <li>Take the <strong>Prakriti Quiz</strong> to know your Ayurvedic constitution (Vata/Pitta/Kapha).</li>
          <li>Get personalized diet and lifestyle recommendations based on your Prakriti.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Book therapies">
        <ul>
          <li>Browse available therapies and wellness packages.</li>
          <li>Book Panchakarma sessions, massage therapies, or wellness programs.</li>
          <li>View therapist profiles and session details before booking.</li>
        </ul>
      </StepCard>

      <StepCard number={3} title="Get help">
        <ul>
          <li>Visit <strong>Dashboard → Help</strong> for FAQs and support contacts.</li>
          <li>Chat with support via WhatsApp for quick assistance.</li>
          <li>Email <strong>support@ayuzee.com</strong> for detailed queries.</li>
        </ul>
      </StepCard>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + B", action: "Book appointment" },
          { keys: "Ctrl + D", action: "Go to dashboard" },
          { keys: "Ctrl + O", action: "View orders" },
          { keys: "Ctrl + H", action: "View health records" },
        ]}
      />
    </GuideLayout>
  );
};

export default PatientGuide;
