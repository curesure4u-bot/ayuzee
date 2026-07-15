import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export const AdminPlaceholder = ({ title, description }: { title: string; description?: string }) => (
  <div className="space-y-6">
    <div>
      <h1 className="font-display text-3xl">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Construction className="h-10 w-10 text-primary" />
        <p className="font-medium">Coming soon</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This admin section is scaffolded and ready. Tell me what data and actions you'd like here, and I'll wire it up.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default AdminPlaceholder;
