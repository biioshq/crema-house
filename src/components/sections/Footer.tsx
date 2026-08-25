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
 * Signature: the wordmark fills. Two stacked copies of the name sit exactly
 * on top of each other — a dark engraved one and a bright one clipped to
 * nothing — and scrolling wipes the clip open left to right, so the brand
 * literally lights up as you reach the bottom of the page. Above it, a
 * hairline draws itself across the full width.
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

      // The divider draws across as the footer arrives.
      gsap.fromTo(
        '.footer-rule',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: '.footer-rule', start: 'top 92%', once: true },
        }
      );

      gsap.fromTo(
        '.footer-col',
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
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
    <footer
      ref={rootRef}
      className="relative isolate overflow-hidden border-t border-clay/25 pt-section"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%]"
        style={{
          background:
            'radial-gradient(80% 100% at 50% 108%, rgb(120 80 34 / 0.20) 0%, transparent 70%)',
        }}
      />

      <div className="shell">
        {/* ------------------------------- Grid ------------------------------ */}
        <div className="footer-grid grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Newsletter */}
          <div className="footer-col lg:col-span-5">
            <p className="eyebrow">The Sunday Note</p>
            <h2 className="mt-6 max-w-[14em] text-h3">
              One letter a week. What we roasted, and what we are reading.
            </h2>

            {subscribed ? (
              <p className="mt-8 flex items-center gap-3 font-sans text-body text-gold-lit">
                <Check className="size-4 shrink-0" strokeWidth={1.5} />
                Thank you — we&rsquo;ll write on Sunday.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 max-w-sm">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>

                <div className="group relative flex items-center gap-3 border-b border-crema/20 pb-3 transition-colors duration-500 focus-within:border-gold">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent py-2.5 font-sans text-body text-porcelain outline-none placeholder:text-ember"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to The Sunday Note"
                    className="grid size-11 shrink-0 place-items-center rounded-full text-crema transition-[color,transform] duration-500 ease-luxe hover:translate-x-0.5 hover:text-gold-lit"
                  >
                    <ArrowRight className="size-4" strokeWidth={1.5} />
                  </button>
                </div>

                <p className="mt-3 font-sans text-micro text-ember uppercase">
                  No more than one email a week
                </p>
              </form>
            )}
          </div>

          {/* Visit */}
          <div className="footer-col lg:col-span-3">
            <p className="eyebrow">Visit</p>
            <address className="mt-6 space-y-1 font-sans text-body not-italic text-crema/75">
              {CONTACT.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div className="mt-5 flex flex-col gap-4">
              <a
                href={CONTACT.phoneHref}
                className="w-fit py-3 -my-3 font-sans text-body text-crema/75 transition-colors duration-500 hover:text-porcelain"
              >
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="w-fit py-3 -my-3 font-sans text-body text-crema/75 transition-colors duration-500 hover:text-porcelain"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="footer-col lg:col-span-2">
            <p className="eyebrow">Hours</p>
            <dl className="mt-6 space-y-3">
              {HOURS.map((entry) => (
                <div key={entry.days}>
                  <dt className="font-sans text-[0.6rem] tracking-wide-sm text-ash uppercase">
                    {entry.days}
                  </dt>
                  <dd className="mt-1 font-sans text-body text-crema/75 tabular-nums">
                    {entry.time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Elsewhere */}
          <div className="footer-col lg:col-span-2">
            <p className="eyebrow">Elsewhere</p>

            <ul className="mt-6 space-y-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 py-3 -my-3 font-sans text-body text-crema/75 transition-colors duration-500 hover:text-porcelain"
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

            <ul className="mt-7 flex gap-2.5">
              {SOCIALS.map((social) => {
                const Icon = ICONS[social.icon];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className="grid size-11 place-items-center rounded-full border border-crema/15 text-crema/70 transition-[color,border-color,transform] duration-500 ease-luxe hover:-translate-y-0.5 hover:border-gold/60 hover:text-gold-lit"
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
        <div className="footer-rule mt-20 h-px w-full origin-left bg-linear-to-r from-transparent via-clay to-transparent lg:mt-28" />
      </div>

      {/* ----------------------------- Wordmark ----------------------------- */}
      <div className="footer-wordmark relative mt-14 px-[2vw] select-none lg:mt-20">
        {/* The font-size lives on the wrapper so the em-based padding below
            scales with the wordmark. That padding matters: `leading-[0.82]`
            crops the line box above the cap height, and a background-clipped
            gradient only paints inside its own box — without the padding the
            grave accent on the E falls outside it and loses its fill. */}
        <div className="relative pt-[0.18em] text-[15.5vw] leading-[0.82] tracking-[-0.04em]">
          {/* Engraved base */}
          <span
            aria-hidden
            className="display-face block text-center text-[1em] leading-[inherit] tracking-[inherit] text-porcelain/[0.07]"
          >
            {SITE.name}
          </span>

          {/* Bright fill, wiped open by scroll */}
          <span
            aria-hidden
            className="footer-wordmark-fill display-face absolute inset-0 block pt-[0.18em] text-center text-[1em] leading-[inherit] tracking-[inherit]"
            style={{
              clipPath: 'inset(0% 100% 0% 0%)',
              background:
                'linear-gradient(96deg, var(--color-gold-dim) 0%, var(--color-gold-lit) 32%, #fff4de 52%, var(--color-gold-lit) 72%, var(--color-gold-dim) 100%)',
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
      <div className="shell mt-12 flex flex-col-reverse items-center gap-6 border-t border-clay/20 py-8 sm:flex-row sm:justify-between lg:mt-16">
        <p className="font-sans text-micro text-ember uppercase">
          © {new Date().getFullYear()} {SITE.name} · {SITE.established}
        </p>

        <div className="flex items-center gap-6">
          <p className="hidden font-sans text-micro text-ember uppercase sm:block">
            {SITE.tagline}
          </p>

          <Magnetic strength={0.26} padding={28}>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="group flex items-center gap-2.5 font-sans text-micro text-crema/70 uppercase transition-colors duration-500 hover:text-porcelain"
            >
              <span className="whitespace-nowrap">Back to top</span>
              <span className="grid size-11 place-items-center rounded-full border border-crema/15 transition-[border-color,transform] duration-500 ease-luxe group-hover:-translate-y-0.5 group-hover:border-gold/60">
                <ArrowUp className="size-3.5" strokeWidth={1.5} />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
