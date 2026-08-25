/**
 * One easing vocabulary shared by CSS, GSAP and Framer Motion so that a
 * transition looks identical no matter which engine happens to drive it.
 */

/** Framer Motion / CSS cubic-bezier control points. */
export const EASE = {
  luxe: [0.16, 1, 0.3, 1],
  curtain: [0.76, 0, 0.24, 1],
  drift: [0.33, 1, 0.68, 1],
  snap: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** GSAP accepts the same curves via CustomEase-free string syntax. */
export const GSAP_EASE = {
  luxe: 'power4.out',
  curtain: 'power3.inOut',
  drift: 'power2.out',
  expo: 'expo.out',
} as const;

/** Durations, in seconds, kept deliberately slow — luxury reads as unhurried. */
export const DUR = {
  quick: 0.4,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.8,
} as const;

/** Standard stagger amounts for split text and card grids. */
export const STAGGER = {
  char: 0.022,
  word: 0.06,
  line: 0.09,
  card: 0.11,
} as const;
