import { Brain } from "lucide-react";
import { GuideLayout, StepCard, TipBox, KeyboardShortcuts } from "./GuideLayout";

const AiToolsGuide = () => {
  return (
    <GuideLayout
      title="AI Tools Playbook"
      subtitle="How to use AI Scribe, CDSS, Copilot, Records Analyser, Voice Interface, and other AI features"
      icon={Brain}
      color="bg-purple-500/10 text-purple-600"
      estimatedTime="15 min"
      roles={["Doctor", "Admin", "All Staff"]}
    >
      <h2>1. AI Tools Overview</h2>
      <StepCard number={1} title="Available AI tools in HMS">
        <ul>
          <li><strong>AI Hub:</strong> Central dashboard for all AI features (<code>/hms/ai-hub</code>)</li>
          <li><strong>AI Scribe:</strong> Auto-generates clinical notes from consultations</li>
          <li><strong>AI Clinical Support:</strong> Clinical decision support during consultations</li>
          <li><strong>CDSS:</strong> Drug interaction warnings, allergy alerts, contraindication checks</li>
          <li><strong>AI Copilot:</strong> Real-time suggestions during consultation</li>
          <li><strong>Voice Interface:</strong> Voice commands for hands-free operation</li>
          <li><strong>Records Analyser:</strong> AI analysis of uploaded patient documents</li>
          <li><strong>AI Chatbot:</strong> Patient-facing FAQ and triage bot</li>
          <li><strong>MedAssist:</strong> AI medical reference assistant</li>
          <li><strong>Document Parser:</strong> Extract structured data from PDFs/images</li>
          <li><strong>Conflict Detection:</strong> Scheduling and resource conflict alerts</li>
          <li><strong>Voice Agent:</strong> AI phone agent for appointment booking</li>
        </ul>
      </StepCard>

      <h2>2. AI Scribe (Clinical Documentation)</h2>
      <StepCard number={1} title="How AI Scribe works">
        <ul>
          <li>Navigate to <strong>HMS → AI Scribe</strong> (<code>/hms/ai-scribe</code>).</li>
          <li>During a consultation, AI Scribe listens (with patient consent) and auto-generates structured clinical notes.</li>
          <li>Output format: SOAP note (Subjective, Objective, Assessment, Plan) or AYUSH-specific format.</li>
          <li>Doctor reviews, edits if needed, and approves. Saves to patient record.</li>
        </ul>
      </StepCard>

      <StepCard number={2} title="Best practices for AI Scribe">
        <ul>
          <li>Speak clearly and use standard medical terminology.</li>
          <li>State patient's name at the start so AI links to correct record.</li>
          <li>Mention: Complaints, duration, associated symptoms, examination findings, diagnosis, plan.</li>
          <li>AI handles multiple languages (English, Hindi, Tamil) — auto-detects.</li>
          <li>Always review output before saving — AI is assistive, not final.</li>
        </ul>
      </StepCard>

      <TipBox>
        <p>AI Scribe reduces documentation time by 60-70%. A 15-minute consultation that took 10 minutes to document now takes 2 minutes to review and approve.</p>
      </TipBox>

      <h2>3. CDSS (Clinical Decision Support)</h2>
      <StepCard number={1} title="Automatic alerts">
        <ul>
          <li>Navigate to <strong>HMS → CDSS</strong> (<code>/hms/cdss</code>).</li>
          <li>CDSS runs automatically during prescription writing and flags:</li>
          <ul>
            <li>🔴 <strong>Drug-Drug interactions:</strong> Contraindicated combinations</li>
            <li>🟠 <strong>Drug-Allergy:</strong> Patient has documented allergy to prescribed drug class</li>
            <li>🟡 <strong>Dose alerts:</strong> Unusual dose (too high/low for patient age/weight)</li>
            <li>🔵 <strong>Duplicate therapy:</strong> Same drug class already prescribed</li>
            <li>🟢 <strong>Ayurvedic:</strong> Viruddha Ahara (incompatible combinations), Dosha-inappropriate formulation</li>
          </ul>
        </ul>
      </StepCard>

      <StepCard number={2} title="Responding to CDSS alerts">
        <ul>
          <li><strong>Red (Critical):</strong> Must acknowledge and either change prescription or document override reason.</li>
          <li><strong>Orange (Important):</strong> Review and decide — override with reason if clinically justified.</li>
          <li><strong>Yellow (Informational):</strong> Note and continue if aware.</li>
          <li>All overrides logged in audit trail for medico-legal protection.</li>
        </ul>
      </StepCard>

      <h2>4. AI Copilot (Consultation Assistant)</h2>
      <StepCard number={1} title="Using AI Copilot">
        <ul>
          <li>Navigate to <strong>HMS → AI Copilot</strong> (<code>/hms/ai-copilot</code>).</li>
          <li>During consultation, AI Copilot provides real-time suggestions:</li>
          <ul>
            <li>Differential diagnoses based on symptoms entered</li>
            <li>Recommended investigations for the suspected condition</li>
            <li>Classical Ayurvedic formulations matching the diagnosis + Prakriti</li>
            <li>Similar past cases and their outcomes</li>
            <li>Evidence-based treatment protocols</li>
          </ul>
          <li>Appears as a side panel — doesn't interrupt workflow.</li>
          <li>Click to accept suggestion or dismiss.</li>
        </ul>
      </StepCard>

      <h2>5. Voice Interface</h2>
      <StepCard number={1} title="Hands-free operation">
        <ul>
          <li>Navigate to <strong>HMS → Voice Interface</strong> (<code>/hms/voice-interface</code>).</li>
          <li>Voice commands for common actions:</li>
          <ul>
            <li>"Open patient [name]" — Searches and opens patient record</li>
            <li>"Start prescription" — Opens prescription panel</li>
            <li>"Add [medicine name]" — Adds to prescription</li>
            <li>"Next patient" — Moves to next in queue</li>
            <li>"Order CBC" — Adds investigation to order</li>
            <li>"Schedule follow-up in 7 days" — Creates follow-up</li>
          </ul>
          <li>Useful during examination when hands are busy.</li>
        </ul>
      </StepCard>

      <h2>6. Records Analyser</h2>
      <StepCard number={1} title="Analyse uploaded documents">
        <ul>
          <li>Navigate to <strong>HMS → Records Analyser</strong> (<code>/hms/records-analyser</code>).</li>
          <li>Upload: Old prescriptions, lab reports, discharge summaries (PDF/image).</li>
          <li>AI extracts: Diagnoses, medications, lab values, allergies, and structures them.</li>
          <li>Structured data can be imported into patient record.</li>
          <li>Saves time when patient brings a stack of old papers.</li>
        </ul>
      </StepCard>

      <h2>7. Document Parser</h2>
      <StepCard number={1} title="Bulk document processing">
        <ul>
          <li>Navigate to <strong>HMS → Document Parser</strong>.</li>
          <li>Batch process: Multiple documents at once for data extraction.</li>
          <li>Use cases: Importing patient records from another system, digitizing paper files, processing insurance documents.</li>
          <li>AI extracts key fields and presents for human review before saving.</li>
        </ul>
      </StepCard>

      <h2>8. AI Chatbot (Patient-Facing)</h2>
      <StepCard number={1} title="Setup and capabilities">
        <ul>
          <li>Navigate to <strong>HMS → AI Chatbot</strong> (<code>/hms/chatbot</code>).</li>
          <li>Patient-facing chatbot on website/WhatsApp that handles:</li>
          <ul>
            <li>FAQ answering (timing, location, services, pricing)</li>
            <li>Appointment booking (guided flow)</li>
            <li>Symptom triage (basic — directs to appropriate department)</li>
            <li>Order tracking (medicine delivery status)</li>
            <li>Report availability check</li>
          </ul>
          <li>Escalates to human when: Complex query, complaint, or patient requests it.</li>
        </ul>
      </StepCard>

      <h2>9. MedAssist (Reference AI)</h2>
      <StepCard number={1} title="Medical knowledge queries">
        <ul>
          <li>Navigate to <strong>HMS → MedAssist</strong>.</li>
          <li>Ask clinical questions and get evidence-based answers:</li>
          <ul>
            <li>"What is the Ayurvedic management for Gridhrasi?"</li>
            <li>"Dosage of Guggulu Tiktaka Ghrita for disc herniation"</li>
            <li>"Contraindications of Virechana in pregnancy"</li>
            <li>"Classical reference for Kati Basti procedure"</li>
          </ul>
          <li>Sources: AFI, AYUSH clinical guidelines, Charaka/Sushruta texts, modern spine research.</li>
          <li>Cites references for verification.</li>
        </ul>
      </StepCard>

      <h2>10. Smart Consultation (SOAP Notes)</h2>
      <StepCard number={1} title="AI-assisted SOAP documentation">
        <ul>
          <li>Navigate to <strong>HMS → Smart Consultation</strong> (<code>/hms/doctor-soap-notes</code>).</li>
          <li>Template-based documentation with AI auto-fill:</li>
          <li><strong>S</strong> (Subjective): Patient's complaints → AI suggests associated symptoms to ask.</li>
          <li><strong>O</strong> (Objective): Examination findings → AI auto-formats structured findings.</li>
          <li><strong>A</strong> (Assessment): Diagnosis → AI suggests differentials and ICD/NaMaSTE codes.</li>
          <li><strong>P</strong> (Plan): Treatment → AI suggests protocols based on diagnosis + patient profile.</li>
        </ul>
      </StepCard>

      <TipBox title="AI Ethics">
        <p>AI tools are <strong>assistive, not autonomous</strong>. Every AI suggestion requires doctor review and approval before it affects patient care. The doctor always makes the final clinical decision.</p>
      </TipBox>

      <KeyboardShortcuts
        shortcuts={[
          { keys: "Ctrl + I", action: "Open AI Hub" },
          { keys: "Ctrl + /", action: "Ask AI Copilot" },
          { keys: "Alt + V", action: "Activate voice interface" },
          { keys: "Ctrl + Shift + S", action: "Start AI Scribe" },
          { keys: "Ctrl + Shift + D", action: "View CDSS alerts" },
        ]}
      />
    </GuideLayout>
  );
};

export default AiToolsGuide;
