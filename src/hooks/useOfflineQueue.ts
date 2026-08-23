import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Offline-first queue for critical HMS operations (vitals, attendance).
 * Stores data in localStorage when offline, syncs when connection restores.
 *
 * Usage:
 *   const { enqueue, pendingCount, syncNow, isOnline } = useOfflineQueue("vitals");
 *   await enqueue({ patient_id, bp: "120/80", pulse: "72" });
 */

interface QueueItem {
  id: string;
  table: string;
  data: Record<string, any>;
  timestamp: string;
  retries: number;
}

const STORAGE_KEY_PREFIX = "ayuzee_offline_queue_";
const MAX_RETRIES = 3;

export function useOfflineQueue(queueName: string) {
  const storageKey = STORAGE_KEY_PREFIX + queueName;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Load pending count on mount
  useEffect(() => {
    const items = getQueueItems();
    setPendingCount(items.length);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow(); // Auto-sync when back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getQueueItems = (): QueueItem[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveQueueItems = (items: QueueItem[]) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
    setPendingCount(items.length);
  };

  /**
   * Add an item to the queue. If online, attempts immediate write.
   * If offline (or write fails), stores locally for later sync.
   */
  const enqueue = async (table: string, data: Record<string, any>): Promise<boolean> => {
    const item: QueueItem = {
      id: crypto.randomUUID(),
      table,
      data: { ...data, _queued_at: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    if (isOnline) {
      try {
        const { error } = await (supabase as any).from(table).insert(data);
        if (!error) return true; // Success — no need to queue
      } catch {
        // Fall through to local queue
      }
    }

    // Store locally
    const items = getQueueItems();
    items.push(item);
    saveQueueItems(items);
    return false; // Queued for later
  };

  /**
   * Attempt to sync all pending items to Supabase.
   */
  const syncNow = useCallback(async () => {
    if (syncing || !navigator.onLine) return;
    setSyncing(true);

    const items = getQueueItems();
    const remaining: QueueItem[] = [];
    let synced = 0;

    for (const item of items) {
      try {
        const { _queued_at, ...cleanData } = item.data;
        const { error } = await (supabase as any).from(item.table).insert(cleanData);

        if (error) {
          item.retries++;
          if (item.retries < MAX_RETRIES) {
            remaining.push(item);
          }
          // If max retries exceeded, item is dropped (log it)
          else {
            console.warn(`[OfflineQueue] Dropped item after ${MAX_RETRIES} retries:`, item);
          }
        } else {
          synced++;
        }
      } catch {
        item.retries++;
        if (item.retries < MAX_RETRIES) remaining.push(item);
      }
    }

    saveQueueItems(remaining);
    setSyncing(false);
    return { synced, remaining: remaining.length };
  }, [syncing, storageKey]);

  /**
   * Clear all pending items (e.g., after manual review)
   */
  const clearQueue = () => {
    localStorage.removeItem(storageKey);
    setPendingCount(0);
  };

  return { enqueue, syncNow, clearQueue, pendingCount, isOnline, syncing };
}
