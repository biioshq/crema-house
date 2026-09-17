/**
 * Single source of truth for brand copy, navigation and contact details.
 * Nothing in the component tree hard-codes the brand name.
 */

export const SITE = {
  name: 'LO HAALO STREET LOUNGE CAFE',
  /**
   * The wordmark is set as a lockup of two parts, not one string: the first
   * carries the weight and the second trails it, in the navbar and again at
   * the foot of the page. Splitting it here rather than in the markup is what
   * keeps the promise above — change the name in this file and it changes
   * everywhere, including the line break in the giant footer wordmark.
   */
  nameShort: 'LO HAALO',
  nameSuffix: 'STREET LOUNGE CAFE',
  established: 'EST. MMXIV',
  tagline: 'Coffee, considered.',
  description:
    'A slow-roast coffee house where every cup is measured, timed and poured by hand. Single-origin beans, a quiet room, and the patience to do it properly.',
  url: 'https://lohaalo.example',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Story', href: '/story' },
  { label: 'Menu', href: '/menu' },
  { label: 'Voices', href: '/voices' },
] as const;

export const CONTACT = {
  addressLines: ['14 Ashworth Lane', 'Bandra West, Mumbai 400050'],
  phone: '+91 22 4000 1400',
  phoneHref: 'tel:+912240001400',
  email: 'reserve@lohaalo.example',
  mapsHref: 'https://maps.google.com/?q=Bandra+West+Mumbai',
} as const;

export const HOURS = [
  { days: 'Monday — Thursday', time: '07:00 — 22:00' },
  { days: 'Friday — Saturday', time: '07:00 — 00:00' },
  { days: 'Sunday', time: '08:00 — 21:00' },
] as const;

export const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
] as const;

export const FOOTER_LINKS = [
  { label: 'Our story', href: '/story' },
  { label: 'The full menu', href: '/menu' },
  { label: 'Reservations', href: '/reserve' },
] as const;
