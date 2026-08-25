import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be told about the custom scales in `@theme`.
 *
 * Without this it classifies every unknown `text-*` class as a colour, so
 * `text-ink text-label` collapses to `text-label` and the label loses
 * its colour entirely. Declaring the font sizes explicitly puts each class
 * in the right conflict group.
 */
const FONT_SIZES = ['micro', 'label', 'body', 'lede', 'h1', 'h2', 'h3'];

const COLORS = [
  'canvas',
  'sand',
  'card',
  'hair',
  'hair-soft',
  'ink',
  'ink-soft',
  'mute',
  'faint',
  'gold',
  'gold-lit',
  'gold-deep',
  'gold-wash',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      'text-color': [{ text: COLORS }],
      'bg-color': [{ bg: COLORS }],
      'border-color': [{ border: COLORS }],
      tracking: [{ tracking: ['luxe', 'wide-sm'] }],
      shadow: [{ shadow: ['soft', 'float', 'lift', 'glow', 'pill'] }],
      animate: [{ animate: ['pulse-soft'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
