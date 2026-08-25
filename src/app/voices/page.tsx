import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Voices } from '@/components/sections/Voices';
import { ReserveStrip } from '@/components/sections/ReserveStrip';
import { VOICES } from '@/lib/voices';

export const metadata: Metadata = {
  title: 'Voices',
  description:
    'What regulars say about the room — novelists, architects, pastry chefs, and people who have been coming since 2016.',
};

export default function VoicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Voices"
        title="What the room says back."
        numeral="03"
        mode="mask-wipe"
        lede="We have never asked anyone for a review. These were written on napkins, in emails, and once on the back of a receipt."
      />

      <Voices items={VOICES} showHeader={false} />

      <ReserveStrip
        heading="Write your own, eventually."
        body="Every one of these started with somebody sitting down for the first time."
      />
    </>
  );
}
