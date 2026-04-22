import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export const PatientPlaceholder = ({ title, description }: { title: string; description?: string }) => (
  <div>
    <h1 className="mb-6 font-display text-3xl">{title}</h1>
    <Card>
      <CardContent className="grid place-items-center gap-3 py-16 text-center">
        <Construction className="h-10 w-10 text-muted-foreground" />
        <div className="font-medium">Coming soon</div>
        <p className="max-w-sm text-sm text-muted-foreground">{description ?? "This section is being prepared."}</p>
      </CardContent>
    </Card>
  </div>
);

export default PatientPlaceholder;
