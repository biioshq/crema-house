import { createElement, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Compatibility wrapper around the declarative reveal API.
 *
 * All of the machinery that used to live here — the splitter, the per-mode
 * timelines, the font wait, the resize re-split — is now
 * `components/motion/RevealRunner.tsx`, which drives every revealed element on
 * the site from one place. This component is what is left: it renders the
 * `data-text` attributes for the pages that still call it by name, with the
 * same props they always passed.
 *
 * It is no longer a client component, and it no longer hides anything itself:
 * the pre-hide is the CSS rule keyed on `[data-js]`.
 */
export type SplitMode =
  /** Letters resolve out of blur. */
  | 'chars-blur'
  /** Words hinge up from their baseline in 3D. */
  | 'words-flip'
  /** Whole lines rise out of a mask. */
  | 'lines-rise'
  /** Letters converge from scattered offsets. */
  | 'chars-scatter'
  /** Each line unveils left to right behind a moving edge. */
  | 'mask-wipe';

/** Old mode names in, runner mode names out. */
const MODES: Record<SplitMode, string> = {
  'chars-blur': 'chars',
  'words-flip': 'flip',
  'lines-rise': 'lines',
  'chars-scatter': 'scatter',
  'mask-wipe': 'wipe',
};

type SplitHeadingProps = {
  as?: ElementType;
  id?: string;
  mode: SplitMode;
  children: ReactNode;
  className?: string;
  /** ScrollTrigger start position. */
  start?: string;
  delay?: number;
  /** Overrides the per-mode default. */
  stagger?: number;
};

export function SplitHeading({
  as = 'h2',
  id,
  mode,
  children,
  className,
  start = 'top 82%',
  delay,
  stagger,
}: SplitHeadingProps) {
  return createElement(
    as,
    {
      id,
      className: cn(className),
      'data-text': MODES[mode] ?? 'lines',
      'data-text-start': start,
      // Omitted rather than zeroed, so a heading with no explicit delay can
      // still take its place in the runner's sibling cascade.
      'data-text-delay': delay === undefined ? undefined : String(delay),
      'data-text-stagger': stagger === undefined ? undefined : String(stagger),
    },
    children
  );
}
