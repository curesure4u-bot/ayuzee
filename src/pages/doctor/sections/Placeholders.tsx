import { Card } from "@/components/ui/card";
import { Gift, LayoutGrid, Building2, Headphones } from "lucide-react";

const Placeholder = ({ title, icon: Icon, message }: { title: string; icon: React.ElementType; message: string }) => (
  <div className="mx-auto max-w-3xl">
    <Card className="p-10 text-center">
      <Icon className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-4 font-display text-2xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
    </Card>
  </div>
);

export const DoctorRewards = () => (
  <Placeholder title="My Rewards" icon={Gift} message="Earn rewards on every successful consultation, prescription and bulk purchase. Coming soon." />
);
export const DoctorCategory = () => (
  <Placeholder title="Category" icon={LayoutGrid} message="Manage product and treatment categories you offer. Coming soon." />
);
export const DoctorCompany = () => (
  <Placeholder title="Company" icon={Building2} message="Manage your company / pharmacy partnership details. Coming soon." />
);
export const DoctorSupport = () => (
  <Placeholder title="Support" icon={Headphones} message="Need help? Email support@ayuzee.com or call +91 90000 00000." />
);
