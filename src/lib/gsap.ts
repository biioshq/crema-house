'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

/**
 * Registered once, imported everywhere. Keeping registration in a module
 * guarantees a single ScrollTrigger instance regardless of import order.
 *
 * SplitText and DrawSVGPlugin ship in the public gsap package from 3.13
 * onwards (this project is on 3.15), so no club membership and no private
 * registry are involved. SplitText does the text splitting for RevealRunner —
 * it keeps nested markup and the accessible name intact, which the
 * hand-rolled splitter it replaced could not. DrawSVGPlugin is what draws the
 * illustration outlines on.
 */
let registered = false;

if (typeof window !== 'undefined' && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

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

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
