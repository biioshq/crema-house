'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (query: string) => (onChange: () => void) => {
  const list = window.matchMedia(query);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
};

/**
 * SSR-safe media query. Returns `false` on the server so the first client
 * paint matches the server HTML, then settles on the real value.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Motion is allowed unless the user has explicitly asked for less of it. */
export function useMotionOK(): boolean {
  return !useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Pointer-based devices get cursor effects and hover choreography. */
export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
