import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Nav } from '@/components/layout/Nav';
import { Grain } from '@/components/layout/Grain';
import { Footer } from '@/components/sections/Footer';
import { SITE } from '@/lib/site';

/**
 * Display: Fraunces, held at a high optical size with the soft and wonk axes
 * dialled to zero — refined rather than playful.
 * Text: Inter, for the micro-labels and body copy.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
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
  themeColor: '#0a0705',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only rounded-full bg-porcelain px-5 py-3 font-sans text-micro tracking-luxe text-espresso uppercase focus:not-sr-only focus:fixed focus:top-5 focus:left-5 focus:z-[120]"
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
