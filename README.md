# LO HAALO STREET LOUNGE CAFE

A site for a slow-roast coffee house, set as a bright editorial. Next.js 15
(App Router), TypeScript, Tailwind v4, GSAP + ScrollTrigger, Lenis, and Framer
Motion.

## The look

Warm paper rather than black: `#F8F5EF` page, `#F3EEE5` bands, white cards,
warm charcoal `#222` ink, and one soft gold `#C49A52`. Cormorant Garamond at
300 for the display sizes — a high-contrast old-style that echoes the sculpted
letters standing in the hero footage — with Inter for everything set small.
Nothing on the page is a flat colour: every surface carries a gradient, a
paper tooth, or a soft warm shadow.

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
│  ├─ layout/      SmoothScroll · Nav · PageHeader · Grain (paper + top-light)
│  ├─ motion/      SplitHeading · Counter · Magnetic · Motes
│  ├─ media/       BackgroundVideo · RevealImage
│  ├─ menu/        MenuCard
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
(Story), differential column drift (Menu), plates opening from a centre slit
(Craft), scroll-linked 3D rotation (Voices), pointer spotlight (Reserve),
wordmark fill (Footer). `SplitHeading` centralises text splitting and exposes
five distinct modes.

**The hero is full screen and untinted.** The words are set in `hero1.mp4`
itself, so nothing is laid over the top of it and there is no vignette or wash
on the picture — only a warm rise at the very foot of the frame, deep enough to
carry the copy and no deeper. There are two of those rises, because the crop is
not the same shape on both: a phone is looking at the cup itself and needs a
deeper floor than a desktop, where the copy lands on the table.

**Depth is transforms, not drop shadows.** Every section that has objects in it
puts them on planes inside a shared `perspective`, and moves those planes at
different rates: the hero picture drifts *with* the pointer while its copy
turns *against* it, the Craft panels hinge up out of the page and then lean
toward the pointer with their numerals set a layer further back, the menu
plates tilt and lift *towards* the viewer on `translate3d(…, 4rem)` rather than
merely upward, and the Voices cards rotate as a pure function of their distance
from the centre of the viewport.

**Nothing ships that nothing uses.** The tree was swept after the redesign
settled: three.js and `@radix-ui/react-dialog` came out of `package.json` (the
WebGL bean field and the dialog-based menu are both gone), and with them the
unused halves of `lib/ease.ts` and `lib/utils.ts`, five `@utility` blocks and
eight theme tokens that no class ever referenced. `tsc --noUnusedLocals
--noUnusedParameters` passes clean, and the tailwind-merge scales in
`lib/utils.ts` are kept in step with `@theme` — a scale listed there that no
longer exists is worse than one missing, because it silently changes which
class wins.

**`reveal`, not `opacity-0`.** Every scroll-revealed element wears the `reveal`
utility. It is `opacity: 0`, except under `prefers-reduced-motion`, where it is
`opacity: 1` — because the timeline that would have un-hidden it never runs,
and an element only ever shown by an animation you have opted out of is simply
an invisible element.

**Never `indexOf` across the RSC boundary.** Props handed from a Server
Component to a Client Component are serialised, so the objects arriving in the
client are copies and are never identity-equal to the module's own array.
`menuIndex(id)` looks positions up by id for exactly this reason.

**Route changes reset the scroll — unless there is a fragment.** `SmoothScroll`
watches `usePathname`, jumps Lenis to the top without animating, then
re-measures every ScrollTrigger on the next frame. A deep link such as
`/#menu` wins over the reset, so the fragment is not immediately undone.

**The gallery is hand-set, not generated.** Every plate in `Craft` carries an
explicit column, an explicit row and its own aspect ratio, so no two land on
the same baseline and the field never resolves into a grid. Below `lg` it
collapses to one column in DOM order, which is why the three statements are
interleaved with the photographs in `PLATES` rather than grouped.

**Text splitting reverts.** `SplitHeading` splits, plays once, then restores
the original DOM — no orphaned spans, no lingering `will-change`, and resizing
after the reveal cannot break the layout. The accessible name is preserved via
`aria-label` while the generated spans are hidden.

## Accessibility & performance

- `prefers-reduced-motion` is honoured throughout: all timelines no-op, Lenis
  is never created, the cursor ring never mounts, background video does not
  autoplay, and `reveal` resolves to visible so nothing is left hidden.
- No horizontal scroll at 360px on any route, and every interactive target is
  at least 44x44 — both verified by script, not by eye.
- There is no loading screen. The hero animates in on mount.
- Videos attach their `src` only near the viewport and pause off-screen.
- The ambient field (`Motes`) is plain DOM with transform-only tweens: no
  canvas, no render loop of its own, and the soft edges are gradients rather
  than `filter: blur`, which would cost an offscreen pass per element per
  frame.
- Every pointer effect writes through `gsap.quickTo` and, where a section has
  several of them, shares one listener — moving the mouse never triggers a
  React render anywhere on the site.
- Hover-only affordances (menu prices, tasting notes) are gated behind
  `@media (hover: hover)` so they are simply always visible on touch.
- Production build: **192 kB First Load JS**.

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
- **The `media/` source folder has been deleted**, so `npm run media` can no
  longer run: `public/media/` is now the only copy of the assets. Restore the
  originals before touching the pipeline, and do not delete `src/lib/media.ts`
  in the meantime — it can no longer be regenerated.
- `public/media/og.jpg` is still the dark-era social card, and cannot be
  rebuilt until the source photography is back.
- `npm audit` reports high-severity transitive advisories in `postcss` and
  `sharp` via Next 15. The only offered fix is Next 16, which is a breaking
  major; the site is pinned to Next 15 deliberately.
