// Fictional local review adapter. Production never imports this module.
import { allowedAudiences, draftSchema, PAGE_SIZE, type CommunitySource, type CommunityViewer, type CommunityPost, type CommunityComment, type Payload } from '../../../src/features/community/model';
const uuid = () => crypto.randomUUID();
const stamp = (days = 0) => new Date(Date.now() - days * 86400000).toISOString();
export const reviewViewers: Record<string, CommunityViewer> = {
  patient: { id: '00000000-0000-4000-8000-000000000001', name: 'Priya Example', workspace: 'patient', doctor: false, patient: true, moderator: false },
  doctor: { id: '00000000-0000-4000-8000-000000000002', name: 'Dr Meera Example', workspace: 'doctor', doctor: true, patient: false, moderator: false },
  content_admin: { id: '00000000-0000-4000-8000-000000000003', name: 'Sam Example', workspace: 'content_admin', doctor: false, patient: false, moderator: true },
};
interface ReviewState { posts: CommunityPost[]; comments: Record<string, (CommunityComment & { userId: string })[]>; likes: Record<string, string[]>; votes: Record<string, Record<string, number>>; hidden: string[]; reports: { id: string; postId: string; title: string; reason: string; createdAt: string }[]; decisions: unknown[]; notes: { id: string; userId: string; title: string; message: string; postId: string; isRead: boolean; dismissed: boolean; createdAt: string }[] }
export function seedCommunity(): ReviewState {
  const post = (index: number, title: string, body: string, audience: CommunityPost['audience'], kind: CommunityPost['kind'], own = false): CommunityPost => ({ id: `10000000-0000-4000-8000-${String(index).padStart(12,'0')}`, authorId: own ? reviewViewers.patient.id : reviewViewers.doctor.id, authorName: own ? reviewViewers.patient.name : reviewViewers.doctor.name,
    title, body, audience, kind, createdAt: stamp(index / 3), editedAt: null, likeCount: 0, commentCount: 0, liked: false, mine: false,
    poll: kind === 'poll' ? { options: [{ text: 'A short morning walk', votes: 0 }, { text: 'A regular sleep schedule', votes: 0 }, { text: 'Time away from screens', votes: 0 }], selected: null, closesAt: new Date(Date.now()+6*86400000).toISOString() } : null });
  return { posts: [
    post(1, 'Small routines can make a meaningful difference', 'A quiet walk, regular meals, a little time outdoors. Which small everyday habit helps you feel more balanced?\n\nShare what works for you. Everyone’s routine and needs are different.', 'public', 'discussion'),
    post(2, 'What helps you make time for yourself?', 'Some weeks feel busier than others. We’d love to hear which simple habit you find easiest to keep. Choose an option below and join the conversation.', 'public', 'poll'),
    post(3, 'How do you build a consistent evening routine?', 'I’m trying to make my evenings a little calmer, but keeping a regular routine has been difficult. What practical changes have helped you?', 'public', 'question', true),
    post(4, 'Discussing evidence with care', 'A space for approved practitioners to discuss how we explain evidence, uncertainty and shared decisions. Please use de-identified, general examples only.', 'doctor', 'discussion'),
    post(5, 'Preparing for your next consultation', 'What helps you remember the questions you want to ask? Share general preparation tips with other patients. Please keep personal health records private.', 'patient', 'discussion', true),
  ], comments: {}, likes: {}, votes: {}, hidden: [], reports: [], decisions: [], notes: [] };
}
export function createReviewSource(viewer: CommunityViewer, options: { state?: ReviewState; persist?(state: ReviewState): void; fail?: boolean } = {}): CommunitySource {
  const state = options.state ?? seedCommunity();
  const allowed = (p: CommunityPost) => !state.hidden.includes(p.id) && (allowedAudiences(viewer).includes(p.audience) || viewer.moderator);
  const projected = (p: CommunityPost) => ({ ...p, mine: p.authorId === viewer.id, liked: (state.likes[p.id] ?? []).includes(viewer.id), likeCount: (state.likes[p.id] ?? []).length, commentCount: (state.comments[p.id] ?? []).length,
    poll: p.poll ? { ...p.poll, selected: state.votes[p.id]?.[viewer.id] ?? null, options: p.poll.options.map((o, i) => ({ ...o, votes: Object.values(state.votes[p.id] ?? {}).filter(n => n === i).length })) } : null });
  return { async request(action, payload: Payload = {}, signal) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError'); if (options.fail) throw new Error('Simulated connection failure');
    const id = String(payload.id ?? ''); const p = state.posts.find(x => x.id === id);
    if (action === 'feed') {
      if (!allowedAudiences(viewer).includes(payload.audience as CommunityPost['audience'])) throw new Error('Audience denied');
      const query = String(payload.query ?? '').toLowerCase();
      const rows = state.posts.filter(p => allowed(p) && (payload.id ? p.id === id : p.audience === payload.audience && (!payload.mine || p.authorId === viewer.id) && (payload.kind === 'all' || payload.kind === p.kind) && `${p.title} ${p.body}`.toLowerCase().includes(query))).map(projected);
      rows.sort((a,b) => (payload.sort === 'discussed' ? b.commentCount-a.commentCount : 0) || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
      const offset = (Number(payload.page)-1)*PAGE_SIZE; return { viewer, posts: rows.slice(offset,offset+PAGE_SIZE), hasMore: rows.length>offset+PAGE_SIZE };
    }
    if (action === 'save') {
      const draft = draftSchema.parse(payload); if (!allowedAudiences(viewer).includes(draft.audience)) throw new Error('Audience denied');
      if (id) { if (!p || !allowed(p) || p.authorId !== viewer.id) throw new Error('Denied'); p.title=draft.title; p.body=draft.body; p.editedAt=stamp(); }
      else { state.posts.unshift({ ...draft, id:uuid(), authorId:viewer.id, authorName:viewer.name, createdAt:stamp(), editedAt:null, mine:true, liked:false, likeCount:0, commentCount:0, poll:draft.kind==='poll'?{options:draft.options.map(text=>({text,votes:0})),selected:null,closesAt:new Date(Date.now()+7*86400000).toISOString()}:null }); }
    } else if (action === 'notifications') return { notifications:state.notes.filter(n=>n.userId===viewer.id&&!n.dismissed).map(n=>({...n,postId:state.posts.some(p=>p.id===n.postId&&allowed(p))?n.postId:null})).slice(0,50) };
    else if (action === 'notification') { state.notes.filter(n=>n.userId===viewer.id&&(payload.decision==='read_all'||n.id===id)).forEach(n=>{ if(payload.decision==='dismiss')n.dismissed=true;else n.isRead=true; }); }
    else if (action === 'reports') { if(!viewer.moderator)throw new Error('Denied'); return {reports:state.reports}; }
    else if (action === 'moderate') { if(!viewer.moderator)throw new Error('Denied'); const report=state.reports.find(r=>r.id===id);if(!report)throw new Error('Denied'); if(payload.decision==='hide')state.hidden.push(report.postId);state.decisions.push({...report,decision:payload.decision,reviewer:viewer.id,reason:payload.reason});state.reports=state.reports.filter(r=>r.id!==id); }
    else if(action==='delete_comment') { for(const comments of Object.values(state.comments)){const i=comments.findIndex(c=>c.id===id&&c.userId===viewer.id);if(i>=0)comments.splice(i,1);} }
    else {
      if(!p||!allowed(p))throw new Error('Post unavailable');
      if(action==='comments')return {comments:(state.comments[id]??[]).slice(0,50).map(c=>({...c,mine:c.userId===viewer.id}))};
      if(action==='like'){const likes=new Set(state.likes[id]??[]);if(payload.liked)likes.add(viewer.id);else likes.delete(viewer.id);state.likes[id]=[...likes];}
      else if(action==='comment'){const comment={id:uuid(),authorName:viewer.name,userId:viewer.id,body:String(payload.body),createdAt:stamp(),mine:true};(state.comments[id]??=[]).push(comment);if(p.authorId!==viewer.id)state.notes.unshift({id:uuid(),userId:p.authorId,title:'New reply to your conversation',message:'A community member replied. Open the conversation to read it.',postId:id,isRead:false,dismissed:false,createdAt:stamp()});}
      else if(action==='vote'){if(!p.poll||Date.parse(p.poll.closesAt)<=Date.now()||!p.poll.options[Number(payload.option)])throw new Error('Invalid vote');(state.votes[id]??={})[viewer.id]=Number(payload.option);}
      else if(action==='delete'){if(p.authorId!==viewer.id)throw new Error('Denied');state.posts=state.posts.filter(x=>x.id!==id);delete state.comments[id];delete state.likes[id];delete state.votes[id];}
      else if(action==='report'){if(!state.reports.some(r=>r.postId===id))state.reports.push({id:uuid(),postId:id,title:p.title,reason:String(payload.reason),createdAt:stamp()});}
    }
    options.persist?.(state); return {};
  } };
}
