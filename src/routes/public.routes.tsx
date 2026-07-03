import { Route } from "react-router-dom";
import * as P from "@/routes/lazyPages";
import { withSuspense } from "@/routes/routeUtils";

export const publicRoutes = (
  <>
    <Route path="/" element={withSuspense(<P.Index />)} />
    <Route path="/about-us" element={withSuspense(<P.AboutUs />)} />
    <Route path="/contact" element={withSuspense(<P.Contact />)} />
    <Route path="/press" element={withSuspense(<P.Press />)} />
    <Route path="/refund-policy" element={withSuspense(<P.RefundPolicy />)} />
    <Route path="/privacy-policy" element={withSuspense(<P.PrivacyPolicy />)} />
    <Route path="/terms-of-use" element={withSuspense(<P.TermsOfUse />)} />
    <Route path="/careers" element={withSuspense(<P.Careers />)} />
    <Route path="/blog" element={withSuspense(<P.Blog />)} />
    <Route path="/referral" element={withSuspense(<P.Referral />)} />
    <Route path="/doctors" element={withSuspense(<P.Doctors />)} />
    <Route path="/doctors/:id" element={withSuspense(<P.DoctorDetail />)} />
    <Route path="/clinics" element={withSuspense(<P.Clinics />)} />
    <Route path="/offers" element={withSuspense(<P.Offers />)} />
    <Route path="/search" element={withSuspense(<P.Search />)} />
    <Route path="/jobs" element={withSuspense(<P.Jobs />)} />
    <Route path="/colleges" element={withSuspense(<P.Colleges />)} />
    <Route path="/jobs/post" element={withSuspense(<P.JobPost />)} />
    <Route path="/health-conditions" element={withSuspense(<P.HealthConditions />)} />
    <Route path="/health-conditions/:slug" element={withSuspense(<P.HealthConditionDetail />)} />
    <Route path="/treatments/acupuncture" element={withSuspense(<P.AcupunctureHub />)} />
    <Route path="/acupuncture" element={withSuspense(<P.AcupunctureHub />)} />
    <Route path="/treatments/tung-points" element={withSuspense(<P.TungPoints />)} />
    <Route path="/tung-points" element={withSuspense(<P.TungPoints />)} />
    <Route path="/treatments/acupuncture-300-diseases" element={withSuspense(<P.Acupuncture300Diseases />)} />
    <Route path="/treatments/acupuncture-50-diseases" element={withSuspense(<P.Acupuncture50Diseases />)} />
    <Route path="/treatments/acupuncture-homeopathy" element={withSuspense(<P.AcupunctureHomeopathy />)} />
    <Route path="/treatments/acupoints-uses" element={withSuspense(<P.AcupointsAndUses />)} />
    <Route path="/acupuncture/points" element={withSuspense(<P.AcupointsAndUses />)} />
    <Route path="/acupuncture/homeopathy" element={withSuspense(<P.AcupunctureHomeopathy />)} />
    <Route path="/acupuncture/50-diseases" element={withSuspense(<P.Acupuncture50Diseases />)} />
    <Route path="/acupuncture/300-diseases" element={withSuspense(<P.Acupuncture300Diseases />)} />
    <Route path="/treatments/:slug" element={withSuspense(<P.TreatmentSystem />)} />
    <Route path="/homeopathy" element={withSuspense(<P.HomeopathyHub />)} />
    <Route path="/homeopathy/repertory" element={withSuspense(<P.HomeopathyRepertory />)} />
    <Route path="/homeopathy/materia-medica" element={withSuspense(<P.MateriaMedica />)} />
    <Route path="/homeopathy/materia-medica/:abbreviation" element={withSuspense(<P.MateriaMedica />)} />
    <Route path="/homeopathy/cases" element={withSuspense(<P.HomeopathyCases />)} />
    <Route path="/homeopathy/case/new" element={withSuspense(<P.CaseTakingForm />)} />
    <Route path="/homeopathy/case/:id" element={withSuspense(<P.HomeopathyCases />)} />
    <Route path="/partner" element={withSuspense(<P.Partner />)} />
    <Route path="/partner/apply" element={withSuspense(<P.PartnerApply />)} />
    <Route path="/bulk" element={withSuspense(<P.Bulk />)} />
    <Route path="/therapies" element={withSuspense(<P.Therapies />)} />
    <Route path="/therapists" element={withSuspense(<P.Therapists />)} />
    <Route path="/therapists/:id" element={withSuspense(<P.TherapistDetail />)} />
    <Route path="/therapist/browse" element={withSuspense(<P.TherapistBrowse />)} />
    <Route path="/therapist/:id" element={withSuspense(<P.TherapistDetail />)} />
    <Route path="/therapy-plans/:planId/book" element={withSuspense(<P.BookTherapySession />)} />
    <Route path="/therapy-booking/:sessionId" element={withSuspense(<P.TherapyBooking />)} />
    <Route path="/venue/browse" element={withSuspense(<P.VenueBrowse />)} />
    <Route path="/feed" element={withSuspense(<P.Feed />)} />
    <Route path="/feed/:id" element={withSuspense(<P.FeedPost />)} />
    <Route path="/library" element={withSuspense(<P.Library />)} />
    <Route path="/queue-display/:branchId" element={withSuspense(<P.QueueDisplayScreen />)} />
    <Route path="/food-as-medicine" element={withSuspense(<P.FoodAsMedicine />)} />
    <Route path="/food-as-medicine/:slug" element={withSuspense(<P.FoodAsMedicine />)} />
    <Route path="/essential-drugs" element={withSuspense(<P.EssentialDrugs />)} />
    <Route path="/essential-drugs/:slug" element={withSuspense(<P.EssentialDrugDetail />)} />
    <Route path="/essential-siddha-drugs" element={withSuspense(<P.EssentialSiddhaDrugs />)} />
    <Route path="/essential-siddha-drugs/:slug" element={withSuspense(<P.EssentialSiddhaDrugDetail />)} />
    <Route path="/essential-unani-drugs" element={withSuspense(<P.EssentialUnaniDrugs />)} />
    <Route path="/essential-unani-drugs/:slug" element={withSuspense(<P.EssentialUnaniDrugDetail />)} />
    <Route path="/essential-homeopathy-drugs" element={withSuspense(<P.EssentialHomeopathyDrugs />)} />
    <Route path="/essential-homeopathy-drugs/:slug" element={withSuspense(<P.EssentialHomeopathyDrugDetail />)} />
    <Route path="*" element={withSuspense(<P.NotFound />)} />
  </>
);
