'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';

type ScrollTo = (target: string | number | HTMLElement, options?: { offset?: number }) => void;

type SmoothScrollValue = {
  lenis: Lenis | null;
  scrollTo: ScrollTo;
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollValue | null>(null);

export function useSmoothScroll(): SmoothScrollValue {
  const value = useContext(SmoothScrollContext);
  if (!value) {
    throw new Error('useSmoothScroll must be used inside <SmoothScroll>');
  }
  return value;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const motionOK = useMotionOK();
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    // Reduced motion means the OS-native scroll, untouched.
    if (!motionOK) return;

    const instance = new Lenis({
      // A long, exponential settle — the single biggest contributor to the
      // site feeling "expensive" rather than "fast".
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      // Native momentum on touch feels better than a simulated one.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    lenisRef.current = instance;
    setLenis(instance);

    // One RAF loop for the whole site: GSAP drives Lenis, Lenis updates
    // ScrollTrigger. Two independent loops would beat against each other.
    instance.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [motionOK]);

  // A new route means new content and new geometry. Jump to the top without
  // animating, then let every trigger re-measure once the page has painted.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);

    const frame = requestAnimationFrame(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const scrollTo = useCallback<ScrollTo>((target, options) => {
    const offset = options?.offset ?? 0;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset,
        duration: 1.6,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
      return;
    }

    // Reduced-motion / pre-init fallback.
    if (typeof target === 'number') {
      window.scrollTo({ top: target + offset });
      return;
    }

    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
    }
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
    document.documentElement.classList.add('lenis-stopped');
    document.body.style.overflow = 'hidden';
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
    document.documentElement.classList.remove('lenis-stopped');
    document.body.style.overflow = '';
  }, []);

  const value = useMemo<SmoothScrollValue>(
    () => ({ lenis, scrollTo, stop, start }),
    [lenis, scrollTo, stop, start]
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
