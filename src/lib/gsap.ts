'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Registered once, imported everywhere. Keeping registration in a module
 * guarantees a single ScrollTrigger instance regardless of import order.
 */
let registered = false;

if (typeof window !== 'undefined' && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({
    ease: 'power4.out',
    duration: 1,
  });

  // Mobile browsers resize the viewport when the URL bar collapses; without
  // this every pinned section recalculates mid-scroll and visibly jumps.
  ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
  });
}

export { gsap, ScrollTrigger };
