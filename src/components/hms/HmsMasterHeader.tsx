import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const HmsMasterHeader = ({ title, description, actions }: Props) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <Zap className="mr-1 h-3 w-3" />HMS Tools Ultra
        </Badge>
      </div>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export default HmsMasterHeader;
