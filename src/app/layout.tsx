import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Nav } from '@/components/layout/Nav';
import { Grain } from '@/components/layout/Grain';
import { Footer } from '@/components/sections/Footer';
import { SITE } from '@/lib/site';

/**
 * Display: Cormorant Garamond — a high-contrast old-style with long, fine
 * hairlines. Held at 300 for the very large sizes, where a heavier weight
 * would read as a magazine cover rather than a five-star lobby.
 * Text: Inter, for the micro-labels and body copy.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
  // Cormorant is not a variable font: every weight and every style is a
  // separate file. The display face is set at 300 everywhere on the site and
  // the two <em>s that exist are both `not-italic`, so the other six faces
  // were downloaded for nothing — and every one of them delayed
  // `document.fonts.ready`, which is what every split-text reveal waits on.
  weight: ['300', '400'],
  style: ['normal'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
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
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: 'en_IN',
    images: [
      { url: '/media/og.jpg', width: 1200, height: 630, alt: `The room at ${SITE.name}` },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
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
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
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
