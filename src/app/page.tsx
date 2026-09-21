import { Hero } from '@/components/sections/Hero';
import { Story } from '@/components/sections/Story';
import { Menu } from '@/components/sections/Menu';
import { Craft } from '@/components/sections/Craft';
import { Voices } from '@/components/sections/Voices';
import { MENU } from '@/lib/menu';
import { VOICES } from '@/lib/voices';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Story />

      {/* All ten, on the turning stand rather than in the grid.

          This used to be six of the ten, because six is what a three-column
          vitrine balances on. A ring has no such arithmetic: it holds the whole
          list and shows five of it at a time, and a cylinder of six plates is a
          fan rather than a ring. So the abridgement moves from *which dishes*
          to *how much is said about each* — a name and a price here, the note
          and the detail on /menu. */}
      <Menu
        items={MENU}
        variant="ring"
        eyebrow="The menu"
        heading="Ten things, done properly."
        aside="Everything is made in the room, to order, and the coffee changes with the season. Turn the stand, or take the whole list at your own pace."
        cta={{ label: 'Read the full menu', href: '/menu' }}
      />

      <Craft />

      {/* Three of the five; the rest live on /voices. */}
      <Voices
        items={VOICES.slice(0, 3)}
        cta={{ label: 'Read all the voices', href: '/voices' }}
      />
    </>
  );
}
