import {describe,expect,it} from 'vitest';
import {sanitizeHtml,stripHtml} from './sanitize';
describe('untrusted published content',()=>{
 it('preserves readable formatting and safe destinations',()=>{
  const result=sanitizeHtml('<h2>Care guide</h2><p><strong>Read this</strong> <a href="https://example.invalid/guide">Guide</a></p>');
  const page=new DOMParser().parseFromString(result,'text/html');
  expect(page.querySelector('h2')?.textContent).toBe('Care guide');
  expect(page.querySelector('strong')?.textContent).toBe('Read this');
  expect(page.querySelector('a')?.getAttribute('href')).toBe('https://example.invalid/guide');
 });
 it('removes executable content, event handlers and script destinations',()=>{
  const result=sanitizeHtml('<script>window.bad=true</script><img src="x" onerror="window.bad=true"><a href="javascript:alert(1)">Unsafe link</a><iframe src="https://example.invalid"></iframe><svg onload="alert(1)"></svg>');
  const page=new DOMParser().parseFromString(result,'text/html');
  expect(page.querySelector('script,iframe,svg')).toBeNull();
  expect(page.querySelector('[onerror],[onload]')).toBeNull();
  expect(page.querySelector('a')?.hasAttribute('href')).toBe(false);
  expect(page.body.textContent).toContain('Unsafe link');
 });
 it('produces text without retaining markup or hidden scripts',()=>{
  expect(stripHtml('<p>Hello <b>there</b></p><script>unsafe()</script>')).toBe('Hello there');
 });
});
