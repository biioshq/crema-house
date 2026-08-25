import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reserve } from '@/components/sections/Reserve';

export const metadata: Metadata = {
  title: 'Reservations',
  description:
    'Book a table at Crèma House, Bandra West. Two tables are held back every evening for walk-ins.',
};

export default function ReservePage() {
  return (
    <>
      <PageHeader
        eyebrow="06 — Reservations"
        title="Keep a table."
        numeral="06"
        mode="words-flip"
        lede="Lunch runs from noon, and the last coffee goes out thirty minutes before close. Groups larger than six are best arranged by telephone."
      />

      <Reserve showHeader={false} />
    </>
  );
}
