import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Entity = {
  id: string;
  sNo: number;
  name: string;
  key: string;
  type: "hospital" | "clinic" | "franchise" | "branch" | "wellness-center";
  city?: string;
  address?: string;
  isActive: boolean;
};

type EntityContextValue = {
  entities: Entity[];
  activeEntity: Entity | null;
  switchEntity: (entityId: string) => void;
  isLoading: boolean;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const EntityContext = createContext<EntityContextValue | undefined>(undefined);

export const EntityProvider = ({ children }: { children: ReactNode }) => {
  // Start with empty entities - users will add their own hospitals/branches
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeEntity = entities.find((e) => e.isActive) || null;

  const switchEntity = useCallback((entityId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setEntities((prev) =>
        prev.map((e) => ({ ...e, isActive: e.id === entityId }))
      );
      const switched = entities.find((e) => e.id === entityId);
      setIsLoading(false);
      toast.success(`Switched to: ${switched?.name || "entity"}`);
    }, 300);
  }, [entities]);

  return (
    <EntityContext.Provider value={{ entities, activeEntity, switchEntity, isLoading }}>
      {children}
    </EntityContext.Provider>
  );
};

export const useEntity = (): EntityContextValue => {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error("useEntity must be used within EntityProvider");
  return ctx;
};
