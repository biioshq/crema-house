import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be told about the custom scales in `@theme`.
 *
 * Without this it classifies every unknown `text-*` class as a colour, so
 * `text-espresso text-label` collapses to `text-label` and the label loses
 * its colour entirely. Declaring the font sizes explicitly puts each class
 * in the right conflict group.
 */
const FONT_SIZES = ['micro', 'label', 'body', 'lede', 'h1', 'h2', 'h3', 'display'];

const COLORS = [
  'espresso',
  'bean',
  'walnut',
  'clay',
  'porcelain',
  'crema',
  'ash',
  'ember',
  'gold',
  'gold-lit',
  'gold-dim',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      'text-color': [{ text: COLORS }],
      'bg-color': [{ bg: COLORS }],
      'border-color': [{ border: COLORS }],
      tracking: [{ tracking: ['luxe', 'wide-sm'] }],
      shadow: [{ shadow: ['lift', 'glow', 'inset-hair'] }],
      animate: [{ animate: ['drift', 'pulse-soft', 'marquee'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

/** Remap a value from one range to another, clamped to the output range. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
};

/**
 * Frame-rate independent lerp. `smoothing` is the fraction of distance
 * remaining after one second — 0.001 is a fast settle, 0.5 is a slow drift.
 */
export const damp = (from: number, to: number, smoothing: number, delta: number) =>
  lerp(from, to, 1 - Math.pow(smoothing, delta));

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
