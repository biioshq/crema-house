import type { ImageKey } from './media';

export type MenuCategory = 'Coffee' | 'Pastry' | 'Dessert' | 'Plate';

export type MenuItem = {
  readonly id: ImageKey;
  readonly name: string;
  readonly category: MenuCategory;
  /** One line. Specific, never florid. */
  readonly note: string;
  /** Rupees. */
  readonly price: number;
  /** Tailwind aspect ratio — deliberately varied so the grid never reads as a template. */
  readonly aspect: string;
};

/**
 * The ten. Ordered as they are read on the bar: coffee, then pastry, then
 * dessert, then plates. The grid fills sequentially, so this order survives
 * every breakpoint.
 */
export const MENU: readonly MenuItem[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    category: 'Coffee',
    note: 'Double ristretto. Cocoa, dried fig, a finish that stays.',
    price: 180,
    aspect: 'aspect-[4/5]',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'Coffee',
    note: 'Six ounces. Dense microfoam, and no cocoa dust.',
    price: 260,
    aspect: 'aspect-square',
  },
  {
    id: 'caramel-latte',
    name: 'Caramel Latte',
    category: 'Coffee',
    note: 'Caramel cooked down for four hours. Burnt sugar, whole milk.',
    price: 310,
    aspect: 'aspect-[5/6]',
  },
  {
    id: 'iced-mocha-frappe',
    name: 'Iced Mocha Frappé',
    category: 'Coffee',
    note: 'Single-origin cacao over a cold-brew base.',
    price: 340,
    aspect: 'aspect-[3/4]',
  },
  {
    id: 'butter-croissant',
    name: 'Butter Croissant',
    category: 'Pastry',
    note: 'Thirty-six hours of lamination. French butter, nothing else.',
    price: 220,
    aspect: 'aspect-square',
  },
  {
    id: 'chocolate-muffin',
    name: 'Chocolate Muffin',
    category: 'Pastry',
    note: 'Seventy per cent couverture, folded in warm.',
    price: 240,
    aspect: 'aspect-[4/5]',
  },
  {
    id: 'classic-tiramisu',
    name: 'Classic Tiramisu',
    category: 'Dessert',
    note: 'Mascarpone, savoiardi, and our own espresso.',
    price: 380,
    aspect: 'aspect-[5/6]',
  },
  {
    id: 'new-york-cheesecake',
    name: 'New York Cheesecake',
    category: 'Dessert',
    note: 'Baked low, rested overnight, served plain.',
    price: 390,
    aspect: 'aspect-square',
  },
  {
    id: 'grilled-chicken-sandwich',
    name: 'Grilled Chicken Sandwich',
    category: 'Plate',
    note: 'Charred thigh, smoked mayonnaise, sourdough.',
    price: 420,
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'veg-club-sandwich',
    name: 'Veg Club Sandwich',
    category: 'Plate',
    note: 'Beetroot, avocado, aged cheddar. Triple stacked.',
    price: 360,
    aspect: 'aspect-[4/3]',
  },
] as const;

/**
 * Split a list into `count` columns, filled in reading order, with any
 * remainder landing in the last column. Flattening the columns back to one
 * on small screens preserves the sequence exactly.
 */
export function toColumns(
  items: readonly MenuItem[],
  count = 3
): readonly (readonly MenuItem[])[] {
  const base = Math.floor(items.length / count);
  const remainder = items.length % count;

  const columns: MenuItem[][] = [];
  let cursor = 0;

  for (let i = 0; i < count; i += 1) {
    // Everything left over goes to the final column.
    const size = base + (i === count - 1 ? remainder : 0);
    columns.push(items.slice(cursor, cursor + size) as MenuItem[]);
    cursor += size;
  }

  return columns;
}

/** The six shown on the home page. */
export const MENU_HIGHLIGHTS = MENU.slice(0, 6);

const INDEX_BY_ID = new Map(MENU.map((item, index) => [item.id, index]));

/**
 * Position on the full menu, looked up by id.
 *
 * Not `MENU.indexOf(item)`: props handed from a Server Component to a Client
 * Component are serialised, so the objects arriving in the client are copies
 * and never identity-equal to this module's own array.
 */
export const menuIndex = (id: MenuItem['id']): number => INDEX_BY_ID.get(id) ?? 0;
