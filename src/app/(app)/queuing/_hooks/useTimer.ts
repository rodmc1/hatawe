'use client';

import { useSyncExternalStore } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// One setInterval shared by all consumers
type Listener = () => void;

let now: number = Date.now();
const listeners = new Set<Listener>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  if (listeners.size === 1) {
    intervalId = setInterval(() => {
      now = Date.now();
      listeners.forEach(listener => listener());
    }, 1000);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot(): number {
  return now;
}

function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useTimer(startedAt: number | null): string {
  const now = useNow();
  if (startedAt === null) return '0:00';
  const elapsed = Math.max(0, now - startedAt);
  return dayjs.duration(elapsed).format('m:ss');
}
