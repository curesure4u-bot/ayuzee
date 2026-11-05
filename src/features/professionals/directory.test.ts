import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDirectorySource, directoryFields } from './directoryGateway';
import { directoryParams, readDirectoryFilters, directorySearchPattern } from './directoryModel';
import { doctorDirectory } from './directoryService';

const transport = vi.hoisted(() => ({ fetch: vi.fn() }));
// Inspect the candidate query through a synthetic transport. The production
// preview adapter itself is tested separately to reject calls without a network.
vi.mock('@/integrations/preview/client', async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return { previewSupabase: createClient('https://directory.example.invalid', 'synthetic-public-key', {
    accessToken: async () => null,
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: transport.fetch },
  }) };
});
const row = () => ({
  id: '00000000-0000-4000-8000-000000000001', full_name: 'Dr Example', specialization: null,
  category: 'Ayurveda', city: 'Example City', clinic_name: null, experience_years: null,
  consultation_fee: 0, rating: null, total_reviews: 0, video_available: null,
  in_clinic_available: true, languages: null, is_verified: null, is_approved: true, public_profile: true,
});
const filters = (value = '') => readDirectoryFilters(new URLSearchParams(value));
const signal = () => new AbortController().signal;
beforeEach(() => vi.resetAllMocks());

describe('directory filters and public data contract', () => {
  it('bounds malformed URL state without an arbitrary default fee cap', () => {
    const result = filters('page=999999&sort=private_email&category=unknown&mode=evil&maxFee=-1&q=' + 'a'.repeat(90));
    expect(result).toMatchObject({ page: 1000, sort: 'rating', category: 'All', mode: 'any', maxFee: null });
    expect(result.query).toHaveLength(80);
    for (const page of ['NaN', '-1', '1.5', 'Infinity']) expect(filters(`page=${page}`).page).toBe(1);
    expect(filters().maxFee).toBeNull();
  });
  it('round-trips a bookmark and preserves a real zero fee filter', () => {
    const input = filters('q=Dr+Example&city=Chennai&category=Siddha&mode=video&maxFee=0&sort=fee_low&page=2');
    expect(readDirectoryFilters(directoryParams(input))).toEqual(input);
    expect(directorySearchPattern('10%_test\\name')).toBe('%10\\%\\_test\\\\name%');
    expect(directorySearchPattern('name*')).toBe('%name%');
  });
  it('keeps unknown facts unknown, preserves zero, and returns only a public DTO', async () => {
    const source = createDirectorySource(async () => ({ data: [{ ...row(), private_email: 'must-not-leave-adapter@example.invalid' }], count: 1, error: null }));
    const result = await source.list(filters(), signal());
    expect(result.doctors[0]).toMatchObject({ fee: 0, experience: null, rating: null, video: false, languages: [], verified: false });
    expect(result.doctors[0]).not.toHaveProperty('private_email');
  });
  it.each([
    [[{ ...row(), is_approved: false }]], [[{ ...row(), public_profile: false }]],
    [[{ ...row(), id: null }]], [[{ ...row(), full_name: '' }]], [[{ ...row(), consultation_fee: -1 }]],
    [[{ ...row(), rating: 6 }]], [Array.from({ length: 13 }, row)],
  ])('rejects unsafe/malformed projection rows', async data => {
    const source = createDirectorySource(async () => ({ data, count: data.length, error: null }));
    await expect(source.list(filters(), signal())).rejects.toThrow('incomplete information');
  });
  it('does not turn an API error or inconsistent count into an empty success', async () => {
    for (const response of [
      { data: null, error: { message: 'private internal SQL detail' }, count: null },
      { data: [row()], error: null, count: null }, { data: [], error: null, count: 4 },
    ]) {
      const source = createDirectorySource(async () => response);
      await expect(source.list(filters(), signal())).rejects.not.toThrow('private internal SQL detail');
    }
    const source = createDirectorySource(async () => ({ data: [], error: null, count: 1 }));
    await expect(source.list(filters('page=2'), signal())).resolves.toEqual({ doctors: [], total: 1 });
  });
  it('rejects an aborted request even if its transport returns a late response', async () => {
    const controller = new AbortController();
    const source = createDirectorySource(async () => { controller.abort(); return { data: [row()], error: null, count: 1 }; });
    await expect(source.list(filters(), controller.signal)).rejects.toHaveProperty('name', 'AbortError');
  });
});

describe('candidate Supabase query with synthetic transport', () => {
  it('uses bounded public fields, server filters and stable pagination', async () => {
    transport.fetch.mockResolvedValue(new Response(JSON.stringify([row()]), { status: 200, headers: { 'content-type': 'application/json', 'content-range': '12-12/13' } }));
    await doctorDirectory.list(filters('q=Example&city=Chennai&category=Ayurveda&mode=video&maxFee=500&sort=fee_low&page=2'), signal());
    const [url, init] = transport.fetch.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/rest/v1/doctors_public');
    expect(parsed.searchParams.get('select')).toBe(directoryFields);
    expect(parsed.searchParams.get('is_approved')).toBe('eq.true');
    expect(parsed.searchParams.get('public_profile')).toBe('eq.true');
    expect(parsed.searchParams.get('full_name')).toBe('ilike.%Example%');
    expect(parsed.searchParams.get('city')).toBe('ilike.%Chennai%');
    expect(parsed.searchParams.get('category')).toBe('eq.Ayurveda');
    expect(parsed.searchParams.get('video_available')).toBe('eq.true');
    expect(parsed.searchParams.get('consultation_fee')).toBe('lte.500');
    expect(parsed.searchParams.get('order')).toBe('consultation_fee.asc.nullslast,id.asc');
    expect(parsed.searchParams.get('offset')).toBe('12'); expect(parsed.searchParams.get('limit')).toBe('12');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(transport.fetch).toHaveBeenCalledTimes(1);
  });
  it('keeps logical-expression punctuation inside a text filter', async () => {
    transport.fetch.mockResolvedValue(new Response('[]', { status: 200, headers: { 'content-range': '*/0' } }));
    await doctorDirectory.list(filters('q=' + encodeURIComponent('x),is_approved.eq.false')), signal());
    const parsed = new URL(transport.fetch.mock.calls[0][0]);
    expect(parsed.searchParams.get('full_name')).toBe('ilike.%x),is\\_approved.eq.false%');
    expect(parsed.searchParams.has('or')).toBe(false);
    expect(parsed.searchParams.get('is_approved')).toBe('eq.true');
    expect(parsed.pathname).toBe('/rest/v1/doctors_public');
  });
});
