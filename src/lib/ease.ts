/**
 * The easing vocabulary shared with Motion, so a transition it drives looks
 * identical to one GSAP or CSS drives. GSAP reads its curves by name and CSS
 * reads them from `--ease-*` in globals.css; these are the same two curves as
 * control points, for the one library that wants them that way.
 */
export const EASE = {
  /** The house easing. Everything that arrives, arrives on this. */
  luxe: [0.16, 1, 0.3, 1],
  /** Reveals and masks — symmetrical, so a wipe reads the same both ways. */
  curtain: [0.76, 0, 0.24, 1],
} as const satisfies Record<string, [number, number, number, number]>;
