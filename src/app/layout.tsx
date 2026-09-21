import type { Metadata, Viewport } from 'next';
import { Fraunces, Bricolage_Grotesque, Caveat } from 'next/font/google';
import './globals.css';

import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { RevealRunner } from '@/components/motion/RevealRunner';
import { Nav } from '@/components/layout/Nav';
import { Grain } from '@/components/layout/Grain';
import { Footer } from '@/components/sections/Footer';
import { SITE } from '@/lib/site';

/**
 * Display: Fraunces — a soft, slightly wonky old-style with real optical
 * sizing. The variable file carries three axes beyond weight: SOFT (rounds the
 * terminals), WONK (swaps in the cheerfully off-kilter alternates) and opsz.
 * `display-face` in globals.css pins SOFT 100 / WONK 1, which is the whole
 * point of choosing it — a default-axis Fraunces just reads as another
 * high-contrast serif.
 *
 * Text: Bricolage Grotesque — a grotesque with a bit of hand in it, so the
 * labels and body copy stop reading as a system UI font.
 *
 * Hand: Caveat — eyebrows, stickers and margin notes.
 *
 * One variable file per family (two for Fraunces, which has a drawn italic
 * used for accent words), because every face downloaded here delays
 * `document.fonts.ready`, which is what RevealRunner waits on before it splits
 * a single line of text.
 */
// Only the axes the stylesheet actually varies are requested. Every extra axis
// is carried in the variable file whether or not a rule ever moves it, and
// these three were pure weight: `font-variation-settings` appears exactly three
// times in globals.css and names `SOFT` and `WONK` and nothing else, so
// Fraunces' `opsz` and Bricolage's `opsz`/`wdth` were being downloaded, on
// every visit, to sit at their defaults.
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK'],
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

// Caveat's only axis is weight, and next/font errors on an `axes` array for a
// font with nothing else to define.
const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});

/**
 * Pre-hide script.
 *
 * The reveal states are set by JS, but the elements are hidden by CSS keyed on
 * `data-js` — so text is only ever invisible on a page that actually has
 * JavaScript running. Inline and synchronous in <head> so the attribute is on
 * <html> before the first paint; setting it from React would flash the copy.
 * It is an attribute written by a script rather than rendered by React, so
 * there is nothing for hydration to disagree about.
 *
 * The 3.5s timer is the guarantee of last resort: if the runner never gets as
 * far as claiming the page (a chunk that fails to load, a throw during
 * hydration), the attribute comes off and every `data-text` element falls back
 * to plain, visible text.
 */
const PRE_HIDE = `(function(){try{var d=document.documentElement;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.setAttribute('data-js','');
setTimeout(function(){if(!d.hasAttribute('data-reveal-live'))d.removeAttribute('data-js');},3500);
}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'specialty coffee',
    'slow roast',
    'single origin',
    'coffee house',
    'Mumbai café',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    locale: 'en_IN',
    images: [
      { url: '/media/og.jpg', width: 1200, height: 630, alt: `The room at ${SITE.name}` },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    images: ['/media/og.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f8f5ef',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is scoped to this one element's attributes, and
    // it is here for exactly one reason: the pre-hide script below writes
    // `data-js` onto <html> before React hydrates, and React 19 compares the
    // root element's attributes against what the server sent.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${bricolage.variable} ${caveat.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HIDE }} />
      </head>
      <body>
        {/* The warm pools that light the page. A fixed element rather than a
            fixed background — see .page-glow in globals.css. */}
        <div aria-hidden className="page-glow" />

        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-5 py-3 font-sans text-micro tracking-luxe text-canvas uppercase focus:not-sr-only focus:fixed focus:top-5 focus:left-5 focus:z-[120]"
        >
          Skip to content
        </a>

        <SmoothScroll>
          {/* One runner for the whole site: it animates every element carrying
              data-text and every illustration carrying data-ill, wherever they
              are rendered. Inside SmoothScroll so its ScrollTriggers and
              Lenis share the single RAF loop. */}
          <RevealRunner />
          <Nav />
          {/* The footer is a sibling of <main>, not part of it. */}
          <main id="main">{children}</main>
          <Footer />
          <Grain />
        </SmoothScroll>
      </body>
    </html>
  );
}
