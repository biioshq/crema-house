/**
 * Hand-rolled text splitter.
 *
 * Why not a plugin: this needs to be SSR-safe, revert cleanly on resize, and
 * produce *both* per-line masks and per-character targets from a single pass —
 * which is what lets a headline rise out of a mask while each letter
 * independently un-blurs. It also keeps the accessible name intact: the
 * generated spans are hidden from assistive tech and the original string is
 * restored as an aria-label.
 */

export type SplitOptions = {
  /** Wrap every character in its own inline-block span. */
  chars?: boolean;
  /** Group words into overflow-hidden line masks. */
  lines?: boolean;
};

export type SplitResult = {
  words: HTMLElement[];
  chars: HTMLElement[];
  /** Outer overflow-hidden mask per visual line. */
  lines: HTMLElement[];
  /** Inner block per visual line — animate these, not the masks. */
  lineInners: HTMLElement[];
  revert: () => void;
};

const EMPTY: SplitResult = {
  words: [],
  chars: [],
  lines: [],
  lineInners: [],
  revert: () => {},
};

const makeSpan = (className: string) => {
  const span = document.createElement('span');
  span.className = className;
  return span;
};

/** Collect the text nodes that actually carry visible copy. */
function collectTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent && node.textContent.trim().length > 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

export function splitText(el: HTMLElement, options: SplitOptions = {}): SplitResult {
  if (typeof window === 'undefined' || !el) return EMPTY;

  const { chars = false, lines = true } = options;

  const originalHTML = el.innerHTML;
  const originalLabel = el.getAttribute('aria-label');
  const accessibleText = (el.textContent ?? '').replace(/\s+/g, ' ').trim();

  const words: HTMLElement[] = [];
  const charEls: HTMLElement[] = [];

  // --- 1. Words (and optionally characters) --------------------------------
  for (const textNode of collectTextNodes(el)) {
    const parent = textNode.parentNode;
    if (!parent) continue;

    const fragment = document.createDocumentFragment();
    // Keep whitespace tokens so natural wrapping and spacing survive.
    const tokens = (textNode.textContent ?? '').split(/(\s+)/);

    for (const token of tokens) {
      if (token === '') continue;

      if (/^\s+$/.test(token)) {
        fragment.appendChild(document.createTextNode(token));
        continue;
      }

      const word = makeSpan('split-word');
      // Atomic so a wrapped line can never break *inside* a word once its
      // characters become inline-block.
      word.style.display = 'inline-block';
      word.style.whiteSpace = 'nowrap';

      if (chars) {
        for (const character of Array.from(token)) {
          const charEl = makeSpan('split-char');
          charEl.textContent = character;
          word.appendChild(charEl);
          charEls.push(charEl);
        }
      } else {
        word.textContent = token;
      }

      words.push(word);
      fragment.appendChild(word);
    }

    parent.replaceChild(fragment, textNode);
  }

  // --- 2. Lines ------------------------------------------------------------
  const lineEls: HTMLElement[] = [];
  const lineInners: HTMLElement[] = [];

  // Line grouping relies on measuring siblings, so every word must sit
  // directly on the split root. Nested inline markup opts out gracefully.
  const flat = words.length > 0 && words.every((word) => word.parentNode === el);

  if (lines && flat) {
    const rootTop = el.getBoundingClientRect().top;
    const groups: HTMLElement[][] = [];
    let lastTop = Number.NaN;

    for (const word of words) {
      const top = Math.round(word.getBoundingClientRect().top - rootTop);
      if (Number.isNaN(lastTop) || Math.abs(top - lastTop) > 4) {
        groups.push([]);
        lastTop = top;
      }
      groups[groups.length - 1]!.push(word);
    }

    for (const group of groups) {
      const first = group[0]!;
      const last = group[group.length - 1]!;

      const mask = makeSpan('split-line');
      const inner = makeSpan('split-line-inner');
      inner.style.display = 'block';
      inner.style.willChange = 'transform, opacity';

      el.insertBefore(mask, first);
      mask.appendChild(inner);

      // Move the whole run, whitespace included, into the mask.
      let node: ChildNode | null = first;
      while (node) {
        const next: ChildNode | null = node === last ? null : node.nextSibling;
        inner.appendChild(node);
        node = next;
      }

      lineEls.push(mask);
      lineInners.push(inner);
    }
  }

  // --- 3. Accessibility ----------------------------------------------------
  // The visual markup is decorative; the string lives on the element itself.
  if (accessibleText) {
    el.setAttribute('aria-label', accessibleText);
    for (const child of Array.from(el.children)) {
      child.setAttribute('aria-hidden', 'true');
    }
  }

  return {
    words,
    chars: charEls,
    lines: lineEls,
    lineInners,
    revert: () => {
      el.innerHTML = originalHTML;
      if (originalLabel === null) el.removeAttribute('aria-label');
      else el.setAttribute('aria-label', originalLabel);
    },
  };
}
