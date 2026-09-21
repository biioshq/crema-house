'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Squiggle } from '@/components/illustrations/Doodles';
import { Magnetic } from '@/components/motion/Magnetic';
import { Wordmark } from '@/components/layout/Wordmark';
import { useGsap, gsap, ScrollTrigger } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { NAV_LINKS, SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * NAV
 *
 * A pill that floats clear of the page. At the top it is nothing but type on
 * the footage; past the first screen it draws in its own frosted surface, a
 * clay hairline and a shadow, and tightens by a few millimetres.
 *
 * Everything that changes on scroll is a *non-transform* property, which is
 * deliberate: a transformed ancestor becomes a backdrop root, and a
 * backdrop-filter with a backdrop root behind it has nothing left to blur.
 * The entrance is the one exception, and it clears its own transform.
 *
 * Two things are pointedly quick. The links are set in the text face at label
 * size, semibold and full ink rather than a 70% wash of it, with only a light
 * track (a wide-spaced label is the luxury-template tell, and at 70% opacity
 * on cream it is a navigation you have to hunt for). And the pill's own state change no longer transitions `padding` (which
 * relayouts) or `backdrop-filter` (which re-blurs the entire viewport, every
 * frame, for the length of the transition).
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  /**
   * Focus goes into the panel when it opens, stays there while it is open, and
   * comes back to the trigger when it closes.
   *
   * Without this the page behind an opaque, full-screen overlay is still in the
   * tab order: the focus ring walks off into content nobody can see and does
   * not come back. The trigger is deliberately the first stop in the cycle —
   * it lives in the header, outside the panel, and it is also the close
   * button, so a trap built only from the panel's own links would make the
   * menu impossible to leave by keyboard.
   */
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusables = () => {
      const inPanel = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      );
      const trigger = triggerRef.current;
      return trigger ? [trigger, ...inPanel] : inPanel;
    };

    focusables()[1]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length < 2) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

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
                ? 'h-[3.5rem] border-clay/25 bg-card/75 shadow-float backdrop-blur-lg lg:h-16'
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
                hit area without moving anything. Nothing is laid behind it:
                the lockup stands on whatever the pill is standing on. */}
            <Link href="/" aria-label={`${SITE.name} — home`} className="group py-3.5 -my-3.5">
              <Wordmark />
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className={cn(
                      'group relative block py-2 font-sans text-label font-semibold tracking-[0.1em] uppercase transition-colors duration-200 hover:text-ink',
                      isCurrent(link.href) ? 'text-ink' : 'text-ink-soft'
                    )}
                  >
                    {link.label}
                    {/* The current/hover marker is a hand-drawn wiggle rather
                        than a hairline: the one straight rule left in the
                        chrome was also the most template-looking thing in it.
                        No `data-ill` — this is a hover state, not a reveal. */}
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-x-0 -bottom-1 block transition-transform duration-400 ease-luxe',
                        isCurrent(link.href)
                          ? 'scale-x-100'
                          : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100'
                      )}
                    >
                      <Squiggle className="block h-1.75 w-full text-clay" />
                    </span>
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
              {/* The bars were a hairline: 1px tall and 16px wide, which on a
                  phone screen in daylight, over moving footage, is close to
                  invisible. 2px at 20px with round caps is still a quiet mark
                  and is actually a control you can see. No `sr-only` label
                  either — `aria-label` already names the button, and the two
                  together had screen readers saying "Open menu, Menu". */}
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative grid size-11 touch-manipulation place-items-center rounded-full border border-clay/20 bg-card/85 transition-transform duration-[120ms] ease-luxe active:scale-90 lg:hidden"
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ease-luxe',
                    open ? 'translate-y-0 rotate-45' : '-translate-y-[4px]'
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    'absolute h-0.5 w-5 rounded-full bg-ink transition-transform duration-300 ease-luxe',
                    open ? 'translate-y-0 -rotate-45' : 'translate-y-[4px]'
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-bleed mobile menu.

          The panel scrolls. It used to be a `justify-end` column with
          `pb-[18vh]` and no overflow, which is fine on a tall phone and
          unusable on a short one: turn a 740x360 handset sideways and four
          links at `text-h2` plus the Reserve button come to roughly 420px of
          content in a 360px window, with the last of it simply gone. Now the
          content bottom-aligns when there is room and scrolls when there is
          not — `min-h-full` on the inner column is what gives it both. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-open={open}
        // `inert` belt to `visibility: hidden`'s braces. Visibility alone
        // already takes the links out of the tab order, but inert also stops a
        // stray programmatic focus or a trackpad gesture reaching a panel that
        // is not there.
        inert={!open}
        className="nav-panel fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-canvas lg:hidden"
      >
        {/* The wash sits on the inner column rather than the scroll box, so it
            covers the whole of a scrolled panel instead of staying pinned to
            the first screenful. */}
        <div className="relative flex min-h-full flex-col justify-end">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(88% 52% at 50% 104%, rgb(241 231 213 / 0.9), transparent 70%)',
            }}
          />

          {/* Clear of the nav pill at the top, and off the home indicator at
              the bottom. */}
          <ul className="shell relative flex flex-col gap-1 pt-24 pb-[max(2.5rem,12vh)]">
            {NAV_LINKS.map((link, index) => (
              <li
                key={link.href}
                className="nav-panel-item"
                // The stagger is a delay on the way in and nothing on the way
                // out: items that leave one after another read as the menu
                // being reluctant to close.
                style={{ transitionDelay: open ? `${0.1 + index * 0.05}s` : '0s' }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  className={cn(
                    'display-face block py-2 text-h2',
                    // The page you are on is marked here too. The desktop bar
                    // has its wiggle underline; without this the mobile menu
                    // was the one place on the site that would not tell you
                    // where you were.
                    isCurrent(link.href) ? 'text-clay' : 'text-ink'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li
              className="nav-panel-item mt-10 sm:mt-14"
              style={{ transitionDelay: open ? '0.32s' : '0s' }}
            >
              <Button asChild size="lg" variant="gilt">
                <Link href="/reserve" onClick={() => setOpen(false)}>
                  Reserve a table
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
