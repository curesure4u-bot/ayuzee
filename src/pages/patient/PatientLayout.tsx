import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { AuthLoadingScreen } from "@/components/common/AuthLoadingScreen";

const PatientLayout = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
      else setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/auth", { replace: true });
      else setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return <AuthLoadingScreen />;

  return (
    <div className="min-h-screen bg-muted/30">
      <PatientHeader />
      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <PatientSidebar />
          <div className="min-w-0"><Outlet /></div>
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;
