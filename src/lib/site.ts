/**
 * Single source of truth for brand copy, navigation and contact details.
 * Nothing in the component tree hard-codes the brand name.
 */

export const SITE = {
  name: 'CRÈMA HOUSE',
  nameShort: 'CRÈMA',
  established: 'EST. MMXIV',
  tagline: 'Coffee, considered.',
  description:
    'A slow-roast coffee house where every cup is measured, timed and poured by hand. Single-origin beans, a quiet room, and the patience to do it properly.',
  url: 'https://cremahouse.example',
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
  email: 'reserve@cremahouse.example',
  mapsHref: 'https://maps.google.com/?q=Bandra+West+Mumbai',
} as const;

/**
 * Ranges read "to", not a dash. A spaced em dash between two times was one of
 * the long typographic lines the redesign took out, and "to" is also what a
 * screen reader ought to say. Two neighbouring days are joined with "and",
 * and midnight is spelled out because "07:00 to 00:00" looks like a typo.
 * `days` doubles as the React key in Footer and Reserve, so keep it unique.
 */
export const HOURS = [
  { days: 'Monday to Thursday', time: '07:00 to 22:00' },
  { days: 'Friday and Saturday', time: '07:00 to midnight' },
  { days: 'Sunday', time: '08:00 to 21:00' },
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
