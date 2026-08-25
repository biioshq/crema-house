'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { useGsap, gsap, ScrollTrigger } from '@/hooks/useGsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { NAV_LINKS, SITE } from '@/lib/site';
import { EASE } from '@/lib/ease';
import { cn } from '@/lib/utils';

export function Nav() {
  const barRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const motionOK = useMotionOK();

  // The bar has a single animation owner. GSAP already drives its
  // hide-on-scroll transform, so it drives the entrance too — two engines
  // writing `transform` to one element is a race, not a feature.
  useIsoLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    if (!motionOK) {
      gsap.set(bar, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.to(bar, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      delay: 0.2,
      ease: 'power4.out',
    });

    return () => {
      tween.kill();
    };
  }, [motionOK]);

  // Hide going down, reveal going up — the bar only exists when wanted.
  useGsap(() => {
    const bar = barRef.current;
    if (!bar) return;

    const trigger = ScrollTrigger.create({
      start: 'top -120',
      end: 'max',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 260) {
          gsap.to(bar, { yPercent: -130, duration: 0.55, ease: 'power3.out', overwrite: true });
        } else {
          gsap.to(bar, { yPercent: 0, duration: 0.65, ease: 'power3.out', overwrite: true });
        }
      },
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
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  );

  return (
    <>
      <header ref={barRef} className="fixed inset-x-0 top-0 z-50 opacity-0 will-change-transform">
        {/* The bar is translated by GSAP, and a transformed ancestor creates
            a backdrop root — so backdrop-filter has nothing behind it to
            sample. Legibility therefore comes from the gradient, with the
            blur kept only as a progressive enhancement. */}
        <div
          className={cn(
            'transition-[opacity,border-color] duration-700 ease-luxe',
            'relative border-b backdrop-blur-xl',
            scrolled ? 'border-crema/10' : 'border-transparent'
          )}
        >
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 -z-10 transition-opacity duration-700 ease-luxe',
              scrolled ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              background:
                'linear-gradient(180deg, rgb(10 7 5 / 0.96) 0%, rgb(10 7 5 / 0.88) 60%, rgb(10 7 5 / 0.72) 100%)',
            }}
          />

          <nav
            aria-label="Primary"
            className="shell flex h-[4.5rem] items-center justify-between gap-8 lg:h-20"
          >
            {/* Wordmark */}
            {/* Padding + matching negative margin: a 44px hit area without
                moving anything. */}
            <Link href="/" className="group flex items-baseline gap-2.5 py-3.5 -my-3.5">
              <span className="font-sans text-label font-medium tracking-[0.28em] text-porcelain">
                {SITE.nameShort}
              </span>
              <span className="hidden font-sans text-micro text-ash transition-colors duration-500 group-hover:text-gold sm:inline">
                HOUSE
              </span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-9 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className={cn(
                      'group relative block py-2 font-sans text-micro tracking-[0.24em] uppercase transition-colors duration-500 hover:text-porcelain',
                      isCurrent(link.href) ? 'text-porcelain' : 'text-crema/75'
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute inset-x-0 -bottom-0.5 h-px bg-gold transition-transform duration-500 ease-luxe',
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
              <Magnetic className="hidden sm:inline-block" strength={0.24} padding={26}>
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
                className="relative grid size-11 place-items-center rounded-full border border-crema/15 lg:hidden"
              >
                <span className="sr-only">Menu</span>
                <span
                  className={cn(
                    'absolute h-px w-4 bg-porcelain transition-transform duration-500 ease-luxe',
                    open ? 'translate-y-0 rotate-45' : '-translate-y-[3px]'
                  )}
                />
                <span
                  className={cn(
                    'absolute h-px w-4 bg-porcelain transition-transform duration-500 ease-luxe',
                    open ? 'translate-y-0 -rotate-45' : 'translate-y-[3px]'
                  )}
                />
              </button>
            </div>
          </nav>
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
            transition={{ duration: 0.8, ease: EASE.curtain }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-espresso lg:hidden"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(80% 50% at 50% 100%, rgb(192 138 62 / 0.14), transparent 70%)',
              }}
            />

            <ul className="shell relative flex flex-col gap-1 pb-[18vh]">
              {NAV_LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ y: 44, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.9, ease: EASE.luxe, delay: 0.16 + index * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="display-face block py-2 text-h2 text-porcelain"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}

              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="mt-10"
              >
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
