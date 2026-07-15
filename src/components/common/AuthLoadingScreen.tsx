import { PageLoader } from "@/components/common/PageLoader";

interface AuthLoadingScreenProps {
  label?: string;
}

export const AuthLoadingScreen = ({ label = "Checking your session…" }: AuthLoadingScreenProps) => (
  <div className="min-h-screen bg-muted/30">
    <PageLoader label={label} />
  </div>
);
