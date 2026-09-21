import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Magnetic } from '@/components/motion/Magnetic';
import { Swirl } from '@/components/illustrations/Doodles';

type ReserveStripProps = {
  heading: string;
  body?: string;
};

/** Sets the last word of the heading in the clay italic accent. */
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
 * The closing band on every sub-page.
 *
 * Deliberately quieter than the reservation page itself: a flourish, a line of
 * type and one action. It exists so that no page ends on a dead stop, not to
 * compete with /reserve.
 *
 * The clay rule that used to open the band is now an inked loop, which is the
 * only mark the eye needed there, and the type reveals through `data-text`, so
 * nothing in here is animated by hand.
 */
export function ReserveStrip({ heading, body }: ReserveStripProps) {
  return (
    <section className="relative isolate overflow-hidden pb-section">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[85%]"
        style={{
          background:
            'radial-gradient(58% 90% at 50% 100%, rgb(241 231 213 / 0.85) 0%, transparent 74%)',
        }}
      />

      <div className="shell">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:gap-12 lg:text-left">
          <div>
            <Swirl
              data-ill
              className="pointer-events-none mx-auto mb-5 h-auto w-20 text-clay lg:mx-0 lg:w-24"
            />

            <h2 data-text="wipe" className="max-w-[16em] text-h3">
              {accentLastWord(heading)}
            </h2>

            {body && (
              <p
                data-text="words"
                data-text-delay="0.25"
                className="mt-5 max-w-[46ch] font-sans text-body text-mute"
              >
                {body}
              </p>
            )}
          </div>

          <div data-text="fade" data-text-delay="0.4" className="shrink-0">
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
