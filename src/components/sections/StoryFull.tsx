import type { ComponentType, SVGProps } from 'react';
import { RevealImage } from '@/components/media/RevealImage';
import { Counter } from '@/components/motion/Counter';
import { Motes } from '@/components/motion/Motes';
import { Daisy } from '@/components/illustrations/Florals';
import { Sprig, Vine } from '@/components/illustrations/Foliage';
import { Heart, Sparkle, Steam } from '@/components/illustrations/Doodles';
import { IMAGES } from '@/lib/media';
import { CONTACT } from '@/lib/site';

const STATS = [
  { value: 11, label: 'Years on the lane' },
  { value: 6, label: 'Origins on the bar' },
  { value: 92, label: 'Mean cupping score' },
  { value: 26, label: 'Seconds of extraction' },
] as const;

const CHAPTERS = [
  {
    index: 'i',
    title: 'The lease',
    image: 'cafe',
    alt: 'The room at Crèma House: timber tables under warm lamplight',
    direction: 'up',
    /** Each chapter arrives differently, so three chapters never read as one
     *  repeated block with the words changed. */
    heading: 'flip',
    body: [
      'The unit had been a photocopy shop for nineteen years. It came with a suspended ceiling, four fluorescent tubes, and a carpet that we will not describe.',
      'We took all of it out. Behind the plasterboard was brick, and behind the brick was a window nobody had opened since the eighties. That window is now the best seat in the room.',
    ],
  },
  {
    index: 'ii',
    title: 'The roast',
    image: 'espresso',
    alt: 'A single espresso, crema still settling',
    direction: 'right',
    heading: 'chars',
    body: [
      'Twelve kilos at a time, in a drum, by ear. Green beans land on Tuesday and are roasted on Wednesday, never the same day, because a bean that has just travelled does not behave.',
      'We stop on the second crack. Then it rests four days. Coffee pulled before the sugars settle tastes like a good idea served too early.',
    ],
  },
  {
    index: 'iii',
    title: 'The rules',
    image: 'butter-croissant',
    alt: 'A butter croissant, thirty-six hours in the making',
    direction: 'left',
    heading: 'wipe',
    body: [
      'No loyalty cards. No syrups that are not made here. Nothing served in paper unless you are genuinely walking out of the door with it.',
      'Two tables stay empty every evening for people who did not plan ahead, because the best afternoons here have always belonged to somebody who wandered in.',
    ],
  },
] as const;

type Marginalia = {
  Art: ComponentType<SVGProps<SVGSVGElement>>;
  className: string;
  delay: string;
};

/**
 * One drawing pinned to each chapter's photograph, in the margin the layout
 * already leaves free: a daisy laid against the corner of the room, steam
 * lifting off the espresso, nothing at all on the third (that chapter gets
 * its sticker instead, beside the copy).
 */
const MARGINALIA: ReadonlyArray<Marginalia | null> = [
  {
    Art: Daisy,
    className: '-bottom-7 -left-3 h-auto w-14 -rotate-12 sm:-bottom-9 sm:-left-6 sm:w-20',
    delay: '0.45',
  },
  {
    Art: Steam,
    className: '-top-9 left-6 h-16 w-auto sm:-top-12 sm:left-10 sm:h-20',
    delay: '0.4',
  },
  null,
];

/**
 * Sets the last word of a chapter title in the clay italic accent.
 */
function accentLastWord(text: string) {
  const at = text.trimEnd().lastIndexOf(' ');
  if (at < 0) return <em className="accent">{text}</em>;
  return (
    <>
      {text.slice(0, at + 1)}
      <em className="accent">{text.slice(at + 1)}</em>
    </>
  );
}

/**
 * The long-form story page.
 *
 * The home page shows the abridged version; this is the whole thing, told in
 * three chapters that alternate side, reveal direction and reveal mode so the
 * eye keeps moving down the page rather than settling into a rhythm.
 *
 * Nothing here is animated imperatively any more: the copy reveals through
 * `data-text` and the drawings through `data-ill`, both run by the shared
 * RevealRunner, which is why this is a plain server component with no hooks
 * of its own. The rules that used to sit under each title and the little clay
 * dash under each number are gone; whitespace and a vine do that work now.
 */
