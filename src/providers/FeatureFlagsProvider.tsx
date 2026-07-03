import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { FEATURE_DEFAULTS, type FeatureKey } from "@/lib/features";

type FlagMap = Record<string, boolean>;

type FeatureFlagsContextValue = {
  ready: boolean;
  isEnabled: (key: FeatureKey) => boolean;
};

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  ready: false,
  isEnabled: (key) => FEATURE_DEFAULTS[key] ?? false,
});

const showAllInDev =
  import.meta.env.DEV && import.meta.env.VITE_HIDE_INCOMPLETE !== "true";

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const [flags, setFlags] = useState<FlagMap>({});
  const [ready, setReady] = useState(showAllInDev);

  useEffect(() => {
    if (showAllInDev) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("feature_flags")
        .select("key, enabled");

      if (cancelled) return;

      if (error) {
        console.warn("[feature-flags] load failed:", error.message);
        setReady(true);
        return;
      }

      const map: FlagMap = {};
      for (const row of data ?? []) {
        map[row.key as string] = Boolean(row.enabled);
      }
      setFlags(map);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isEnabled = useCallback(
    (key: FeatureKey) => {
      if (showAllInDev) return true;
      if (key in flags) return flags[key];
      return FEATURE_DEFAULTS[key] ?? false;
    },
    [flags],
  );

  const value = useMemo(() => ({ ready, isEnabled }), [ready, isEnabled]);

  return (
    <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext);
