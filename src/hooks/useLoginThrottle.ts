import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * 3-Layer Login Rate Limiting Hook
 *
 * Layer 1: Client-side — blocks rapid-fire attempts (3 fails → 30s cooldown, escalates)
 * Layer 2: Server-side DB — check_login_rate_limit() blocks if 5+ fails in 15min window
 * Layer 3: Supabase built-in — IP-based 1800 req/hour (fallback if layers 1 & 2 bypassed)
 *
 * Usage:
 *   const { checkBeforeLogin, recordAttempt, isLocked, lockMessage, remainingAttempts } = useLoginThrottle();
 *   // Before calling signInWithPassword:
 *   const allowed = await checkBeforeLogin(email);
 *   if (!allowed) return; // Already shows toast via lockMessage
 *   // After login attempt:
 *   await recordAttempt(email, success, userId, failureReason);
 */

interface ThrottleState {
  isLocked: boolean;
  lockMessage: string;
  remainingAttempts: number;
  lockoutUntil: Date | null;
  consecutiveFailures: number;
}

const CLIENT_COOLDOWN_BASE_MS = 30_000; // 30 seconds base cooldown
const CLIENT_MAX_RAPID_FAILURES = 3; // Trigger client cooldown after 3 rapid fails
const CLIENT_RAPID_WINDOW_MS = 60_000; // "Rapid" = within 60 seconds

export function useLoginThrottle() {
  const [state, setState] = useState<ThrottleState>({
    isLocked: false,
    lockMessage: "",
    remainingAttempts: 5,
    lockoutUntil: null,
    consecutiveFailures: 0,
  });

  const failureTimestamps = useRef<number[]>([]);
  const clientLockUntil = useRef<number>(0);

  /**
   * Check if login is allowed — call BEFORE signInWithPassword
   * Returns true if allowed, false if blocked
   */
  const checkBeforeLogin = useCallback(async (email: string): Promise<boolean> => {
    const now = Date.now();

    // Layer 1: Client-side rapid-fire check
    if (now < clientLockUntil.current) {
      const remainingSec = Math.ceil((clientLockUntil.current - now) / 1000);
      setState((s) => ({
        ...s,
        isLocked: true,
        lockMessage: `Too many attempts. Please wait ${remainingSec}s before trying again.`,
      }));
      return false;
    }

    // Layer 2: Server-side DB check
    try {
      const { data, error } = await supabase.rpc("check_login_rate_limit", {
        p_email: email.trim().toLowerCase(),
        p_ip_address: null, // IP detected server-side if needed
      });

      if (error) {
        // If RPC fails, allow login (fail-open for availability) but log
        console.warn("[LoginThrottle] Server check failed:", error.message);
        return true;
      }

      const result = data as unknown as {
        allowed: boolean;
        remaining_attempts: number;
        lockout_until: string | null;
        message: string;
      };

      if (!result.allowed) {
        const lockUntil = result.lockout_until ? new Date(result.lockout_until) : null;
        setState({
          isLocked: true,
          lockMessage: result.message || "Account temporarily locked due to too many failed attempts.",
          remainingAttempts: 0,
          lockoutUntil: lockUntil,
          consecutiveFailures: state.consecutiveFailures,
        });
        return false;
      }

      setState((s) => ({
        ...s,
        isLocked: false,
        lockMessage: "",
        remainingAttempts: result.remaining_attempts,
        lockoutUntil: null,
      }));
      return true;
    } catch (err) {
      // Fail-open: don't block legitimate users if something goes wrong
      console.warn("[LoginThrottle] Unexpected error:", err);
      return true;
    }
  }, [state.consecutiveFailures]);

  /**
   * Record a login attempt — call AFTER signInWithPassword resolves
   */
  const recordAttempt = useCallback(async (
    email: string,
    success: boolean,
    userId?: string | null,
    failureReason?: string
  ) => {
    const now = Date.now();

    if (success) {
      // Reset client-side state on successful login
      failureTimestamps.current = [];
      clientLockUntil.current = 0;
      setState({
        isLocked: false,
        lockMessage: "",
        remainingAttempts: 5,
        lockoutUntil: null,
        consecutiveFailures: 0,
      });
    } else {
      // Track failure for client-side throttling
      failureTimestamps.current.push(now);
      // Only keep failures within the rapid window
      failureTimestamps.current = failureTimestamps.current.filter(
        (ts) => now - ts < CLIENT_RAPID_WINDOW_MS
      );

      const recentFailures = failureTimestamps.current.length;
      const newConsecutive = state.consecutiveFailures + 1;

      if (recentFailures >= CLIENT_MAX_RAPID_FAILURES) {
        // Exponential backoff: 30s, 60s, 120s, 240s...
        const multiplier = Math.min(Math.pow(2, recentFailures - CLIENT_MAX_RAPID_FAILURES), 8);
        const cooldownMs = CLIENT_COOLDOWN_BASE_MS * multiplier;
        clientLockUntil.current = now + cooldownMs;
        const cooldownSec = Math.ceil(cooldownMs / 1000);

        setState((s) => ({
          ...s,
          isLocked: true,
          lockMessage: `Too many rapid attempts. Please wait ${cooldownSec}s.`,
          consecutiveFailures: newConsecutive,
          remainingAttempts: Math.max(0, s.remainingAttempts - 1),
        }));
      } else {
        setState((s) => ({
          ...s,
          consecutiveFailures: newConsecutive,
          remainingAttempts: Math.max(0, s.remainingAttempts - 1),
        }));
      }
    }

    // Record to server (fire-and-forget, don't block UX)
    try {
      await supabase.rpc("record_login_attempt", {
        p_email: email.trim().toLowerCase(),
        p_user_id: userId || null,
        p_ip_address: null, // Server function handles this
        p_user_agent: navigator.userAgent?.substring(0, 255) || null,
        p_success: success,
        p_failure_reason: failureReason?.substring(0, 255) || null,
        p_clinic_id: null,
      });
    } catch (err) {
      // Non-critical — don't break login flow
      console.warn("[LoginThrottle] Failed to record attempt:", err);
    }
  }, [state.consecutiveFailures]);

  /**
   * Reset lockout (e.g., after password reset flow)
   */
  const resetLockout = useCallback(() => {
    failureTimestamps.current = [];
    clientLockUntil.current = 0;
    setState({
      isLocked: false,
      lockMessage: "",
      remainingAttempts: 5,
      lockoutUntil: null,
      consecutiveFailures: 0,
    });
  }, []);

  /**
   * Get countdown seconds remaining (for UI timer display)
   */
  const getCountdownSeconds = useCallback((): number => {
    const now = Date.now();
    if (clientLockUntil.current > now) {
      return Math.ceil((clientLockUntil.current - now) / 1000);
    }
    if (state.lockoutUntil && state.lockoutUntil.getTime() > now) {
      return Math.ceil((state.lockoutUntil.getTime() - now) / 1000);
    }
    return 0;
  }, [state.lockoutUntil]);

  return {
    checkBeforeLogin,
    recordAttempt,
    resetLockout,
    getCountdownSeconds,
    isLocked: state.isLocked,
    lockMessage: state.lockMessage,
    remainingAttempts: state.remainingAttempts,
    consecutiveFailures: state.consecutiveFailures,
  };
}
