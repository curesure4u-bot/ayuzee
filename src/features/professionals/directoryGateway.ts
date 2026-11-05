import { z } from 'zod';
import { DIRECTORY_PAGE_SIZE, directorySearchPattern, readDirectoryFilters, directoryParams } from './directoryModel';
import type { DirectorySource, DirectoryFilters, DirectoryPage } from './directoryModel';

// Explicit public projection. Never fall back to the private doctors table.
export const directoryFields = 'id,full_name,specialization,category,city,clinic_name,experience_years,consultation_fee,rating,total_reviews,video_available,in_clinic_available,languages,is_verified,is_approved,public_profile' as const;
export const publicDoctorRow = z.object({
  id: z.string().uuid(), full_name: z.string().trim().min(1),
  specialization: z.string().nullable(), category: z.string().nullable(),
  city: z.string().nullable(), clinic_name: z.string().nullable(),
  experience_years: z.number().finite().nonnegative().nullable(),
  consultation_fee: z.number().finite().nonnegative().nullable(),
  rating: z.number().min(0).max(5).nullable(), total_reviews: z.number().int().nonnegative().nullable(),
  video_available: z.boolean().nullable(), in_clinic_available: z.boolean().nullable(),
  languages: z.array(z.string()).nullable(), is_verified: z.boolean().nullable(),
  is_approved: z.literal(true), public_profile: z.literal(true),
});
export interface DirectoryResponse { data: unknown; error: unknown; count: number | null }
export type DirectoryRequest = (filters: DirectoryFilters, signal: AbortSignal) => Promise<DirectoryResponse>;

export function createDirectorySource(request: DirectoryRequest): DirectorySource {
  return {
    async list(input, signal): Promise<DirectoryPage> {
      const filters = readDirectoryFilters(directoryParams(input));
      const response = await request(filters, signal);
      if (signal.aborted) throw new DOMException('Directory request cancelled', 'AbortError');
      if (response.error) throw new Error('The doctor directory could not be loaded. Please try again.');
      const parsed = z.array(publicDoctorRow).max(DIRECTORY_PAGE_SIZE).safeParse(response.data);
      const offset = (filters.page - 1) * DIRECTORY_PAGE_SIZE;
      if (!parsed.success || response.count === null || !Number.isSafeInteger(response.count) || response.count < 0
        || (parsed.data.length > 0 && response.count < offset + parsed.data.length)
        || (parsed.data.length === 0 && response.count > offset)) {
        throw new Error('The doctor directory returned incomplete information. Please try again later.');
      }
      return {
        total: response.count,
        doctors: parsed.data.map(row => ({
          id: row.id, name: row.full_name, specialization: row.specialization, category: row.category,
          city: row.city, clinic: row.clinic_name, experience: row.experience_years,
          fee: row.consultation_fee, rating: row.rating, reviews: row.total_reviews,
          video: row.video_available === true, inClinic: row.in_clinic_available === true,
          languages: row.languages ?? [], verified: row.is_verified === true,
        })),
      };
    },
  };
}

export const directoryOrder = {
  rating: { column: 'rating', ascending: false },
  experience: { column: 'experience_years', ascending: false },
  fee_low: { column: 'consultation_fee', ascending: true },
  fee_high: { column: 'consultation_fee', ascending: false },
} as const;

// Kept here to exercise the actual Supabase query builder with a local fake
// transport, without constructing a hosted/authenticated client in UI tests.
export { DIRECTORY_PAGE_SIZE, directorySearchPattern };
