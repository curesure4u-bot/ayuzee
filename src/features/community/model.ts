import { z } from 'zod';
import { isAccountRole } from '@/features/access/roles';
export const PAGE_SIZE = 12;
export const audienceSchema = z.enum(['public', 'doctor', 'patient']);
export const kindSchema = z.enum(['discussion', 'question', 'poll']);
export type Audience = z.infer<typeof audienceSchema>;
export const viewerSchema = z.object({ id: z.string().uuid(), name: z.string(), workspace: z.string().refine(isAccountRole), doctor: z.boolean(), patient: z.boolean(), moderator: z.boolean() });
export type CommunityViewer = z.infer<typeof viewerSchema>;
const count = z.number().int().nonnegative();
export const postSchema = z.object({
  id: z.string().uuid(), authorId: z.string().uuid(), authorName: z.string(), title: z.string(), body: z.string(),
  kind: kindSchema, audience: audienceSchema, createdAt: z.string().datetime({ offset: true }), editedAt: z.string().datetime({ offset: true }).nullable(),
  likeCount: count, commentCount: count, liked: z.boolean(), mine: z.boolean(),
  poll: z.object({ options: z.array(z.object({ text: z.string(), votes: count })).min(2).max(6), selected: count.nullable(), closesAt: z.string().datetime({ offset: true }) }).nullable(),
});
export type CommunityPost = z.infer<typeof postSchema>;
export const commentSchema = z.object({ id: z.string().uuid(), authorName: z.string(), body: z.string(), createdAt: z.string().datetime({ offset: true }), mine: z.boolean() });
export type CommunityComment = z.infer<typeof commentSchema>;
export const notificationSchema = z.object({ id: z.string().uuid(), title: z.string(), message: z.string(), postId: z.string().uuid().nullable(), isRead: z.boolean(), createdAt: z.string().datetime({ offset: true }) });
export const reportSchema = z.object({ id: z.string().uuid(), postId: z.string().uuid(), title: z.string(), reason: z.string(), createdAt: z.string().datetime({ offset: true }) });
export const draftSchema = z.object({
  title: z.string().trim().min(3, 'Add a title of at least 3 characters.').max(160),
  body: z.string().trim().min(10, 'Write at least 10 characters.').max(4000),
  kind: kindSchema, audience: audienceSchema,
  options: z.array(z.string().trim().min(1).max(120)).max(6),
}).superRefine((draft, ctx) => {
  if (draft.kind === 'poll' && (draft.options.length < 2 || new Set(draft.options.map(x => x.toLowerCase())).size !== draft.options.length)) {
    ctx.addIssue({ code: 'custom', message: 'Add between 2 and 6 different poll options.', path: ['options'] });
  }
});
export type PostDraft = z.infer<typeof draftSchema>;
export interface FeedFilters { query: string; audience: 'all' | Audience; kind: 'all' | PostDraft['kind']; mine: boolean; sort: 'recent' | 'discussed'; page: number }
export function readFilters(params: URLSearchParams): FeedFilters {
  const page = Number(params.get('page'));
  return { query: (params.get('q') ?? '').trim().slice(0, 100), audience: audienceSchema.catch('public').parse(params.get('audience') || 'public'),
    kind: kindSchema.safeParse(params.get('kind')).success ? kindSchema.parse(params.get('kind')) : 'all',
    mine: params.get('mine') === '1', sort: params.get('sort') === 'discussed' ? 'discussed' : 'recent',
    page: Number.isSafeInteger(page) && page > 0 && page <= 1000 ? page : 1 };
}
export function allowedAudiences(viewer: CommunityViewer): Audience[] {
  return ['public', ...(viewer.doctor ? ['doctor' as const] : []), ...(viewer.patient ? ['patient' as const] : [])];
}
export type CommunityAction = 'feed' | 'comments' | 'save' | 'delete' | 'like' | 'comment' | 'delete_comment' | 'vote' | 'report' | 'reports' | 'moderate' | 'notifications' | 'notification';
export type Payload = Record<string, string | number | boolean | null | string[]>;
export interface CommunitySource { request(action: CommunityAction, payload?: Payload, signal?: AbortSignal): Promise<unknown> }
export const feedSchema = z.object({ viewer: viewerSchema, posts: z.array(postSchema).max(PAGE_SIZE), hasMore: z.boolean() });
export function safePostLink(postId: string | null): string | null { return postId && z.string().uuid().safeParse(postId).success ? `/feed/${postId}` : null; }
