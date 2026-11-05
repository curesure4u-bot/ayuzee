import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';
import type { publicDoctorRow } from './directoryGateway';

// Proposed projection contract, deliberately separate from generated live
// schema types. The 4 November hosted inspection found doctors_public absent.
// Its migration and direct API tests must pass before releasing the directory.
type DirectoryDatabase = {
  public: {
    Tables: Record<never, never>;
    Views: { doctors_public: { Row: z.infer<typeof publicDoctorRow>; Relationships: [] } };
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
export type DirectoryReadClient = Pick<SupabaseClient<DirectoryDatabase>, 'from'>;
