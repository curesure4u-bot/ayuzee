import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axe from 'axe-core';
import { useAccountSession } from './accountService.fixture';

export default function AccessibilityReport() {
  const location = useLocation();
  const state = useAccountSession();
  const [report, setReport] = useState('pending');
  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      const root = document.querySelector<HTMLElement>('.workspace, .workspace-message, .navigation-review');
      if (!root) return;
      void axe.run(root, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }).then(result => {
        if (active) setReport(JSON.stringify({ violations: result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) })), passes: result.passes.length, incomplete: result.incomplete.map(item => item.id) }));
      }).catch(() => { if (active) setReport('audit-error'); });
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [location.key, state.revision]);
  return <output hidden data-testid="workspace-axe-report">{report}</output>;
}
