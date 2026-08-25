import { Hero } from '@/components/sections/Hero';
import { Story } from '@/components/sections/Story';
import { Menu } from '@/components/sections/Menu';
import { Craft } from '@/components/sections/Craft';
import { Voices } from '@/components/sections/Voices';
import { MENU_HIGHLIGHTS } from '@/lib/menu';
import { VOICES } from '@/lib/voices';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Story />

      {/* Six of the ten; the rest live on /menu. Sections run 01 → 05 in
          scroll order — see the numbering note in Craft.tsx. */}
      <Menu
        items={MENU_HIGHLIGHTS}
        eyebrow="03 — The Menu"
        heading="Six things, done properly."
        aside="A short list from a longer one. Everything is made in the room, to order, and the coffee changes with the season."
        cta={{ label: 'View the full menu', href: '/menu' }}
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
