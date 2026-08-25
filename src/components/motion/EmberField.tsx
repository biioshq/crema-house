'use client';

import { useRef } from 'react';
import { useIsoLayoutEffect } from '@/hooks/useIsoLayoutEffect';
import { useMotionOK } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type EmberFieldProps = {
  className?: string;
  count?: number;
};

type Ember = {
  x: number;
  y: number;
  radius: number;
  rise: number;
  drift: number;
  phase: number;
  alpha: number;
};

/**
 * Warm motes rising through the reservation panel.
 *
 * Canvas rather than DOM because these need to number in the dozens and
 * overlap additively — but the glow is rendered once into an offscreen
 * sprite and stamped with drawImage, so a frame costs N blits rather than N
 * radial gradients. The loop is suspended whenever the section is off
 * screen, and never starts at all under reduced motion.
 */
export function EmberField({ className, count = 46 }: EmberFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionOK = useMotionOK();

  useIsoLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !motionOK) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    // --- Sprite: one radial glow, drawn once -----------------------------
    const SPRITE = 64;
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE;
    sprite.height = SPRITE;
    const spriteContext = sprite.getContext('2d');
    if (!spriteContext) return;

    const gradient = spriteContext.createRadialGradient(
      SPRITE / 2,
      SPRITE / 2,
      0,
      SPRITE / 2,
      SPRITE / 2,
      SPRITE / 2
    );
    gradient.addColorStop(0, 'rgba(255, 214, 156, 0.95)');
    gradient.addColorStop(0.35, 'rgba(231, 178, 105, 0.42)');
    gradient.addColorStop(1, 'rgba(192, 138, 62, 0)');
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, SPRITE, SPRITE);

    // --- Field -----------------------------------------------------------
    let width = 0;
    let height = 0;
    let dpr = 1;
    let embers: Ember[] = [];

    // Deterministic, so a remount looks identical.
    let state = 0xe11be5;
    const random = () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };

    const seed = () => {
      embers = Array.from({ length: count }, () => ({
        x: random() * width,
        y: random() * height,
        radius: 1.2 + random() * 3.6,
        rise: 6 + random() * 20,
        drift: (random() - 0.5) * 12,
        phase: random() * Math.PI * 2,
        alpha: 0.16 + random() * 0.5,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!embers.length) seed();
    };

    resize();

    let last = performance.now();
    let frame = 0;
    let running = false;

    const draw = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      for (const ember of embers) {
        ember.y -= ember.rise * delta;
        ember.phase += delta * 0.6;

        if (ember.y < -20) {
          ember.y = height + 20;
          ember.x = random() * width;
        }

        const x = ember.x + Math.sin(ember.phase) * ember.drift;
        // Fade in at the bottom and out at the top so nothing ever pops.
        const edge = Math.min(1, Math.min(ember.y, height - ember.y) / (height * 0.22));
        const size = ember.radius * 8;

        context.globalAlpha = ember.alpha * Math.max(0, edge);
        context.drawImage(sprite, x - size / 2, ember.y - size / 2, size, size);
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const visibility = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    visibility.observe(canvas);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      stop();
      visibility.disconnect();
      observer.disconnect();
    };
  }, [count, motionOK]);

  if (!motionOK) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    />
  );
}
