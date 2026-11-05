// Build the business review list and public preview descriptions from retained source.
import{readFileSync,writeFileSync,readdirSync}from'node:fs';
import{resolve}from'node:path';
import{fileURLToPath}from'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));const read=p=>readFileSync(resolve(root,p),'utf8');
const inventory=JSON.parse(read('docs/review/preview-feature-inventory.json'));
const sqlFiles=['supabase/migrations','supabase/review-candidates','scripts'].flatMap(dir=>readdirSync(resolve(root,dir)).filter(n=>n.endsWith('.sql')).map(n=>dir+'/'+n));
const sql=sqlFiles.map(path=>({path,body:read(path)}));
const clean=s=>s.replace(/&amp;/g,'&').replace(/&apos;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
function category(feature){const p=feature.source.toLowerCase();if(/wallet|reward|payout|membership|quiz|course|learning|student|beyond|gamification|coin/.test(p))return['Wallets, rewards and learning',4];if(/hms|vaidya|spine|prescription|clinical|patient|homeo|formulary|afi|essential|astg|hijam|parasurg/.test(p))return['Care and hospital workflows',6];if(/therapist|venue|appointment|consult|panchakarma|provider|booking/.test(p))return['Bookings and therapy workflows',5];if(/product|shop|bulk|orders|manufactur|coupon|shipment|b2b/.test(p))return['Commerce and supply',3];if(/post|feed|blog|community|directory/.test(p))return['Community and publishing',2];if(/role|auth|doctoradmin|hmsaccess|profileapproval/.test(p))return['Accounts and role administration',1];return['Administration, tools and integrations',7];}
const special={
 'pages-Bulk':['Bulk buying and tier pricing','Show bulk purchase quantities and price tiers for products.'],
 'pages-Dashboard':['Patient overview','Bring appointments, assessments, prescriptions and care information into a patient overview.'],
 'pages-DoctorDetail':['Doctor profile and services','Show a doctor’s public profile, services and supported care or charity options.'],
 'pages-JobAIMatch':['Job matching','Compare a professional’s profile with job opportunities to help identify relevant openings.'],
 'pages-PartnerApply':['Partner network applications','Collect and review applications to join Ayuzee’s clinic or service-partner network.'],
 'pages-Referral':['Referral rewards','Let users share referral links and review the resulting referral and reward records.'],
 'pages-admin-AdminFeatureFlags':['Platform feature controls','Let authorized operators manage which platform features are available.'],
};

// Describe workflows rather than publishing sample numbers, success states or
// marketing promises extracted from an unfinished screen.
const intendedUses={
 Therapies:'Browse the planned therapy catalogue and its practitioner or referral requirements.',
 ASTGGroupEditor:'Edit the content, coding and review fields for treatment-guideline groups.',
 ASTGManagement:'Organize treatment-guideline protocols for practitioner reference.',
 AdminAfiManagement:'Review imported formulation drafts before making them available to practitioners.',
 MusculoskeletalReference:'Browse the planned musculoskeletal reference, coding and guideline material.',
 AtmriHelp:'Explain the proposed charitable-care programme and how cases would be supported.',
 CasesList:'List charitable-care cases with access restricted according to the approved privacy model.',
 DoctorPledge:'Let practitioners apply to participate in the proposed charitable-care programme.',
 PartnerHospitals:'Browse hospitals participating in the proposed charitable-care programme.',
 PostConsultationFeedback:'Collect a patient’s feedback on a completed consultation.',
 PreConsultationForm:'Collect patient-provided information for clinician review before a consultation.',
 GutHealthAssessment:'Collect a gut-health assessment for review by the assigned practitioner.',
 SpineAssessment:'Collect a spine assessment for review by the assigned practitioner.',
 ClassicalFormulary:'Browse a practitioner reference of classical formulations and manufacturers.',
 DoctorHome:'Bring practitioner work queues, care tools and account information into one overview.',
 GutHealthReviewQueue:'Let an assigned practitioner review submitted gut-health assessments.',
 JihvaReviewQueue:'Let an assigned practitioner review submitted tongue observations and draft notes.',
 MutraBinduReviewQueue:'Let an assigned practitioner review submitted urine-drop observations and draft notes.',
 AyuzeeMoney:'Show proposed loyalty balances, earning rules and redemption terms after financial review.',
 DoctorCompany:'View and manage the company details associated with a practitioner’s account.',
 DoctorRewards:'Review proposed practitioner rewards and their eligibility rules.',
 EssentialHomeopathyDrugs:'Browse the planned homeopathy medicine reference and its source material.',
 HmsDashboard:'Bring hospital work queues, operational summaries and reporting into one overview.',
 HmsOpd:'Register and manage outpatient visits, including finding an existing patient record.',
 PackageMaster:'Configure service packages and the prices used by approved billing workflows.',
 RatePlanMaster:'Manage billing rate plans and their associations with services or packages.',
 SuggestionMaster:'Review and manage reusable suggestions for practitioner and patient workflows.',
 CaseTakingForm:'Record a structured homeopathy case history for practitioner review.',
 MateriaMedica:'Browse the planned homeopathy remedy reference and its source material.',
 NewPatient:'Register patient demographics and the presenting concern before case-taking.',
 RepertorisationEngine:'Compare recorded case rubrics against remedy-reference data for practitioner review.',
 Repertory:'Search the planned homeopathy rubric reference.',
 EmotionalEngine:'Record emotional themes and compare reference mappings for practitioner review.',
 HomeopathyRepertory:'Search the planned homeopathy rubric reference and inspect its source material.',
 Certificate:'Display a course completion certificate only after completion has been verified.',
 AshtavidhaReports:'Show the signed-in patient’s practitioner-recorded examination reports.',
 JihvaPariksha:'Collect tongue observations for review by an assigned practitioner.',
 MalaPareekshaReports:'Show the signed-in patient’s practitioner-reviewed stool-assessment records.',
 MutraBinduPariksha:'Collect urine-drop observations for review by an assigned practitioner.',
 NetraPariksha:'Collect eye observations for review by an assigned practitioner.',
 PatientPanchakarmaJourney:'Show the patient’s assigned therapy schedule, progress and follow-up records.',
 ProviderHome:'Show a provider’s application status, required documents and approved workspace entry.',
 AyushSurgicals:'Browse the proposed catalogue of practitioner equipment and surgical supplies.',
 PrescriptionCart:'Review proposed medicine matches to a prescription before an approved order workflow.',
 PrescriptionUpload:'Submit a prescription for authorized review and a subsequent price quote.',
 TherapistPanchakarmaSession:'Record an assigned therapy session and escalate flagged events to the supervising practitioner.',
 SpineReviewQueue:'Let an assigned practitioner review submitted spine assessments.',
 VaidyaHome:'Bring a practitioner’s patients, appointments, billing and care queues into one overview.',
 HmsUltraDashboard:'Provide an overview of the proposed hospital and clinical workspaces.',
 ParaSurgicalCaseDetail:'Review a para-surgical case, its assessments and practitioner notes.',
 ParaSurgicalDashboard:'Organize para-surgical case records and practitioner work queues.',
 Ashtavidha:'Record the structured examination fields used in the proposed practitioner workflow.',
 Hijama:'Record assessments and practitioner-reviewed plans for the proposed Hijama workflow.',
 Panchakarma:'Plan and review a patient’s therapy course, schedule and practitioner notes.',
 PanchakarmaAdverseEvents:'Review flagged therapy sessions, record corrective actions and decide the next permitted workflow step.',
 PanchakarmaVenues:'Register therapy venues and review their licence details and approval status.',
 DoctorProfile:'View and edit the signed-in practitioner’s profile.',
 DoctorVerification:'Collect and review practitioner credentials before granting verified status.',
 MedicineSubscription:'Manage proposed repeat medicine orders and their approved subscription terms.',
};

for(const f of inventory.features){const source=read(f.retainedSource),[group,phase]=category(f);f.category=group;f.plannedPhase=phase;f.sourceHeading??=f.title;f.title=f.source.split('/').at(-1).replace(/\.tsx?$/,'').replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/([A-Z])([A-Z][a-z])/g,'$1 $2').replace(/^Hms /,'Hospital ').replace(/^Admin /,'Administration — ');
 const descriptive=[...source.matchAll(/<p\b[^>]*>([^<{}]{25,400})<\/p>/g)].map(m=>clean(m[1])).find(s=>!/^Loading|^No |^Unable|^Failed|not found|click here|try again|sign in|delete|are you sure/i.test(s));
 if(special[f.featureId]){[f.title,f.purpose]=special[f.featureId];f.purposeSource='Workflow inferred from the preserved implementation';}
 else{f.purpose=descriptive??`Provide the ${f.title.toLowerCase()} workflow in the ${group.toLowerCase()} area.`;f.purposeSource=descriptive?'Description found in the preserved screen':'Module and route inference; validate intended use';}
 const moduleName=f.source.split('/').at(-1).replace(/\.tsx?$/,'');
 f.sourceDescription=descriptive??null;
 if(intendedUses[moduleName]){f.purpose=intendedUses[moduleName];f.purposeSource='Workflow inferred from the preserved implementation; validate intended use';}
 const effects=[];for(const[pattern,label]of[[/jspdf|pdfmake|generatePDF|downloadPDF|html2pdf/i,'PDF export'],[/pptxgenjs|PowerPoint/i,'Presentation export'],[/whatsapp|wa\.me/i,'WhatsApp link or messaging'],[/telegram|t\.me\//i,'Telegram integration'],[/send-email|resend|mailto:|email notification/i,'Email'],[/openai|AI.*generat|generat.*AI|gemini/i,'AI-assisted processing'],[/export.*csv|csv.*export/i,'CSV export'],[/upload|storage\.from/i,'File uploads or downloads'],[/payment|payout|razorpay|wallet/i,'Financial or reward records']])if(pattern.test(source))effects.push(label);f.extras=effects;
 f.sqlPlans=Object.fromEntries(f.missingApis.map(name=>[name,sql.filter(s=>new RegExp('CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:TABLE|VIEW|FUNCTION)\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:public\\.)?"?'+name+'\\b','i').test(s.body)).map(s=>s.path)]));
}
inventory.scope='User-approved explicit previews: implementations and SQL plans retained; no feature permanently removed. Active previews perform no backend actions. Descriptions state intended use, not verified product behavior.';
writeFileSync(resolve(root,'docs/review/preview-feature-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
const runtime=inventory.features.map(({featureId,title,purpose,routes})=>({featureId,title,purpose,routes}));
writeFileSync(resolve(root,'src/features/previews/catalog.ts'),`// Generated by scripts/feature-review.mjs. Public descriptions only; no internal API metadata.\nimport type{FeaturePreviewRecord}from './types';\nexport const featurePreviews:readonly FeaturePreviewRecord[]=${JSON.stringify(runtime,null,2)};\n`);
const groups=[...new Set(inventory.features.map(f=>f.category))];
const lines=['# Preserved features — keep/remove review','',`5 November 2026 · ${inventory.previewScreens} preview screens · ${inventory.retainedFiles} original modules preserved.`,'','Sai approved preserving these unfinished features as explicit previews while deciding which to keep. No feature in this inventory was permanently removed. The previews do not load private records, save changes, charge users or send messages. Original code is retained byte-for-byte under `retained-previews/`; existing SQL plans remain in their original locations.','', 'The active application is typechecked normally. Retained historical implementations are not wired into the app. Restoring one requires reviewed backend contracts, scoped permissions and tests; existing generated live types must not be fabricated to represent these drafts.','', 'Descriptions are intended-use evidence from the original screen text or a labelled inference. They need business validation; they are not claims that the feature works. A suggested later phase is categorization only.','', '| Area | Preview screens |','| --- | ---: |',...groups.map(g=>`| ${g} | ${inventory.features.filter(f=>f.category===g).length} |`),'','### Optional integration references','', '| Source reference | Preview screens |','| --- | ---: |', ...[...new Set(inventory.features.flatMap(f=>f.extras))].map(label=>`| ${label} | ${inventory.features.filter(f=>f.extras.includes(label)).length} |`),'', 'For each row, decide **Keep**, **Remove**, **Later**, or **Need explanation**. No removal follows automatically. API lists, SQL-plan paths, source provenance and retention hashes are in [the detailed inventory](preview-feature-inventory.json).',''];
const escape=s=>s.replace(/\|/g,'\\|').replace(/\n/g,' ');
for(const group of groups){lines.push('## '+group,'','| Feature | Intended use | Entry points | Optional outputs/integrations | Decision |','| --- | --- | --- | --- | --- |');for(const f of inventory.features.filter(f=>f.category===group))lines.push(`| [${escape(f.title)}](../../${f.retainedSource}) | ${escape(f.purpose)} | ${f.routes.map(r=>'`'+r+'`').join(', ')||'Supporting screen'} | ${f.extras.join('; ')||'No optional integration detected'} | ${escape(f.decision)} |`);lines.push('');}
lines.push('## Locally implemented areas awaiting hosted acceptance','','The new account/RBAC, directory, community and commerce modules are separate from the retained historical modules. Their scoped models and local tests are preserved. Seven directory/community/commerce transports now use a no-network preview adapter until the corresponding backend is accepted. This does not undo the verified local SQL workflows or claim a live rollout. Phase 3 is 8/8 local and 0/8 hosted; Phase 4 ledger work is local and in progress. These core areas should be evaluated using the phase ledger, not confused with an unused historical screen.','','The listed extras are inferred from source references. A WhatsApp or email reference may be a link rather than an automated integration; verify the detailed source before deciding. “No optional integration detected” is not a security certification.','');
writeFileSync(resolve(root,'docs/review/FEATURES_FOR_DECISION.md'),lines.join('\n'));
console.log(`Updated ${inventory.features.length} feature descriptions, runtime previews and the decision inventory.`);
