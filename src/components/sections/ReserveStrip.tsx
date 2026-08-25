'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { gsap, useGsap } from '@/hooks/useGsap';
import { useMotionOK } from '@/hooks/useMediaQuery';

type ReserveStripProps = {
  heading: string;
  body?: string;
};

/**
 * The closing band on every sub-page.
 *
 * Deliberately quieter than the reservation page itself — a gold rule, a line
 * of type and one action. It exists so that no page ends on a dead stop, not
 * to compete with /reserve.
 */
export function ReserveStrip({ heading, body }: ReserveStripProps) {
  const rootRef = useRef<HTMLElement>(null);
  const motionOK = useMotionOK();

  useGsap(
    () => {
      if (!motionOK) return;

      gsap
        .timeline({ scrollTrigger: { trigger: rootRef.current, start: 'top 84%', once: true } })
        .fromTo('.strip-rule', { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power3.inOut' }, 0)
        .fromTo(
          '.strip-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 },
          0.3
        );
    },
    [motionOK],
    rootRef
  );

  return (
    <section ref={rootRef} className="relative isolate overflow-hidden pb-section">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[85%]"
        style={{
          background:
            'radial-gradient(58% 90% at 50% 100%, rgb(241 231 213 / 0.85) 0%, transparent 74%)',
        }}
      />

      <div className="shell">
        <div className="strip-rule rule-gold origin-left" />

        <div className="mt-10 flex flex-col items-center gap-10 text-center lg:flex-row lg:justify-between lg:gap-12 lg:text-left">
          <div className="strip-item reveal">
            <h2 className="max-w-[16em] text-h3">{heading}</h2>
            {body && <p className="mt-5 max-w-[46ch] font-sans text-body text-mute">{body}</p>}
          </div>

          <div className="strip-item shrink-0 reveal">
            <Magnetic strength={0.3} padding={40}>
              <Button asChild size="xl" variant="gilt">
                <Link href="/reserve">
                  Reserve a table
                  <ArrowUpRight className="size-4" strokeWidth={1.5} />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
