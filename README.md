# CRÈMA HOUSE

A site for a slow-roast coffee house. Next.js 15 (App Router), TypeScript,
Tailwind v4, GSAP + ScrollTrigger, Lenis, Framer Motion, and a small React
Three Fiber scene in the hero.

## Routes

| Route | Contents |
| --- | --- |
| `/` | Hero · Story (abridged) · Menu (6 of 10) · Craft · Voices (3 of 5) |
| `/story` | Masthead, three chapters, the numbers |
| `/menu` | All ten, no abridgement |
| `/voices` | All five |
| `/reserve` | Reservation panel, hours, address |

Each home section links on to its full page. `Menu` and `Voices` take an
`items` prop plus an optional `cta`, so one component serves both the
preview and the full page — there is no duplicated markup between them.

```bash
npm install
npm run media     # optimise /media -> /public/media (run once, or after changing assets)
npm run dev       # http://localhost:3000
npm run build && npm start
```

---

## Media pipeline

Original photography and video live in [`media/`](media/) and are never
modified. [`scripts/optimize-media.mjs`](scripts/optimize-media.mjs) reads
that folder and writes:

- `public/media/*.webp` — quality 88, native dimensions (**24 MB → 2.3 MB**)
- `public/media/*.mp4` — copied, renamed to `hero.mp4` and `beans.mp4`
- `public/media/og.jpg` — 1200×630 social card, composed from `cafe.png`
- `src/lib/media.ts` — **generated**; intrinsic width/height plus an inline
  base64 blur placeholder for every image, so `<Image>` never shifts layout
  or flashes empty

Re-run `npm run media` after adding or replacing anything in `media/`.
Do not hand-edit `src/lib/media.ts`.

## Architecture

```
src/
├─ app/            layout · page · globals.css (all design tokens) · icon.svg
├─ components/
│  ├─ sections/    Hero · Story · StoryFull · Menu · Craft · Voices
│  │                Reserve · ReserveStrip · Footer
│  ├─ layout/      SmoothScroll · Intro · Nav · PageHeader · Grain
│  ├─ motion/      SplitHeading · Counter · Magnetic · BeanDust · EmberField
│  ├─ media/       BackgroundVideo · RevealImage
│  ├─ menu/        MenuCard
│  ├─ three/       BeanField (dynamic, desktop-only)
│  └─ ui/          button · brand-icons
├─ hooks/          useGsap · useMediaQuery · usePointer · useIsoLayoutEffect
└─ lib/            site · menu · voices · media(generated) · split · gsap · ease · utils
```

**Motion ownership.** GSAP owns everything scroll-linked and every entrance;
Framer Motion is used only for mount/unmount transitions (the mobile menu).
One element is never animated by two engines — that race cost real debugging
time early on.

**One RAF loop.** `gsap.ticker` drives Lenis, and Lenis updates ScrollTrigger.
Two independent loops beat against each other and produce visible jitter.

**Section signatures.** No two sections reveal the same way — travelling mask
(Story), differential column drift (Menu), pinned per-letter handover (Craft),
scroll-linked 3D rotation (Voices), pointer spotlight (Reserve), wordmark fill
(Footer). `SplitHeading` centralises text splitting and exposes five distinct
modes.

**Never `indexOf` across the RSC boundary.** Props handed from a Server
Component to a Client Component are serialised, so the objects arriving in the
client are copies and are never identity-equal to the module's own array.
`menuIndex(id)` looks positions up by id for exactly this reason.

**Route changes reset the scroll.** `SmoothScroll` watches `usePathname`,
jumps Lenis to the top without animating, then re-measures every ScrollTrigger
on the next frame.

**The Craft pin is derived, never hand-tuned.** `SECTION_HEIGHT` is computed
from `SEGMENT_RATIO * PHRASES.length`, and the segment length is measured from
the pinned panel's own `offsetHeight` — not from `window.innerHeight`, which
tracks the *current* viewport and disagrees with `svh` the moment a phone's
URL bar collapses. When those two drifted apart the pin released while the
last statement was still on screen.

**Text splitting reverts.** `SplitHeading` splits, plays once, then restores
the original DOM — no orphaned spans, no lingering `will-change`, and resizing
after the reveal cannot break the layout. The accessible name is preserved via
`aria-label` while the generated spans are hidden.

## Accessibility & performance

- `prefers-reduced-motion` is honoured throughout: all timelines no-op, the
  WebGL field never mounts, and background video does not autoplay.
- No horizontal scroll at 360px on any route, and every interactive target is
  at least 44x44 — both verified by script, not by eye.
- There is no loading screen. The hero animates in on mount; the WebGL field
  is deferred ~700ms so it never competes with LCP.
- Videos attach their `src` only near the viewport and pause off-screen.
- Three.js is dynamically imported, desktop-only, and stays out of the initial
  bundle (separate ~144 kB chunk).
- Hover-only affordances (menu prices, tasting notes) are gated behind
  `@media (hover: hover)` so they are simply always visible on touch.
- Production build: **191 kB First Load JS**.

## Known caveats

- **This project sits inside a OneDrive-synced folder.** OneDrive contending
  with Next's writes to `.next` intermittently produced 404s on
  `main-app.js` and other chunks during development. If the page loads
  unstyled or un-hydrated, stop the server, `rm -rf .next`, and restart.
  Excluding `.next` from sync (or moving the project outside OneDrive) fixes
  it permanently.
- Never run `next build` while `next dev` is running — they share `.next` and
  corrupt each other.
- The newsletter form is a UI stub: it validates and shows a success state but
  is not wired to any mailing service.
- The home page has no reservation section by design — the path to booking is
  the hero action, the nav button, and the footer.
- `npm audit` reports high-severity transitive advisories in `postcss` and
  `sharp` via Next 15. The only offered fix is Next 16, which is a breaking
  major; the site is pinned to Next 15 deliberately.
