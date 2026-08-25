export type Voice = {
  readonly quote: string;
  readonly name: string;
  readonly detail: string;
  /** Horizontal offset as a percentage of the card's own width. */
  readonly offset: number;
};

/**
 * Five people, five sentences. Specific beats effusive — none of these
 * would work as a review of anywhere else.
 */
export const VOICES: readonly Voice[] = [
  {
    quote:
      'The only place in the city where nobody asks you to hurry. I have written two chapters at the same table.',
    name: 'Anjali Rao',
    detail: 'Novelist · Tuesdays, 8am',
    offset: -16,
  },
  {
    quote:
      'I asked for a flat white and received a twenty-minute education. Four years later I am still coming back for it.',
    name: 'Devan Mehta',
    detail: 'Architect · Regular since 2021',
    offset: 14,
  },
  {
    quote:
      'The croissant is better than the ones I ate in Paris. I am fully aware of how that sounds.',
    name: 'Priya Nair',
    detail: 'Pastry chef · Sunday mornings',
    offset: -9,
  },
  {
    quote: 'It smells like the inside of a good decision.',
    name: 'Kabir Shah',
    detail: 'Musician · Late afternoons',
    offset: 18,
  },
  {
    quote: 'They remember how I take it. That is the whole review.',
    name: 'Meera Iyer',
    detail: 'Regular since 2016',
    offset: -13,
  },
] as const;
