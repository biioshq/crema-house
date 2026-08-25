'use client';

import { useEffect } from 'react';

export type PointerState = {
  /** Viewport pixels. */
  x: number;
  y: number;
  /** Normalised to -1 → 1 from the viewport centre. */
  nx: number;
  ny: number;
  /** False until the pointer has actually moved (and on touch devices). */
  active: boolean;
};

/**
 * A single module-level pointer store rather than per-component state.
 * Parallax layers read this inside their own ticker, so moving the mouse
 * never triggers a React render — which is the difference between silky
 * and janky when eight layers track the cursor at once.
 */
const pointer: PointerState = { x: 0, y: 0, nx: 0, ny: 0, active: false };

let subscribers = 0;

function handleMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = (event.clientY / window.innerHeight) * 2 - 1;
  pointer.active = true;
}

function handleLeave() {
  pointer.active = false;
  pointer.nx = 0;
  pointer.ny = 0;
}

/**
 * Mount anywhere (once, high in the tree) to begin tracking. Returns the
 * shared, stable state object.
 */
export function usePointerTracking(): PointerState {
  useEffect(() => {
    subscribers += 1;
    if (subscribers === 1) {
      window.addEventListener('pointermove', handleMove, { passive: true });
      document.addEventListener('pointerleave', handleLeave);
    }
    return () => {
      subscribers -= 1;
      if (subscribers === 0) {
        window.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerleave', handleLeave);
      }
    };
  }, []);

  return pointer;
}

/** Read-only access for components that do not want to own the listener. */
export const getPointer = (): PointerState => pointer;
