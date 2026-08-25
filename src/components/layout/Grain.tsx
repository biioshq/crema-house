'use client';

/**
 * Film grain + vignette.
 *
 * The photography is shot in low light; a fine analogue grain over the whole
 * page ties the flat UI surfaces to it and hides banding in the dark
 * gradients. Rendered once as a static SVG noise tile and jittered with a
 * stepped transform — no per-frame repaint of the noise itself.
 */

const NOISE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' " +
  "stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>";

export function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      {/* Grain */}
      <div
        className="absolute -inset-[6%] opacity-[0.055] mix-blend-overlay motion-safe:animate-[grain_1.1s_steps(1)_infinite]"
        style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: '260px 260px' }}
      />
      {/* Vignette — pulls the eye to the centre of every composition. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 42%, rgb(10 7 5 / 0.45) 100%)',
        }}
      />
    </div>
  );
}
