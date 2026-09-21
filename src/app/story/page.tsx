import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { StoryFull } from '@/components/sections/StoryFull';
import { ReserveStrip } from '@/components/sections/ReserveStrip';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'How a photocopy shop on Ashworth Lane became a slow-roast coffee house, and the rules we have kept ever since.',
};

export default function StoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="A room built around one obsession."
        numeral="02"
        mode="words-flip"
        lede="We took a corner unit on Ashworth Lane, stripped it back to brick, and pointed every lamp at the bar. Everything since has been an argument about how long things should take."
      />

      <StoryFull />

      <ReserveStrip
        heading="See the room for yourself."
        body="It is at its best at half past four, when the light comes through the west window."
      />
    </>
  );
}
