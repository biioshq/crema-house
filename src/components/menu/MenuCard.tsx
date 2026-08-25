'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useHasFinePointer, useMotionOK } from '@/hooks/useMediaQuery';
import { IMAGES } from '@/lib/media';
import type { MenuItem } from '@/lib/menu';
import { formatPrice } from '@/lib/utils';

type MenuCardProps = {
  item: MenuItem;
  index: number;
  priority?: boolean;
};

/**
 * A menu card with no card.
 *
 * The photography is already lit against near-black, so the frame is left
 * chromeless and the image dissolves straight into the page — the only
 * boundary is a gold hairline that fades in on hover. Everything else is
 * light: a bloom behind the frame, a lift, a slow zoom, and the price
 * rising out of a mask.
 */
export function MenuCard({ item, index, priority = false }: MenuCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const asset = IMAGES[item.id];

  const motionOK = useMotionOK();
  const finePointer = useHasFinePointer();

  // --- Tilt ---------------------------------------------------------------
  useIsoLayoutEffect(() => {
    if (!motionOK || !finePointer) return;

    const card = cardRef.current;
    if (!card) return;

    const inner = card.querySelector<HTMLElement>('.menu-card-inner');
    if (!inner) return;

    const rotateX = gsap.quickTo(inner, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const rotateY = gsap.quickTo(inner, 'rotationY', { duration: 0.9, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      rotateY(nx * 5.5);
      rotateX(-ny * 4.5);
    };

    const onLeave = () => {
      gsap.to(inner, { rotationX: 0, rotationY: 0, duration: 1, ease: 'power3.out' });
    };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);

    return () => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, [motionOK, finePointer]);

  return (
    <article
      ref={cardRef}
      className="menu-card group relative will-change-transform"
      style={{ perspective: 1100 }}
    >
      {/* Bloom — sits behind the frame and grows past its edges. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 opacity-0 blur-[2px] transition-opacity duration-700 ease-luxe group-hover:opacity-100 sm:-inset-8"
        style={{
          background:
            'radial-gradient(58% 46% at 50% 55%, rgb(192 138 62 / 0.30) 0%, rgb(192 138 62 / 0.10) 45%, transparent 72%)',
        }}
      />

      <div
        className="menu-card-inner relative will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={[
            'relative overflow-hidden rounded-lg',
            item.aspect,
            'shadow-[0_16px_40px_-20px_rgb(0_0_0/0.8)]',
            'transition-[transform,box-shadow] duration-700 ease-luxe',
            'group-hover:-translate-y-2.5 group-hover:shadow-lift',
          ].join(' ')}
        >
          <Image
            src={asset.src}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 60vw, 88vw"
            priority={priority}
            placeholder="blur"
            blurDataURL={asset.blurDataURL}
            className="object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-[1.075]"
          />

          {/* Scrim — deep at the foot so the type always holds. */}
          <span
            aria-hidden
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background:
                'linear-gradient(180deg, rgb(10 7 5 / 0.36) 0%, transparent 26%, transparent 44%, rgb(10 7 5 / 0.78) 82%, rgb(10 7 5 / 0.94) 100%)',
            }}
          />

          {/* Hairline that only exists on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100"
            style={{ boxShadow: 'inset 0 0 0 1px rgb(231 178 105 / 0.42)' }}
          />

          {/* Index */}
          <span className="absolute top-5 left-5 font-sans text-micro text-crema/55 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Category */}
          <span className="absolute top-5 right-5 font-sans text-micro text-gold/85 uppercase">
            {item.category}
          </span>

          {/* Foot */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-h3 leading-none text-porcelain transition-transform duration-700 ease-luxe group-hover:-translate-y-0.5">
                {item.name}
              </h3>

              {/* Price rises out of a mask on hover. The hidden state is
                  applied only where hover exists — on touch, where there is
                  no hover, the price is simply always shown. */}
              <span className="split-line shrink-0 pb-0.5">
                <span className="menu-reveal block font-sans text-label font-medium text-gold-lit tabular-nums">
                  {formatPrice(item.price)}
                </span>
              </span>
            </div>

            <p className="menu-note mt-2.5 max-w-[34ch] font-sans text-[0.78rem] leading-relaxed text-crema/70">
              {item.note}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
