'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { useGsap, gsap, ScrollTrigger } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { NAV_LINKS, SITE } from '@/lib/site';
import { EASE } from '@/lib/ease';
import { cn } from '@/lib/utils';

/**
 * NAV
 *
 * A pill that floats clear of the page. At the top it is nothing but type on
 * the footage; past the first screen it draws in its own frosted surface, a
 * gold hairline and a shadow, and tightens by a few millimetres.
 *
 * Everything that changes on scroll is a *non-transform* property, which is
 * deliberate: a transformed ancestor becomes a backdrop root, and a
 * backdrop-filter with a backdrop root behind it has nothing left to blur.
 * The entrance is the one exception, and it clears its own transform.
 *
 * Two things are pointedly quick. The links are set in the text face at label
 * size, semibold and full ink rather than a 70% wash of it, because a small
 * letterspaced label at 70% opacity on cream is a navigation you have to hunt
 * for. And the pill's own state change no longer transitions `padding` (which
 * relayouts) or `backdrop-filter` (which re-blurs the entire viewport, every
 * frame, for the length of the transition).
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const motionOK = useMotionOK();

  // Entrance. The transform is removed the instant it lands so the frosted
  // pill below can actually sample the page behind it.
  useIsoLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>('.nav-pill');
    if (!bar) return;

    if (!motionOK) {
      gsap.set(bar, { opacity: 1, clearProps: 'transform' });
      return;
    }

    const tween = gsap.fromTo(
      bar,
      { opacity: 0, y: -22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        delay: 0.12,
        ease: 'power4.out',
        onComplete: () => gsap.set(bar, { clearProps: 'transform,willChange' }),
      }
    );

    return () => {
      tween.kill();
    };
  }, [motionOK]);

  useGsap(() => {
    const trigger = ScrollTrigger.create({
      start: 'top -80',
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
    });

    return () => trigger.kill();
  }, []);

  // Close the overlay whenever the route actually changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isCurrent = useCallback(
    (href: string) =>
      // "/" has to match exactly — every path starts with a slash, so the
      // prefix test would mark Home current on every route.
      href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="shell pt-2.5 sm:pt-3.5 lg:pt-4">
          <div
            className={cn(
              'nav-pill pointer-events-auto relative mx-auto flex items-center justify-between gap-6 rounded-full reveal',
              'transition-[background-color,border-color,box-shadow] duration-500 ease-luxe',
              'border px-5 sm:px-7',
              scrolled
                ? 'h-[3.5rem] border-gold/25 bg-card/75 shadow-float backdrop-blur-lg lg:h-16'
                : 'h-16 border-transparent bg-transparent shadow-none lg:h-[4.5rem]'
            )}
          >
            {/* An inner hairline of white light along the top edge — the thing
                that turns a translucent pill into a piece of glass. */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 ease-luxe',
                scrolled ? 'opacity-100' : 'opacity-0'
              )}
              style={{ boxShadow: 'inset 0 1px 0 0 rgb(255 255 255 / 0.9)' }}
            />

            {/* Wordmark. Padding plus a matching negative margin gives a 44px
                hit area without moving anything. */}
            {/* The halo is in the page colour: invisible against paper, and
                the only thing holding the wordmark together where the
                transparent pill sits directly on the hero footage. */}
            {/* Stacked below `sm`, on one baseline above it.

                Twenty-seven letterspaced characters do not fit beside a 44px
                menu button on a narrow phone — at 320px the single line runs
                about thirty pixels past it. Stacking is better than shrinking
                the type to nothing or dropping half the name, and the pill is
                already tall enough to hold two lines. */}
            <Link
              href="/"
              className="group relative flex flex-col items-start gap-0.5 py-3.5 -my-3.5 sm:flex-row sm:items-baseline sm:gap-2.5"
              style={{ textShadow: '0 1px 14px rgb(248 245 239 / 0.9)' }}
            >
              <span className="font-sans text-label leading-none font-semibold tracking-[0.2em] whitespace-nowrap text-ink sm:tracking-[0.26em]">
                {SITE.nameShort}
              </span>
              <span className="font-sans text-[0.6rem] leading-none font-medium tracking-[0.18em] whitespace-nowrap text-ink-soft transition-colors duration-200 group-hover:text-gold-deep sm:text-micro sm:tracking-[0.3em]">
                {SITE.nameSuffix}
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className={cn(
                      'group relative block py-2 font-sans text-label font-semibold tracking-[0.2em] uppercase transition-colors duration-200 hover:text-ink',
                      isCurrent(link.href) ? 'text-ink' : 'text-ink-soft'
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute inset-x-0 -bottom-0.5 h-px bg-gold transition-transform duration-400 ease-luxe',
                        isCurrent(link.href)
                          ? 'scale-x-100'
                          : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100'
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <Magnetic className="hidden sm:inline-block" strength={0.22} padding={26}>
                <Button asChild size="sm" variant="outline">
                  <Link href="/reserve">Reserve</Link>
                </Button>
              </Magnetic>

              {/* Mobile trigger */}
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative grid size-11 touch-manipulation place-items-center rounded-full border border-hair bg-card/60 transition-transform duration-[120ms] ease-luxe active:scale-90 lg:hidden"
              >
                <span className="sr-only">Menu</span>
                <span
                  className={cn(
                    'absolute h-px w-4 bg-ink transition-transform duration-300 ease-luxe',
                    open ? 'translate-y-0 rotate-45' : '-translate-y-[3px]'
                  )}
                />
                <span
                  className={cn(
                    'absolute h-px w-4 bg-ink transition-transform duration-300 ease-luxe',
                    open ? 'translate-y-0 -rotate-45' : 'translate-y-[3px]'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-bleed mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.55, ease: EASE.curtain }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-canvas lg:hidden"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(88% 52% at 50% 104%, rgb(241 231 213 / 0.9), transparent 70%)',
              }}
            />

            <ul className="shell relative flex flex-col gap-1 pb-[18vh]">
              {NAV_LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ y: 42, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 22, opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.6, ease: EASE.luxe, delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="display-face block py-2 text-h2 text-ink"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}

              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.32, duration: 0.45 }}
                className="mt-10"
              >
                <div aria-hidden className="rule-gold mb-10" />
                <Button asChild size="lg" variant="gilt">
                  <Link href="/reserve" onClick={() => setOpen(false)}>
                    Reserve a table
                  </Link>
                </Button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
