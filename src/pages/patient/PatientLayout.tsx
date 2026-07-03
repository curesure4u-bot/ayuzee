import { Outlet } from "react-router-dom";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { ProtectedRoute } from "@/providers/ProtectedRoute";

const PatientLayout = () => (
  <ProtectedRoute redirectTo="/auth">
    <div className="min-h-screen bg-muted/30">
      <PatientHeader />
      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <PatientSidebar />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  </ProtectedRoute>
);

export default PatientLayout;
