import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Flag, Pencil, Trash2, LockKeyhole, Globe2, Check } from 'lucide-react';
import { z } from 'zod';
import { commentSchema, type CommunityPost, type CommunitySource } from './model';
const displayDate = (date: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
export function Avatar({ name }: { name: string }) { return <span className="cp-avatar" aria-hidden="true">{name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'A'}</span>; }
export function PostCard({ post, source, contextKey, run, onEdit, onDelete, onReport, highlighted = false }: {
  post: CommunityPost; source: CommunitySource; contextKey: string;
  run(action: () => Promise<unknown>, message: string): Promise<boolean>;
  onEdit(): void; onDelete(): void; onReport(): void; highlighted?: boolean;
}) {
  const [commentsOpen, setCommentsOpen] = useState(highlighted); const [draft, setDraft] = useState(''); const [busy, setBusy] = useState(false);
  const comments = useQuery({ queryKey: ['community', contextKey, 'comments', post.id], enabled: commentsOpen,
    queryFn: async ({ signal }) => z.object({ comments: z.array(commentSchema).max(50) }).parse(await source.request('comments', { id: post.id }, signal)) });
  async function action(callback: () => Promise<unknown>, message: string) { if (busy) return false; setBusy(true); try { return await run(callback, message); } finally { setBusy(false); } }
  async function submitComment(event: React.FormEvent) {
    event.preventDefault(); if (!draft.trim() || draft.length > 1000) return;
    if (await action(() => source.request('comment', { id: post.id, body: draft.trim() }), 'Comment posted.')) setDraft('');
  }
  const totalVotes = post.poll?.options.reduce((total, option) => total + option.votes, 0) ?? 0;
  const closed = Boolean(post.poll && Date.parse(post.poll.closesAt) <= Date.now());
  return <article className="cp-panel cp-post" aria-labelledby={`post-${post.id}`}>
    <div className="cp-author"><Avatar name={post.authorName} /><div><strong>{post.authorName}{post.mine ? ' · You' : ''}</strong><div className="cp-meta"><time dateTime={post.createdAt}>{displayDate(post.createdAt)}</time><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1">{post.audience === 'public' ? <Globe2 size={13} aria-hidden="true" /> : <LockKeyhole size={13} aria-hidden="true" />}{post.audience === 'doctor' ? 'Doctors only' : post.audience === 'patient' ? 'Patients only' : 'Community'}</span>{post.editedAt && <span>Edited</span>}</div></div></div>
    <span className="cp-label">{post.kind === 'question' ? 'Community question' : post.kind === 'poll' ? 'Community poll' : 'Discussion'}</span>
    <h2 id={`post-${post.id}`}>{post.title}</h2><p className="cp-post-body">{post.body}</p>
    {post.poll && <div className="cp-poll" role="group" aria-label={`Poll: ${post.title}`}>
      {post.poll.options.map((option, index) => {
        const percent = totalVotes ? Math.round(option.votes / totalVotes * 100) : 0;
        return <button key={index} type="button" className="cp-poll-option" aria-pressed={post.poll?.selected === index} disabled={busy || closed} onClick={() => { void action(() => source.request('vote', { id: post.id, option: index }), 'Your vote was saved.'); }}>
          {(post.poll?.selected !== null || closed) && <i aria-hidden="true" className="cp-poll-fill" style={{ width: `${percent}%` }} />}<span>{option.text}{post.poll?.selected === index && <Check size={15} className="inline ml-2" aria-label="Your vote" />}</span><span>{post.poll?.selected !== null || closed ? `${percent}%` : 'Vote'}</span>
        </button>;
      })}<p className="cp-meta">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} · {closed ? 'Poll closed' : `Closes ${displayDate(post.poll.closesAt)}`}{post.poll.selected !== null && !closed ? ' · Select another option to change your vote' : ''}</p>
    </div>}
    <div className="cp-post-actions">
      <button className="cp-action" disabled={busy} aria-pressed={post.liked} aria-label={`${post.liked ? 'Unlike' : 'Like'} ${post.title}`} onClick={() => { void action(() => source.request('like', { id: post.id, liked: !post.liked }), ''); }}><Heart size={19} fill={post.liked ? 'currentColor' : 'none'} aria-hidden="true" /><span>{post.likeCount} likes</span></button>
      <button className="cp-action" aria-expanded={commentsOpen} aria-controls={`comments-${post.id}`} onClick={() => setCommentsOpen(!commentsOpen)}><MessageCircle size={19} aria-hidden="true" />{post.commentCount} comments</button>
      {post.mine ? <><button className="cp-action cp-more" onClick={onEdit} aria-label={`Edit ${post.title}`}><Pencil size={17} aria-hidden="true" /></button><button className="cp-action" onClick={onDelete} aria-label={`Delete ${post.title}`}><Trash2 size={17} aria-hidden="true" /></button></> : <button className="cp-action cp-more" onClick={onReport} aria-label={`Report ${post.title}`}><Flag size={17} aria-hidden="true" /></button>}
    </div>
    {commentsOpen && <section className="cp-comment-section" id={`comments-${post.id}`} aria-label={`Comments on ${post.title}`}>
      <h3 className="font-semibold">Conversation</h3>
      {comments.isPending ? <p role="status">Loading comments…</p> : comments.isError ? <div className="cp-error" role="alert">Comments could not be loaded. <button className="cp-secondary" onClick={() => { void comments.refetch(); }}>Retry comments</button></div> : <>
        {comments.data.comments.length === 0 && <p className="cp-subtitle mt-3">No replies yet. Start a thoughtful conversation.</p>}
        {comments.data.comments.map(comment => <div className="cp-comment" key={comment.id}><strong>{comment.authorName}</strong><p>{comment.body}</p><div className="cp-meta"><time dateTime={comment.createdAt}>{displayDate(comment.createdAt)}</time>{comment.mine && <button className="cp-text-button" disabled={busy} onClick={() => { void action(() => source.request('delete_comment', { id: comment.id }), 'Comment removed.'); }}>Delete your comment</button>}</div></div>)}
        {comments.data.comments.length === 50 && <p className="cp-meta">Showing the first 50 comments.</p>}
      </>}
      <form onSubmit={submitComment} className="mt-4"><label className="cp-field">Write a reply<textarea value={draft} onChange={e => setDraft(e.target.value)} required maxLength={1000} rows={2} placeholder="Add to the conversation…" /></label><button type="submit" className="cp-primary" disabled={busy || !draft.trim()}>Post reply</button></form>
    </section>}
  </article>;
}
