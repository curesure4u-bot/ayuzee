import { useEntity } from "@/contexts/EntityContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, ArrowLeftRight, CheckCircle2 } from "lucide-react";

const EntitySwitcher = () => {
  const { entities, activeEntity, switchEntity, isLoading } = useEntity();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-1.5 px-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white hover:text-white rounded-md"
        >
          <Building2 className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate">
            {activeEntity?.name?.split(" ").slice(0, 2).join(" ") || "Select Entity"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Entity / Branch
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {entities.map((entity) => (
          <DropdownMenuItem
            key={entity.id}
            className="cursor-pointer flex items-center justify-between py-2"
            onClick={() => {
              if (!entity.isActive) switchEntity(entity.id);
            }}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm truncate font-medium">{entity.name}</p>
                <p className="text-[10px] text-muted-foreground">{entity.city} · {entity.type}</p>
              </div>
            </div>
            {entity.isActive && (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-orange-600 font-medium"
          onClick={() => navigate("/hms/switch-entity")}
        >
          <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
          Manage All Entities
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EntitySwitcher;
