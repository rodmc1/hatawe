'use client';

import { useSyncExternalStore } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

function useNow(intervalMs = 1000) {
  return useSyncExternalStore(
    (cb) => {
      const id = setInterval(cb, intervalMs);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => Date.now()
  );
}

export function useTimer(startedAt: number | null) {
  const now = useNow(1000);
  if (!startedAt) return '0:00';
  return dayjs.duration(now - startedAt).format('m:ss');
}
