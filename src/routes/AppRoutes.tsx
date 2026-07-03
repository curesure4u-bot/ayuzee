import { Routes } from "react-router-dom";
import { redirectRoutes } from "@/routes/redirects.routes";
import { adminRoutes } from "@/routes/admin.routes";
import { atmriRoutes } from "@/routes/atmri.routes";
import { authRoutes } from "@/routes/auth.routes";
import { consultationRoutes } from "@/routes/consultation.routes";
import { diagnosisRoutes } from "@/routes/diagnosis.routes";
import { doctorRoutes } from "@/routes/doctor.routes";
import { gamificationRoutes } from "@/routes/gamification.routes";
import { homeoRoutes } from "@/routes/homeo.routes";
import { learningRoutes } from "@/routes/learning.routes";
import { patientRoutes } from "@/routes/patient.routes";
import { publicRoutes } from "@/routes/public.routes";
import { shopRoutes } from "@/routes/shop.routes";
import { studentRoutes } from "@/routes/student.routes";
import { therapistRoutes } from "@/routes/therapist.routes";
import { vaidyaRoutes } from "@/routes/vaidya.routes";
import { venueRoutes } from "@/routes/venue.routes";

export const AppRoutes = () => (
  <Routes>
    {redirectRoutes}
    {authRoutes}
    {studentRoutes}
    {patientRoutes}
    {consultationRoutes}
    {shopRoutes}
    {diagnosisRoutes}
    {therapistRoutes}
    {venueRoutes}
    {adminRoutes}
    {learningRoutes}
    {vaidyaRoutes}
    {doctorRoutes}
    {atmriRoutes}
    {homeoRoutes}
    {gamificationRoutes}
    {publicRoutes}
  </Routes>
);
