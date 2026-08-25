'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { MenuCard } from '@/components/menu/MenuCard';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { Magnetic } from '@/components/motion/Magnetic';
import { Button } from '@/components/ui/button';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useIsDesktop, useMotionOK } from '@/hooks/useMediaQuery';
import { MENU, menuIndex, toColumns, type MenuItem } from '@/lib/menu';

/** Each column drifts at its own rate — the section's signature. */
const COLUMN_DRIFT = [-7, 5, -11];
/** And starts at its own height, so the grid never reads as rows. */
const COLUMN_OFFSET = ['lg:mt-0', 'lg:mt-20', 'lg:mt-8'];

type MenuProps = {
  /** Defaults to the full ten. */
  items?: readonly MenuItem[];
  eyebrow?: string;
  heading?: string;
  aside?: string;
  /** Rendered under the grid — the home page uses it to reach /menu. */
  cta?: { label: string; href: string };
  /** Sub-pages supply their own page header instead. */
  showHeader?: boolean;
  id?: string;
};

/**
 * "The Signature Ten"
 *
 * The strongest section, so it gets the most restraint: no card chrome at
 * all. Three columns fill in reading order and then scroll at three
 * different rates, which is what turns a grid into a composition. Cards
 * arrive with depth — rising, un-scaling and un-rotating out of the page
 * rather than fading — and reward a hover with a bloom, a lift, a slow zoom
 * and a price that rises out of a mask.
 */
export function Menu({
  items = MENU,
  eyebrow = '03 — The Signature Ten',
  heading = 'Ten things, done properly.',
  aside = 'Everything on this list is made in the room, to order. The coffee is single origin and changes with the season — ask what is on the bar today.',
  cta,
  showHeader = true,
  id = 'menu',
}: MenuProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();
  const isDesktop = useIsDesktop();

  const columns = toColumns(items);

  useGsap(
    () => {
      if (!motionOK) return;

      // --- Entrance: depth, not opacity ---------------------------------
      gsap.utils.toArray<HTMLElement>('.menu-card').forEach((card) => {
        gsap.set(card, { transformPerspective: 1200 });

        gsap.fromTo(
          card,
          { y: 74, scale: 0.93, rotateX: 11, opacity: 0 },
          {
            y: 0,
            scale: 1,
            rotateX: 0,
            opacity: 1,
            duration: 1.35,
            ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 92%', once: true },
            onComplete: () => gsap.set(card, { clearProps: 'transform,opacity' }),
          }
        );
      });

      // --- Header -------------------------------------------------------
      if (showHeader) {
        gsap
          .timeline({ scrollTrigger: { trigger: '.menu-head', start: 'top 82%', once: true } })
          .fromTo('.menu-eyebrow', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.9 }, 0)
          .fromTo('.menu-aside', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.5)
          .fromTo(
            '.menu-rule',
            { scaleX: 0 },
            { scaleX: 1, duration: 1.4, ease: 'power3.inOut' },
            0.35
          );
      }

      if (cta) {
        gsap.fromTo(
          '.menu-cta',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.menu-cta', start: 'top 94%', once: true },
          }
        );
      }

      // --- Differential column drift (desktop only) ----------------------
      if (!isDesktop) return;

      gsap.utils.toArray<HTMLElement>('.menu-column').forEach((column, index) => {
        const drift = COLUMN_DRIFT[index] ?? 0;
        gsap.fromTo(
          column,
          { yPercent: -drift / 2 },
          {
            yPercent: drift / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
            },
          }
        );
      });
    },
    [motionOK, isDesktop, showHeader, Boolean(cta), items],
    rootRef
  );

  return (
    <section
      ref={rootRef}
      id={id}
      aria-labelledby={showHeader ? 'menu-heading' : undefined}
      aria-label={showHeader ? undefined : 'Menu'}
      className="relative isolate overflow-x-clip py-section"
    >
      {/* A single warm pool of light behind the whole grid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[18%] -z-10 h-[60%]"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 50%, rgb(120 80 34 / 0.11) 0%, transparent 70%)',
        }}
      />

      <div className="shell">
        {showHeader && (
          <header className="menu-head">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <div className="w-full lg:max-w-[32rem]">
                <p className="menu-eyebrow eyebrow opacity-0">{eyebrow}</p>
                <SplitHeading
                  as="h2"
                  id="menu-heading"
                  mode="chars-scatter"
                  start="top 84%"
                  className="mt-7 text-h2"
                >
                  {heading}
                </SplitHeading>
              </div>

              <p className="menu-aside max-w-[38ch] font-sans text-body text-ash opacity-0 lg:pb-3 lg:text-right">
                {aside}
              </p>
            </div>

            <div className="menu-rule mt-12 h-px w-full origin-left bg-linear-to-r from-clay via-clay/50 to-transparent lg:mt-16" />
          </header>
        )}

        {/* ------------------------------- Grid ------------------------------- */}
        <div
          className={[
            'grid grid-cols-1 gap-x-7 gap-y-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20',
            showHeader ? 'mt-14 lg:mt-20' : '',
          ].join(' ')}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={[
                'menu-column mx-auto flex w-full max-w-[32rem] flex-col gap-14 md:max-w-[42rem] lg:mx-0 lg:max-w-none lg:gap-20',
                COLUMN_OFFSET[columnIndex] ?? '',
              ].join(' ')}
            >
              {column.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  index={menuIndex(item.id)}
                  priority={columnIndex === 0 && menuIndex(item.id) === 0}
                />
              ))}
            </div>
          ))}
        </div>

        {cta && (
          <div className="menu-cta mt-16 flex justify-center opacity-0 lg:mt-24">
            <Magnetic strength={0.3} padding={38}>
              <Button asChild size="lg" variant="outline">
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Button>
            </Magnetic>
          </div>
        )}
      </div>
    </section>
  );
}
