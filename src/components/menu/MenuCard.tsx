'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Heart } from '@/components/illustrations/Doodles';
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
  /** Pins a handwritten "house favourite" sticker to the corner of the plate. */
  favourite?: boolean;
};

/**
 * A dish as a product.
 *
 * A white plate floating on paper: the photograph is matted inside the card
 * rather than bleeding to its edge, which is the single detail that separates
 * a boutique from a bistro. Under it, a handwritten "no." and the dish name
 * with its price in a small pill at the right of the same row, so the price
 * sits in the same place on every card however long the name runs.
 *
 * Every piece of text carries a `data-text` mode, so the shared RevealRunner
 * plays it in as the card rises: the name letter by letter, the note line by
 * line, the chip, number and price as quiet fades.
 *
 * The hover choreography (lift, zoom, deeper shadow, glowing price) is one
 * shared block in globals.css, so all four moves are guaranteed to run on the
 * same curve for the same duration and the card reads as a single object.
 */
export function MenuCard({ item, index, priority = false, favourite = false }: MenuCardProps) {
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

    const rotateX = gsap.quickTo(inner, 'rotationX', { duration: 1, ease: 'power3.out' });
    const rotateY = gsap.quickTo(inner, 'rotationY', { duration: 1, ease: 'power3.out' });

    // Measured once, when the pointer arrives, and reused for the whole
    // hover. Re-reading it on every move forced a layout flush per event —
    // and the card is lifting under a CSS transform at that moment anyway, so
    // the fresh rect was the wrong one to tilt against.
    let rect: DOMRect | null = null;

    const onEnter = () => {
      rect = card.getBoundingClientRect();
      gsap.set(inner, { willChange: 'transform' });
    };

    const onMove = (event: PointerEvent) => {
      if (!rect) rect = card.getBoundingClientRect();
      const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      rotateY(nx * 6);
      rotateX(-ny * 4.8);
    };

    const onLeave = () => {
      rect = null;
      gsap.to(inner, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.9,
        ease: 'power3.out',
        onComplete: () => gsap.set(inner, { willChange: 'auto' }),
      });
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);

    return () => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, [motionOK, finePointer]);

  return (
    <article
      ref={cardRef}
      className="menu-card group relative"
      style={{ perspective: 1000 }}
    >
      {/* Warmth pooling under the card — it grows past the edges on hover, so
          the plate looks lit from underneath rather than outlined. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 opacity-0 transition-opacity duration-1000 ease-luxe group-hover:opacity-100 sm:-inset-10"
        style={{
          background:
            'radial-gradient(56% 46% at 50% 58%, rgb(196 154 82 / 0.20) 0%, rgb(241 231 213 / 0.42) 44%, transparent 74%)',
        }}
      />

      <div
        className="menu-card-inner relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="menu-card-shell card-surface relative overflow-hidden rounded-lg p-3 sm:p-3.5">
          {/* ------------------------------ Plate ------------------------------ */}
          <div
            className={[
              'menu-card-media relative overflow-hidden rounded-[calc(var(--radius-lg)-0.75rem)] bg-sand',
              item.aspect,
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
              className="object-cover"
            />

            {/* A whisper of light across the top of the image, so the crop
                never looks pasted onto the card. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(178deg, rgb(255 255 255 / 0.22) 0%, transparent 22%)',
              }}
            />

            {/* Category, the only chrome on the whole card. */}
            <span
              data-text="fade"
              className="absolute top-4 left-4 rounded-full bg-card/92 px-3 py-1.5 font-sans text-[0.75rem] tracking-wide-sm text-clay-deep uppercase"
            >
              {item.category}
            </span>

            {/* A paper sticker slapped on the plate: the note pops, then its
                heart draws itself on over the sticker's corner. The tilt lives
                on the wrapper so the pop tween never has to fight it.

                The plate clips, so the sticker is held far enough off the
                corner that the heart's overhang still lands inside it — at a
                tighter inset the heart was sliced in half by the rounded
                edge. */}
            {favourite && (
              <span className="absolute top-5 right-5 rotate-[5deg]">
                <span
                  data-text="pop"
                  data-text-delay="0.35"
                  className="block rounded-full bg-card/95 px-3.5 pt-1 pb-1.5 font-hand text-[1.2rem] leading-none font-semibold text-clay shadow-[0_6px_18px_-8px_rgb(74_53_39/0.45)]"
                >
                  house favourite
                </span>
                <Heart
                  data-ill
                  data-ill-delay="0.6"
                  className="absolute -top-3 -right-3 size-5 -rotate-[12deg]"
                />
              </span>
            )}
          </div>

          {/* ------------------------------- Foot ------------------------------ */}
          <div className="px-2 pt-6 pb-4 sm:px-3 sm:pt-7 sm:pb-5">
            <p
              data-text="write"
              className="font-hand text-[1.15rem] leading-none font-semibold text-clay/85"
            >
              no. {index + 1}
            </p>

            {/* Name and price share one row. `items-start` keeps the pill level
                with the first line when a long name wraps onto a second. */}
            <div className="mt-2.5 flex items-start justify-between gap-4">
              <h3 data-text="chars" className="text-h3 leading-[1.08] text-ink">
                {item.name}
              </h3>
              <span
                data-text="fade"
                data-text-delay="0.2"
                className="menu-price mt-1 shrink-0 rounded-full border border-hair bg-canvas/70 px-3 py-1 font-sans text-[0.8rem] font-medium tracking-[0.03em] text-ink tabular-nums"
              >
                {formatPrice(item.price)}
              </span>
            </div>

            <p
              data-text="lines"
              className="mt-4 max-w-[34ch] font-sans text-[0.84rem] leading-[1.7] text-mute"
            >
              {item.note}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
