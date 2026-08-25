'use client';

import type { DependencyList, RefObject } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsoLayoutEffect } from './useIsoLayoutEffect';

/**
 * Scoped GSAP setup with automatic teardown.
 *
 * Everything created inside the callback is recorded by the context and fully
 * reverted on unmount — inline styles, ScrollTriggers, timelines — which is
 * what keeps React Strict Mode's double-invoke from stacking duplicates.
 */
export function useGsap(
  setup: () => void | (() => void),
  deps: DependencyList = [],
  scope?: RefObject<HTMLElement | null>
) {
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(setup, scope?.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Web fonts change line-breaks and therefore every measured trigger position.
 * Refresh once they land, and once more after the last image settles.
 */
export function useScrollTriggerRefresh() {
  useIsoLayoutEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);

    return () => {
      cancelled = true;
      window.removeEventListener('load', refresh);
    };
  }, []);
}

export { gsap, ScrollTrigger };
