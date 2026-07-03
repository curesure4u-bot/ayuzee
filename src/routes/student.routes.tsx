import { Route } from "react-router-dom";
import * as P from "@/routes/lazy/student";
import { withSuspense } from "@/routes/routeUtils";

export const studentRoutes = (
  <>
    <Route path="/student" element={withSuspense(<P.StudentLayout />)}>
      <Route index element={withSuspense(<P.StudentDashboard />)} />
      <Route path="dashboard" element={withSuspense(<P.StudentDashboard />)} />
      <Route path="courses" element={withSuspense(<P.StudentCourses />)} />
      <Route path="webinars" element={withSuspense(<P.StudentWebinars />)} />
      <Route path="jobs" element={withSuspense(<P.StudentJobs />)} />
      <Route path="research" element={withSuspense(<P.StudentResearch />)} />
      <Route path="certificates" element={withSuspense(<P.StudentCertificates />)} />
      <Route path="profile" element={withSuspense(<P.StudentProfilePage />)} />
    </Route>
  </>
);