export function StoryFull() {
  return (
    <section className="relative isolate overflow-hidden pb-section">
      <Motes count={8} opacity={0.45} seed={0x51ce} className="-z-10" />

      <div className="shell">
        {/* ----------------------------- Chapters ---------------------------- */}
        <div className="flex flex-col gap-section">
          {CHAPTERS.map((chapter, index) => {
            const asset = IMAGES[chapter.image as keyof typeof IMAGES];
            const flipped = index % 2 === 1;
            const margin = MARGINALIA[index];

            return (
              <article
                key={chapter.index}
                className={[
                  'flex flex-col gap-10 lg:items-center lg:gap-[7%]',
                  flipped ? 'lg:flex-row-reverse' : 'lg:flex-row',
                ].join(' ')}
              >
                <div className="relative w-full lg:w-[46%]">
                  <RevealImage
                    asset={asset}
                    alt={chapter.alt}
                    direction={chapter.direction}
                    edge={index === 0}
                    parallax={6}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    objectPosition={chapter.image === 'cafe' ? '48% 58%' : '50% 50%'}
                    className="aspect-[4/5] rounded-lg shadow-lift"
                  />

                  {margin && (
                    <margin.Art
                      data-ill
                      data-ill-delay={margin.delay}
                      className={`pointer-events-none absolute z-10 ${margin.className}`}
                    />
                  )}
                </div>

                <div className="w-full lg:w-[47%]">
                  <p data-text="write" className="eyebrow">
                    Chapter {chapter.index}
                  </p>

                  <h2 data-text={chapter.heading} data-text-start="top 82%" className="mt-4 text-h2">
                    {accentLastWord(chapter.title)}
                  </h2>

                  {chapter.body.map((paragraph, line) => (
                    <p
                      key={paragraph.slice(0, 24)}
                      data-text={line === 0 ? 'lines' : 'words'}
                      className="mt-7 max-w-[48ch] font-sans text-body text-ink-soft/85"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {/* The third chapter is the one with a promise in it, so it
                      gets the sticker: the note repeats the copy above, which
                      is why it is hidden from assistive tech. */}
                  {index === 2 && (
                    <div aria-hidden className="mt-8 flex items-center gap-2">
                      <Heart data-ill data-ill-delay="0.4" className="size-5 shrink-0" />
                      <p data-text="pop" data-text-delay="0.5" className="hand-note">
                        two tables always free
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* ------------------------------ Numbers ---------------------------- */}
        {/* The hairline that used to divide the numbers from the chapters is
            now a drawn vine. Below `sm` the vine's leaves crowd into texture,
            so a sprig, a spark and a sprig stand in for it. */}
        <div className="mt-section">
          <div className="flex items-end justify-center gap-3 sm:hidden">
            <Sprig data-ill flip className="h-5 w-auto" />
            <Sparkle data-ill data-ill-delay="0.15" className="mb-1 size-4" />
            <Sprig data-ill data-ill-delay="0.3" className="h-5 w-auto" />
          </div>
          <Vine data-ill className="mx-auto hidden h-auto w-full max-w-4xl sm:block" />

          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
            {STATS.map((stat) => (
              // The counter rewrites its own digits after mount, so the reveal
              // sits on this static wrapper rather than on the number itself.
              <div key={stat.label} data-text="fade">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <Counter
                    value={stat.value}
                    className="display-face text-[clamp(2.6rem,5vw,3.8rem)] text-ink"
                  />
                  <span
                    aria-hidden
                    className="mt-3 block max-w-[16ch] text-balance font-sans text-[0.8rem] leading-snug text-mute"
                  >
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <p data-text="fade" className="mt-12 font-sans text-micro text-faint uppercase">
            {CONTACT.addressLines.join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}
