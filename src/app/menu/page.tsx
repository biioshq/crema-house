import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Menu } from '@/components/sections/Menu';
import { ReserveStrip } from '@/components/sections/ReserveStrip';
import { MENU } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'The Menu',
  description:
    'Ten things, made in the room, to order. Single-origin coffee, pastry laminated over thirty-six hours, and plates built on sourdough.',
};

export default function MenuPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Menu"
        title="Ten things, done properly."
        numeral="02"
        mode="chars-scatter"
        lede="Everything here is made in the room, to order. The coffee is single origin and changes with the season — ask what is on the bar today."
      />

      <Menu items={MENU} showHeader={false} />

      <ReserveStrip
        heading="Come and taste the difference."
        body="Two tables are held back every evening for people who did not plan ahead."
      />
    </>
  );
}
