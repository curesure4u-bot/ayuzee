export const DIRECTORY_PAGE_SIZE = 12;
export const DIRECTORY_MAX_PAGE = 1000;
export const categories = ['All', 'Ayurveda', 'Yoga', 'Naturopathy', 'Homeopathy', 'Siddha', 'Unani'] as const;
export const directorySorts = ['rating', 'experience', 'fee_low', 'fee_high'] as const;
export type DirectorySort = typeof directorySorts[number];
export type ConsultationMode = 'any' | 'video' | 'in_clinic';

export interface DirectoryFilters {
  query: string;
  city: string;
  category: typeof categories[number];
  mode: ConsultationMode;
  maxFee: number | null;
  sort: DirectorySort;
  page: number;
}
export interface PublicDoctor {
  id: string;
  name: string;
  specialization: string | null;
  category: string | null;
  city: string | null;
  clinic: string | null;
  experience: number | null;
  fee: number | null;
  rating: number | null;
  reviews: number | null;
  video: boolean;
  inClinic: boolean;
  languages: string[];
  verified: boolean;
}
export interface DirectoryPage {
  doctors: PublicDoctor[];
  total: number;
}
export interface DirectorySource {
  list(filters: DirectoryFilters, signal: AbortSignal): Promise<DirectoryPage>;
}
const text = (value: string | null) => (value ?? '').trim().slice(0, 80);
export function readDirectoryFilters(params: URLSearchParams): DirectoryFilters {
  const category = params.get('category');
  const mode = params.get('mode');
  const sort = params.get('sort');
  const page = Number(params.get('page'));
  const fee = params.get('maxFee');
  const number = Number(fee);
  return {
    query: text(params.get('q')), city: text(params.get('city')),
    category: categories.find(item => item === category) ?? 'All',
    mode: mode === 'video' || mode === 'in_clinic' ? mode : 'any',
    maxFee: fee !== null && fee.trim() !== '' && Number.isFinite(number) && number >= 0 && number <= 1_000_000 ? number : null,
    sort: directorySorts.find(item => item === sort) ?? 'rating',
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, DIRECTORY_MAX_PAGE) : 1,
  };
}
export function directoryParams(filters: DirectoryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.city) params.set('city', filters.city);
  if (filters.category !== 'All') params.set('category', filters.category);
  if (filters.mode !== 'any') params.set('mode', filters.mode);
  if (filters.maxFee !== null) params.set('maxFee', String(filters.maxFee));
  if (filters.sort !== 'rating') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

// These are text filters, not raw PostgREST logical expressions. Escape LIKE
// wildcards; '*' is PostgREST's alias for '%' and must not broaden a search.
export function directorySearchPattern(value: string): string {
  const literal = value.replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();
  return `%${literal.replace(/[\\%_]/g, '\\$&')}%`;
}
