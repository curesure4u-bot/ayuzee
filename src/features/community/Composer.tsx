import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { allowedAudiences, draftSchema, type CommunityPost, type CommunityViewer, type PostDraft } from './model';
export function Composer({ viewer, post, onClose, onSave }: { viewer: CommunityViewer; post: CommunityPost | null; onClose(): void; onSave(draft: PostDraft, id?: string): Promise<void> }) {
  const opener = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const [draft, setDraft] = useState<PostDraft>({ title: post?.title ?? '', body: post?.body ?? '', kind: post?.kind ?? 'discussion', audience: post?.audience ?? 'public', options: post?.poll?.options.map(x => x.text) ?? ['', ''] });
  const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  const update = (patch: Partial<PostDraft>) => setDraft(current => ({ ...current, ...patch }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (pending) return;
    const parsed = draftSchema.safeParse({ ...draft, options: draft.kind === 'poll' ? draft.options : [] });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setError(''); setPending(true);
    try { await onSave(parsed.data, post?.id); onClose(); } catch { setError('Your post was not saved. Your draft is still here; please try again.'); }
    finally { setPending(false); }
  }
  return <Dialog open onOpenChange={value => { if (!value && !pending) onClose(); }}><DialogContent className="cp-dialog sm:max-w-xl" onInteractOutside={event => event.preventDefault()} onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}>
    <DialogHeader><DialogTitle>{post ? 'Edit your post' : 'Start a conversation'}</DialogTitle><DialogDescription>Share thoughtfully. Avoid names, contact details or identifiable health records.</DialogDescription></DialogHeader>
    <form onSubmit={submit} aria-busy={pending}>
      <fieldset disabled={pending}>
        <label className="cp-field">Post type<select value={draft.kind} disabled={Boolean(post)} onChange={e => update({ kind: e.target.value as PostDraft['kind'] })}><option value="discussion">Discussion</option><option value="question">Question</option><option value="poll">Poll</option></select></label>
        <label className="cp-field">Who can see this?<select value={draft.audience} disabled={Boolean(post)} onChange={e => update({ audience: e.target.value as PostDraft['audience'] })}>{allowedAudiences(viewer).map(audience => <option key={audience} value={audience}>{audience === 'public' ? 'Community · all members' : audience === 'doctor' ? 'Approved doctors only' : 'Patients only'}</option>)}</select><small>{post ? 'Audience and poll choices stay fixed after publishing to protect existing replies and votes.' : 'Community posts can be read by every signed-in member. Restricted posts stay within their audience.'}</small></label>
        <label className="cp-field">Title<input required minLength={3} maxLength={160} value={draft.title} onChange={e => update({ title: e.target.value })} placeholder="What would you like to discuss?" /></label>
        <label className="cp-field">Your message<textarea required minLength={10} maxLength={4000} value={draft.body} onChange={e => update({ body: e.target.value })} rows={5} placeholder="Share an experience or ask a general question…" /><small>{draft.body.length.toLocaleString()} / 4,000 characters</small></label>
        {draft.kind === 'poll' && <fieldset disabled={Boolean(post)}><legend className="cp-field">Poll choices</legend>{draft.options.map((option, i) => <label key={i} className="cp-field">Option {i + 1}<input required maxLength={120} value={option} onChange={e => update({ options: draft.options.map((x, n) => n === i ? e.target.value : x) })} /></label>)}{!post && draft.options.length < 6 && <button type="button" className="cp-secondary" onClick={() => update({ options: [...draft.options, ''] })}>Add option</button>}{!post && draft.options.length > 2 && <button type="button" className="cp-text-button" onClick={() => update({ options: draft.options.slice(0, -1) })}>Remove last option</button>}<p className="text-sm mt-3">Polls close 7 days after publishing. One vote per member.</p></fieldset>}
      </fieldset>
      {error && <p role="alert" className="cp-error">{error}</p>}
      <div className="cp-dialog-actions"><button type="button" disabled={pending} className="cp-secondary" onClick={onClose}>Cancel</button><button type="submit" disabled={pending} className="cp-primary">{pending ? 'Saving…' : post ? 'Save changes' : 'Publish post'}</button></div>
    </form>
  </DialogContent></Dialog>;
}
