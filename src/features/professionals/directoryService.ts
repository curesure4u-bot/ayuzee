import { previewSupabase as supabase } from '@/integrations/preview/client';
import { createDirectorySource, directoryFields, directoryOrder, DIRECTORY_PAGE_SIZE, directorySearchPattern } from './directoryGateway';
import type { DirectoryReadClient } from './directoryContract';

// Use the no-network preview transport until hosted acceptance, retaining the
// checked candidate contract. No invented objects are added to live schema types.
const directoryClient = supabase as unknown as DirectoryReadClient;

export const doctorDirectory = createDirectorySource(async (filters, signal) => {
  let request = directoryClient.from('doctors_public').select(directoryFields, { count: 'exact' })
    .eq('is_approved', true).eq('public_profile', true);
  if (filters.query) request = request.ilike('full_name', directorySearchPattern(filters.query));
  if (filters.city) request = request.ilike('city', directorySearchPattern(filters.city));
  if (filters.category !== 'All') request = request.eq('category', filters.category);
  if (filters.mode === 'video') request = request.eq('video_available', true);
  if (filters.mode === 'in_clinic') request = request.eq('in_clinic_available', true);
  if (filters.maxFee !== null) request = request.lte('consultation_fee', filters.maxFee);
  const order = directoryOrder[filters.sort];
  const first = (filters.page - 1) * DIRECTORY_PAGE_SIZE;
  return request.order(order.column, { ascending: order.ascending, nullsFirst: false })
    .order('id', { ascending: true }).range(first, first + DIRECTORY_PAGE_SIZE - 1).abortSignal(signal);
});
