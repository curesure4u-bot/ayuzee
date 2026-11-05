import { useCallback, useEffect, useRef, useState } from 'react';

// Local UI pacing only. Supabase Auth enforces server-side abuse controls.
// Compatibility API for remaining preview pages; no email/attempt RPC or logs.
export function useLoginThrottle() {
  const failures = useRef<number[]>([]);
  const until = useRef(0);
  const [clock, setClock] = useState(Date.now());
  const [count, setCount] = useState(0);
  const resetLockout = useCallback(() => { failures.current = []; until.current = 0; setCount(0); setClock(Date.now()); }, []);
  const checkBeforeLogin = useCallback(async (_email: string) => { setClock(Date.now()); return Date.now() >= until.current; }, []);
  const recordAttempt = useCallback(async (_email: string, success: boolean, _userId?: string | null, _failureReason?: string) => {
    if (success) { resetLockout(); return; }
    const now = Date.now();
    failures.current = [...failures.current.filter(time => now - time < 60_000), now];
    setCount(failures.current.length);
    if (failures.current.length >= 3) until.current = now + 30_000;
    setClock(now);
  }, [resetLockout]);
  const locked = until.current > clock;
  useEffect(() => {
    if (!locked) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [locked]);
  const getCountdownSeconds = useCallback(() => Math.max(0, Math.ceil((until.current - Date.now()) / 1000)), []);
  return { checkBeforeLogin, recordAttempt, resetLockout, getCountdownSeconds, isLocked: locked,
    lockMessage: locked ? `Please wait ${Math.max(0, Math.ceil((until.current-clock)/1000))} seconds before trying again.` : '',
    remainingAttempts: Math.max(0, 3-count), consecutiveFailures: count };
}
