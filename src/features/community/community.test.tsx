import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunityPortal } from './CommunityPortal';
import { createReviewSource, reviewViewers, seedCommunity } from '../../../tests/browser/community/reviewSource';
import type { CommunitySource } from './model';
afterEach(cleanup);
function mount(source: CommunitySource, path = '/feed') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><CommunityPortal source={source} contextKey="test" review /></MemoryRouter></QueryClientProvider>);
}
const loaded = () => screen.findByRole('heading', { name: 'Small routines can make a meaningful difference' });
describe('community workflows', () => {
 it('patient workspace shows public and patient audiences without doctor tools', async () => {
  mount(createReviewSource(reviewViewers.patient)); await loaded();
  expect(screen.queryByRole('button', { name: 'Doctor discussions' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Moderation' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Patient circle' }));
  expect(await screen.findByRole('heading', { name: 'Preparing for your next consultation' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Discussing evidence with care' })).not.toBeInTheDocument();
 });
 it('approved doctor workspace has a distinct doctor audience', async () => {
  mount(createReviewSource(reviewViewers.doctor)); await loaded();
  expect(screen.queryByRole('button', { name: 'Patient circle' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Doctor discussions' }));
  expect(await screen.findByRole('heading', { name: 'Discussing evidence with care' })).toBeInTheDocument();
 });
 it('search filters conversations and shows a useful empty state', async () => {
  mount(createReviewSource(reviewViewers.patient)); await loaded();
  await userEvent.type(screen.getByLabelText('Search conversations'), 'nonexistent');await userEvent.click(screen.getByRole('button',{name:'Search'}));
  expect(await screen.findByRole('heading',{name:'No conversations here yet'})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'Clear filters'})); await loaded();
 });
 it('post creation persists validated content and edit keeps audience fixed', async () => {
  const state=seedCommunity(); mount(createReviewSource(reviewViewers.patient,{state}));await loaded();
  await userEvent.click(screen.getByRole('button',{name:'What’s on your mind?'}));
  const dialog=screen.getByRole('dialog');await userEvent.type(within(dialog).getByLabelText('Title'),'A new discussion');
  await userEvent.type(within(dialog).getByLabelText(/Your message/),'A thoughtful message about everyday routines.');
  await userEvent.click(within(dialog).getByRole('button',{name:'Publish post'}));
  expect(await screen.findByRole('heading',{name:'A new discussion'})).toBeInTheDocument();
  expect(state.posts[0].authorId).toBe(reviewViewers.patient.id);
  await userEvent.click(screen.getByRole('button',{name:'Edit A new discussion'}));
  expect(within(screen.getByRole('dialog')).getByLabelText(/Who can see this/)).toBeDisabled();
  const title=within(screen.getByRole('dialog')).getByLabelText('Title');await userEvent.clear(title);await userEvent.type(title,'Edited discussion');
  await userEvent.click(screen.getByRole('button',{name:'Save changes'}));expect(await screen.findByRole('heading',{name:'Edited discussion'})).toBeInTheDocument();
 });
 it('Escape closes the editor and returns keyboard focus to its opener',async()=>{mount(createReviewSource(reviewViewers.patient));await loaded();const opener=screen.getByRole('button',{name:'What’s on your mind?'});await userEvent.click(opener);expect(screen.getByRole('dialog')).toBeInTheDocument();await userEvent.keyboard('{Escape}');await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());await waitFor(()=>expect(opener).toHaveFocus());});
 it('failed save retains the draft and never claims success', async () => {
  const base=createReviewSource(reviewViewers.patient);mount({request:(action,...args)=>action==='save'?Promise.reject(new Error('Network')):base.request(action,...args)});await loaded();
  await userEvent.click(screen.getByRole('button',{name:'What’s on your mind?'}));const dialog=screen.getByRole('dialog');
  await userEvent.type(within(dialog).getByLabelText('Title'),'Unsaved draft');await userEvent.type(within(dialog).getByLabelText(/Your message/),'This draft must survive a connection failure.');
  await userEvent.click(within(dialog).getByRole('button',{name:'Publish post'}));
  expect(await within(dialog).findByText(/Your post was not saved/)).toBeInTheDocument();expect(within(dialog).getByLabelText('Title')).toHaveValue('Unsaved draft');expect(screen.queryByText('Your post was published.')).not.toBeInTheDocument();
 });
 it('likes and replies reload persisted state rather than inventing counts', async () => {
  const state=seedCommunity();mount(createReviewSource(reviewViewers.patient,{state}));await loaded();
  const article=screen.getByRole('heading',{name:'Small routines can make a meaningful difference'}).closest('article')!;
  await userEvent.click(within(article).getByRole('button',{name:'Like Small routines can make a meaningful difference'}));
  expect(await within(article).findByText('1 likes')).toBeInTheDocument();
  await userEvent.click(within(article).getByRole('button',{name:'0 comments'}));await within(article).findByText(/No replies yet/);
  await userEvent.type(within(article).getByLabelText('Write a reply'),'A helpful general reply.');await userEvent.click(within(article).getByRole('button',{name:'Post reply'}));
  expect(await within(article).findByText('A helpful general reply.')).toBeInTheDocument();expect(state.notes[0].userId).toBe(reviewViewers.doctor.id);
  await userEvent.click(within(article).getByRole('button',{name:'Delete your comment'}));await waitFor(()=>expect(within(article).queryByText('A helpful general reply.')).not.toBeInTheDocument());
 });
 it('failed like does not alter the visible count', async()=>{
  const base=createReviewSource(reviewViewers.patient);mount({request:(action,...args)=>action==='like'?Promise.reject(new Error('Denied')):base.request(action,...args)});await loaded();
  const button=screen.getByRole('button',{name:'Like Small routines can make a meaningful difference'});await userEvent.click(button);
  expect(await screen.findByRole('alert')).toHaveTextContent('Your changes were not confirmed');expect(button).toHaveTextContent('0 likes');expect(button).toHaveAttribute('aria-pressed','false');
 });
 it('poll voting persists exactly one choice when changed', async()=>{
  const state=seedCommunity();mount(createReviewSource(reviewViewers.patient,{state}));await loaded();
  const poll=screen.getByRole('group',{name:'Poll: What helps you make time for yourself?'});
  await userEvent.click(within(poll).getByRole('button',{name:/A short morning walk/}));await waitFor(()=>expect(within(poll).getByRole('button',{name:/A short morning walk/})).toHaveAttribute('aria-pressed','true'));
  await userEvent.click(within(poll).getByRole('button',{name:/A regular sleep schedule/}));
  await waitFor(()=>expect(within(poll).getByRole('button',{name:/A regular sleep schedule/})).toHaveAttribute('aria-pressed','true'));
  expect(within(poll).getByText(/1 vote ·/)).toBeInTheDocument();expect(Object.values(state.votes[state.posts[1].id])).toEqual([1]);
 });
 it('reporting records a reason without exposing moderator controls', async()=>{
  const state=seedCommunity();mount(createReviewSource(reviewViewers.patient,{state}));await loaded();
  await userEvent.click(screen.getByRole('button',{name:'Report Small routines can make a meaningful difference'}));
  await userEvent.type(screen.getByLabelText('Reason for reporting'),'Please check the evidence supporting this claim.');await userEvent.click(screen.getByRole('button',{name:'Submit report'}));
  expect(await screen.findByText('Report submitted for review.')).toBeInTheDocument();expect(state.reports).toHaveLength(1);
 });
 it('moderation requires an explicit recorded decision and reason', async()=>{
  const state=seedCommunity();state.reports.push({id:crypto.randomUUID(),postId:state.posts[0].id,title:state.posts[0].title,reason:'Please review this potentially misleading content.',createdAt:new Date().toISOString()});
  mount(createReviewSource(reviewViewers.content_admin,{state}),'/feed?panel=moderation');
  await screen.findByRole('button',{name:'Hide post'});await userEvent.click(screen.getByRole('button',{name:'Hide post'}));
  expect(screen.getByRole('button',{name:'Save decision'})).toBeDisabled();await userEvent.type(screen.getByLabelText('Review reason'),'The claim does not meet our community standards.');
  await userEvent.click(screen.getByRole('button',{name:'Save decision'}));expect(await screen.findByText(/No open reports/)).toBeInTheDocument();expect(state.hidden).toContain(state.posts[0].id);expect(state.decisions).toHaveLength(1);
 });
 it('notification read and dismiss actions persist and empty is genuinely empty', async()=>{
  const state=seedCommunity();state.notes.push({id:crypto.randomUUID(),userId:reviewViewers.patient.id,title:'New community reply',message:'A member replied.',postId:state.posts[0].id,isRead:false,dismissed:false,createdAt:new Date().toISOString()});
  mount(createReviewSource(reviewViewers.patient,{state}),'/feed?panel=notifications');
  await screen.findByText('New community reply');await userEvent.click(screen.getByRole('button',{name:'Mark all as read'}));await waitFor(()=>expect(state.notes[0].isRead).toBe(true));
  await userEvent.click(screen.getByRole('button',{name:'Dismiss'}));expect(await screen.findByText(/You’re all caught up/)).toBeInTheDocument();expect(state.notes[0].dismissed).toBe(true);
 });
 it('error and malformed API data produce retry states instead of sample posts', async()=>{
  const request=vi.fn().mockResolvedValue({posts:[{body:'bad'}]});mount({request});
  expect(await screen.findByRole('heading',{name:'Community could not be loaded'})).toBeInTheDocument();expect(screen.queryByRole('article')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'Try again'}));await waitFor(()=>expect(request).toHaveBeenCalledTimes(2));
 });
});
