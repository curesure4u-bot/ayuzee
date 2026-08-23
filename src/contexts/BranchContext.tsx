import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BranchContextType {
  currentBranch: string;
  setBranch: (branch: string) => void;
  branches: string[];
  loading: boolean;
}

const BranchContext = createContext<BranchContextType>({
  currentBranch: "Main Branch",
  setBranch: () => {},
  branches: ["Main Branch"],
  loading: false,
});

export const useBranch = () => useContext(BranchContext);

const BRANCH_STORAGE_KEY = "ayuzee_current_branch";

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [currentBranch, setCurrentBranch] = useState<string>(() => {
    return localStorage.getItem(BRANCH_STORAGE_KEY) || "Main Branch";
  });
  const [branches, setBranches] = useState<string[]>(["Main Branch"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranches = async () => {
      // Try to load branches from hms_wards (they have branch field)
      // or from a dedicated branches table if it exists
      try {
        const { data } = await (supabase as any)
          .from("hms_op_patients")
          .select("branch")
          .not("branch", "is", null)
          .limit(100);

        if (data) {
          const unique = [...new Set((data as any[]).map((d) => d.branch).filter(Boolean))] as string[];
          if (unique.length > 0) {
            setBranches(unique.sort());
          }
        }
      } catch {
        // Fallback: use default branches
        setBranches(["Main Branch", "Kadayanallur", "Rajapalayam", "Theni", "Chennai"]);
      }
      setLoading(false);
    };

    loadBranches();
  }, []);

  const setBranch = (branch: string) => {
    setCurrentBranch(branch);
    localStorage.setItem(BRANCH_STORAGE_KEY, branch);
  };

  return (
    <BranchContext.Provider value={{ currentBranch, setBranch, branches, loading }}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchContext;
