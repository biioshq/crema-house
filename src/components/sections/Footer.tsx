'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { ArrowUp, ArrowRight, Check } from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/brand-icons';
import { Blossom, Daisy, Tulip } from '@/components/illustrations/Florals';
import { Sprig, Vine } from '@/components/illustrations/Foliage';
import { Sparkle } from '@/components/illustrations/Doodles';
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
 * Almost nothing but paper. The newsletter takes the left of the grid, the
 * three utility columns are set small and quiet on the right, and below them
 * the wordmark is engraved into the page at the full width of the viewport:
 * the largest thing on the site, and the palest.
 *
 * Text reveals are declarative (`data-text`, played by the RevealRunner), and
 * so are the drawings (`data-ill`): a vine where the page hands over to the
 * footer, and a little garden of tulips, daisies and coffee blossom that
 * grows along the top of the wordmark as you reach the end.
 *
 * Signature: the wordmark fills. Two copies sit exactly on top of each other,
 * a faint engraved one and a gilt one clipped to nothing, and scrolling wipes
 * the clip open left to right, so the brand lights up under the flowers.
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
      // With reduced motion the gilt copy is simply shown, fully filled.
      if (!motionOK) {
        gsap.set('.footer-wordmark-fill', { clipPath: 'inset(0% 0% 0% 0%)' });
        return;
      }

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
        {/* A hand-drawn vine is the hand-over from the page to the footer. */}
        <Vine
          data-ill
          orientation="horizontal"
          className="mx-auto mb-12 block h-auto w-full max-w-5xl lg:mb-16"
        />

        {/* ------------------------------- Grid ------------------------------ */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Newsletter */}
          <div className="lg:col-span-4">
            <p data-text="write" className="eyebrow">
              The Sunday note
            </p>

            <div className="relative mt-5 max-w-[13em] text-h3">
              <h2 data-text="wipe" className="text-h3">
                One letter a week. What we roasted, and what we are{' '}
                <em className="accent">reading</em>.
              </h2>
              <Sparkle
                data-ill
                data-ill-delay="0.5"
                className="pointer-events-none absolute -top-4 right-0 size-6 sm:-right-4 sm:size-7"
              />
            </div>

            {subscribed ? (
              <p className="mt-9 flex items-center gap-3 font-sans text-body text-clay-deep">
                <Check className="size-4 shrink-0" strokeWidth={1.5} />
                Thank you, we&rsquo;ll write on Sunday.
              </p>
            ) : (
              <form data-text="fade" onSubmit={onSubmit} className="mt-9 max-w-md">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>

                <div className="group relative flex items-center gap-3 rounded-full border border-hair bg-card/70 py-1.5 pr-1.5 pl-6 shadow-soft transition-[border-color,box-shadow] duration-700 ease-luxe focus-within:border-clay/60 focus-within:shadow-float">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    // Never below 16px. `--text-body` clamps to 15.34px at
                    // 360px wide, and iOS Safari zooms the viewport on any
                    // input it focuses that is under 16px — leaving the page
                    // panned sideways with no way back. The `max()` floors it
                    // on phones and still tracks the clamp up on desktop; the
                    // leading is restated because an arbitrary font-size does
                    // not carry `--text-body--line-height` with it.
                    className="w-full bg-transparent py-2.5 font-sans text-[max(1rem,var(--text-body))] leading-[1.75] text-ink outline-none placeholder:text-faint"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to The Sunday Note"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-canvas transition-[background-color,transform] duration-700 ease-luxe hover:translate-x-0.5 hover:bg-clay-deep"
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
          <div className="lg:col-span-3 lg:col-start-6">
            <p data-text="write" className="eyebrow">
              Visit
            </p>
            <address
              data-text="lines"
              className="mt-5 space-y-1 font-sans text-body not-italic text-ink-soft/85"
            >
              {CONTACT.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div data-text="fade" className="mt-5 flex flex-col gap-4">
              <a
                href={CONTACT.phoneHref}
                className="w-fit py-3 -my-3 font-sans text-body text-ink-soft/85 transition-colors duration-500 hover:text-clay-deep"
              >
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="w-fit py-3 -my-3 font-sans text-body text-ink-soft/85 transition-colors duration-500 hover:text-clay-deep"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="lg:col-span-2">
            <p data-text="write" className="eyebrow">
              Hours
            </p>
            <dl className="mt-5 space-y-4">
              {HOURS.map((entry) => (
                <div key={entry.days} data-text="fade">
                  <dt className="font-sans text-label tracking-wide-sm text-ink-soft/85 uppercase">
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
          <div className="lg:col-span-2">
            <p data-text="write" className="eyebrow">
              Elsewhere
            </p>

            <ul className="mt-5 space-y-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label} data-text="fade">
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 py-3 -my-3 font-sans text-body text-ink-soft/85 transition-colors duration-500 hover:text-clay-deep"
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

            <ul data-text="fade" className="mt-8 flex gap-2.5">
              {SOCIALS.map((social) => {
                const Icon = ICONS[social.icon];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className="grid size-11 place-items-center rounded-full border border-hair bg-card/60 text-ink-soft/70 shadow-soft transition-[color,border-color,transform,box-shadow] duration-700 ease-luxe hover:-translate-y-0.5 hover:border-clay/60 hover:text-clay-deep hover:shadow-float"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ------------------------------ Garden ------------------------------ */}
      {/* Clumps of flowers stand along the top edge of the wordmark, stems
          dipping into the padding above its capitals. Phones keep three small
          clumps; wider screens fill in the gaps. */}
      <div
        aria-hidden
        className="footer-garden pointer-events-none relative z-10 mx-auto mt-16 flex max-w-[92rem] items-end justify-between px-[5vw] lg:mt-24"
      >
        <div className="flex items-end">
          <Sprig data-ill flip className="-mr-1 h-5 w-auto sm:h-7" />
          <Tulip data-ill data-ill-delay="0.1" className="h-16 w-auto sm:h-24 lg:h-28" />
          <Daisy data-ill data-ill-delay="0.25" className="-ml-1 h-8 w-auto sm:h-11 lg:h-12" />
        </div>

        <div className="hidden items-end md:flex">
          <Blossom data-ill data-ill-delay="0.35" className="h-12 w-auto lg:h-16" />
          <Daisy data-ill data-ill-delay="0.45" className="-ml-1 h-7 w-auto lg:h-9" />
        </div>

        <div className="flex items-end">
          <Daisy
            data-ill
            data-ill-delay="0.3"
            className="-mr-1 hidden h-9 w-auto sm:block lg:h-10"
          />
          <Blossom data-ill data-ill-delay="0.4" className="h-10 w-auto sm:h-14 lg:h-16" />
          <Tulip data-ill data-ill-delay="0.5" className="-ml-1 h-14 w-auto sm:h-20 lg:h-24" />
        </div>

        <div className="hidden items-end md:flex">
          <Tulip data-ill data-ill-delay="0.55" className="h-20 w-auto lg:h-24" />
          <Sprig data-ill data-ill-delay="0.6" className="-ml-1 h-6 w-auto lg:h-7" />
        </div>

        <div className="flex items-end">
          <Daisy data-ill data-ill-delay="0.6" className="-mr-1 h-7 w-auto sm:h-10 lg:h-11" />
          <Tulip data-ill data-ill-delay="0.7" className="h-[4.5rem] w-auto sm:h-24 lg:h-32" />
          <Sprig data-ill data-ill-delay="0.8" className="-ml-1 h-5 w-auto sm:h-7" />
        </div>
      </div>

      {/* ----------------------------- Wordmark ----------------------------- */}
      <div className="footer-wordmark relative -mt-[2.2vw] px-[2vw] select-none">
        {/* The font-size lives on the wrapper so the em-based padding below
            scales with the wordmark. That padding matters: `leading-[0.82]`
            crops the line box above the cap height, and a background-clipped
            gradient only paints inside its own box; without the padding the
            grave accent on the E falls outside it and loses its fill. The
            size is set so the wide Fraunces capitals fit from 320px up. */}
        <div className="relative pt-[0.2em] text-[12.6vw] leading-[0.82] tracking-[-0.02em]">
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
                'linear-gradient(96deg, var(--color-clay-deep) 0%, var(--color-clay) 30%, var(--color-clay-lit) 50%, var(--color-clay) 70%, var(--color-clay-deep) 100%)',
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
      <div className="shell mt-9 flex flex-col-reverse items-center gap-6 py-9 sm:flex-row sm:justify-between lg:mt-12">
        <p data-text="fade" className="font-sans text-micro text-faint uppercase">
          © {new Date().getFullYear()} {SITE.name} · {SITE.established}
        </p>

        <div data-text="fade" className="flex items-center gap-6">
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
              <span className="grid size-11 place-items-center rounded-full border border-hair bg-card/60 shadow-soft transition-[border-color,transform] duration-700 ease-luxe group-hover:-translate-y-0.5 group-hover:border-clay/60">
                <ArrowUp className="size-3.5" strokeWidth={1.5} />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
