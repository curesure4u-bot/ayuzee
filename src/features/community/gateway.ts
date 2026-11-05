import { z } from 'zod';
import type { CommunitySource } from './model';
export interface CommunityTransport { (action: string, payload: Record<string, unknown>, signal?: AbortSignal): Promise<{ data: unknown; error: unknown }> }
// The candidate RPC is deliberately not added to generated live schema types.
// Keep the production route contained until the migration and API checks pass.
export function createCommunitySource(transport: CommunityTransport, workspace: string): CommunitySource {
  return { async request(action, payload = {}, signal) {
    if (signal?.aborted) throw new DOMException('Community request cancelled', 'AbortError');
    const { data, error } = await transport(action, { ...payload, workspace }, signal);
    if (signal?.aborted) throw new DOMException('Community request cancelled', 'AbortError');
    if (error) throw new Error('This action could not be completed. Check your connection and access, then try again.');
    if (action === 'save') return z.object({id:z.string().uuid()}).strict().parse(data);
    if (!['feed','comments','notifications','reports'].includes(action)) return z.object({}).strict().parse(data);
    return data;
  } };
}
