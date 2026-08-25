'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { ArrowUp, ArrowRight, Check } from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/brand-icons';
import { useSmoothScroll } from '@/components/layout/SmoothScroll';
import { Magnetic } from '@/components/motion/Magnetic';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { CONTACT, FOOTER_LINKS, HOURS, SITE, SOCIALS } from '@/lib/site';

const ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
} as const;

/**
 * FOOTER
 *
 * Almost nothing but paper. The newsletter takes the whole left half, the
 * three utility columns are set small and quiet on the right, and below them
 * the wordmark is engraved into the page at fifteen per cent of the viewport
 * width — the largest thing on the site, and the palest.
 *
 * Signature: the wordmark fills. Two copies sit exactly on top of each other,
 * a faint engraved one and a gilt one clipped to nothing, and scrolling wipes
 * the clip open left to right, so the brand lights up as you reach the end.
 */
export function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  const motionOK = useMotionOK();

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
  };

  useGsap(
    () => {
      if (!motionOK) return;

      gsap.fromTo(
        '.footer-rule',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.7,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: '.footer-rule', start: 'top 94%', once: true },
        }
      );

      gsap.fromTo(
        '.footer-col',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.footer-grid', start: 'top 86%', once: true },
        }
      );

      // The wordmark fills as the last of the page scrolls past.
      gsap.fromTo(
        '.footer-wordmark-fill',
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.footer-wordmark',
            start: 'top 92%',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        }
      );
    },
    [motionOK],
    rootRef
  );

  return (
    <footer ref={rootRef} className="relative isolate overflow-hidden pt-section">
      {/* The page settles into a slightly deeper cream at the very bottom, so
          the footer feels like the base of the stack rather than a cut-off. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[80%]"
        style={{
          background:
            'linear-gradient(180deg, rgb(243 238 229 / 0) 0%, rgb(243 238 229 / 0.7) 46%, rgb(238 231 219 / 0.9) 100%)',
        }}
      />

      <div className="shell">
        <div aria-hidden className="rule-gold mb-12 lg:mb-16" />

        {/* ------------------------------- Grid ------------------------------ */}
        <div className="footer-grid grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Newsletter */}
          <div className="footer-col lg:col-span-4">
            <p className="eyebrow">The Sunday Note</p>
            <h2 className="mt-7 max-w-[13em] text-h3">
              One letter a week. What we roasted, and what we are reading.
            </h2>

            {subscribed ? (
              <p className="mt-9 flex items-center gap-3 font-sans text-body text-gold-deep">
                <Check className="size-4 shrink-0" strokeWidth={1.5} />
                Thank you — we&rsquo;ll write on Sunday.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-9 max-w-md">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>

                <div className="group relative flex items-center gap-3 rounded-full border border-hair bg-card/70 py-1.5 pr-1.5 pl-6 shadow-soft transition-[border-color,box-shadow] duration-700 ease-luxe focus-within:border-gold/60 focus-within:shadow-float">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent py-2.5 font-sans text-body text-ink outline-none placeholder:text-faint"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to The Sunday Note"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-[background-color,transform] duration-700 ease-luxe hover:translate-x-0.5 hover:bg-gold-deep"
                  >
                    <ArrowRight className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <p className="mt-4 pl-6 font-sans text-micro text-faint uppercase">
                  No more than one email a week
                </p>
              </form>
            )}
          </div>

          {/* Visit */}
          <div className="footer-col lg:col-span-3 lg:col-start-6">
            <p className="eyebrow">Visit</p>
            <address className="mt-7 space-y-1 font-sans text-body not-italic text-ink-soft/85">
              {CONTACT.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div className="mt-5 flex flex-col gap-4">
              <a
                href={CONTACT.phoneHref}
                className="w-fit py-3 -my-3 font-sans text-body text-ink-soft/85 transition-colors duration-500 hover:text-gold-deep"
              >
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="w-fit py-3 -my-3 font-sans text-body text-ink-soft/85 transition-colors duration-500 hover:text-gold-deep"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="footer-col lg:col-span-2">
            <p className="eyebrow">Hours</p>
            <dl className="mt-7 space-y-4">
              {HOURS.map((entry) => (
                <div key={entry.days}>
                  <dt className="font-sans text-[0.6rem] tracking-wide-sm text-mute uppercase">
                    {entry.days}
                  </dt>
                  <dd className="mt-1 font-sans text-body text-ink-soft/85 tabular-nums">
                    {entry.time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Elsewhere */}
          <div className="footer-col lg:col-span-2">
            <p className="eyebrow">Elsewhere</p>

            <ul className="mt-7 space-y-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 py-3 -my-3 font-sans text-body text-ink-soft/85 transition-colors duration-500 hover:text-gold-deep"
                  >
                    {link.label}
                    <ArrowRight
                      className="size-3 -translate-x-1 opacity-0 transition-[transform,opacity] duration-500 ease-luxe group-hover:translate-x-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-8 flex gap-2.5">
              {SOCIALS.map((social) => {
                const Icon = ICONS[social.icon];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className="grid size-11 place-items-center rounded-full border border-hair bg-card/60 text-ink-soft/70 shadow-soft transition-[color,border-color,transform,box-shadow] duration-700 ease-luxe hover:-translate-y-0.5 hover:border-gold/60 hover:text-gold-deep hover:shadow-float"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ------------------------------ Divider ---------------------------- */}
        <div className="footer-rule hairline mt-14 origin-left lg:mt-20" />
      </div>

      {/* ----------------------------- Wordmark ----------------------------- */}
      <div className="footer-wordmark relative mt-10 px-[2vw] select-none lg:mt-14">
        {/* The font-size lives on the wrapper so the em-based padding below
            scales with the wordmark. That padding matters: `leading-[0.82]`
            crops the line box above the cap height, and a background-clipped
            gradient only paints inside its own box — without the padding the
            grave accent on the E falls outside it and loses its fill. */}
        <div className="relative pt-[0.2em] text-[15.5vw] leading-[0.82] tracking-[-0.02em]">
          {/* Engraved base */}
          <span
            aria-hidden
            className="display-face block text-center text-[1em] leading-[inherit] tracking-[inherit] text-ink/[0.07]"
          >
            {SITE.name}
          </span>

          {/* Gilt fill, wiped open by scroll */}
          <span
            aria-hidden
            className="footer-wordmark-fill display-face absolute inset-0 block pt-[0.2em] text-center text-[1em] leading-[inherit] tracking-[inherit]"
            style={{
              clipPath: 'inset(0% 100% 0% 0%)',
              background:
                'linear-gradient(96deg, var(--color-gold-deep) 0%, var(--color-gold) 30%, var(--color-gold-lit) 50%, var(--color-gold) 70%, var(--color-gold-deep) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {SITE.name}
          </span>
        </div>
      </div>

      {/* ------------------------------ Colophon ---------------------------- */}
      <div className="shell mt-9 flex flex-col-reverse items-center gap-6 border-t border-hair/70 py-9 sm:flex-row sm:justify-between lg:mt-12">
        <p className="font-sans text-micro text-faint uppercase">
          © {new Date().getFullYear()} {SITE.name} · {SITE.established}
        </p>

        <div className="flex items-center gap-6">
          <p className="hidden font-sans text-micro text-faint uppercase sm:block">
            {SITE.tagline}
          </p>

          <Magnetic strength={0.24} padding={28}>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="group flex items-center gap-2.5 font-sans text-micro text-mute uppercase transition-colors duration-500 hover:text-ink"
            >
              <span className="whitespace-nowrap">Back to top</span>
              <span className="grid size-11 place-items-center rounded-full border border-hair bg-card/60 shadow-soft transition-[border-color,transform] duration-700 ease-luxe group-hover:-translate-y-0.5 group-hover:border-gold/60">
                <ArrowUp className="size-3.5" strokeWidth={1.5} />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
