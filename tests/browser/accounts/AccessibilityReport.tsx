import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axe from 'axe-core';

export default function AccessibilityReport() {
  const location = useLocation();
  const [report, setReport] = useState('pending');
  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (!main) return;
      void axe.run(main).then(result => { if (active) setReport(JSON.stringify({
        violations: result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) })),
        passes: result.passes.length, incomplete: result.incomplete.map(item => item.id),
      })); }).catch(() => { if (active) setReport('audit-error'); });
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [location.key]);
  return <output hidden data-testid="account-axe-report">{report}</output>;
}
